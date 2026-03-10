import bcrypt from 'bcrypt';
import User, { IUser } from '../models/user';
import { RegisterUserInput, LoginUserInput } from '../validators/userSchema';
import { firebaseAuth } from '../config/firebase';

const SALT_ROUNDS = 10;

export const registerUser = async (
  firebaseUid: string,
  input: RegisterUserInput,
): Promise<IUser> => {
  // Check if user already exists by firebaseUid or email
  const existing = await User.findOne({
    $or: [{ firebaseUid }, { email: input.email }],
  });
  if (existing) {
    throw Object.assign(new Error('User already registered'), { statusCode: 409 });
  }

  // Check duplicate PAN
  const existingPan = await User.findOne({ panId: input.panId });
  if (existingPan) {
    throw Object.assign(new Error('PAN ID is already registered'), { statusCode: 409 });
  }

  const [passwordHash, transactionPinHash] = await Promise.all([
    bcrypt.hash(input.password, SALT_ROUNDS),
    bcrypt.hash(input.transactionPin, SALT_ROUNDS),
  ]);

  const user = await User.create({
    firebaseUid,
    userName: input.userName,
    email: input.email,
    passwordHash,
    transactionPinHash,
    legalName: input.legalName,
    dateOfBirth: input.dateOfBirth,
    address: input.address,
    panId: input.panId,
    isActive: true,
  });

  return user;
};

export const loginUser = async (firebaseUid: string, tokenEmail: string | undefined, input: LoginUserInput): Promise<IUser> => {
  // Validate that the email in the request body matches the Firebase token email
  if (!tokenEmail || tokenEmail !== input.email) {
    throw Object.assign(new Error('Email does not match authenticated user'), { statusCode: 401 });
  }

  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found. Please register first.'), { statusCode: 404 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account is deactivated. Contact support.'), { statusCode: 403 });
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw Object.assign(new Error('Invalid password'), { statusCode: 401 });
  }

  return user;
};

export const logoutUser = async (firebaseUid: string): Promise<void> => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  // Revoke all refresh tokens for this user in Firebase
  // This invalidates all existing sessions
  await firebaseAuth.revokeRefreshTokens(firebaseUid);
};
