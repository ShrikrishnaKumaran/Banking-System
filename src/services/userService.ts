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
  const panIdHash = await bcrypt.hash(input.panId, SALT_ROUNDS);
  // For duplicate detection, we can't use bcrypt (salted). Use a findOne after create
  // or switch PAN to a unique index. For now, hash both with bcrypt.

  const transactionPinHash = await bcrypt.hash(input.transactionPin, SALT_ROUNDS);

  const user = await User.create({
    firebaseUid,
    email: input.email,
    transactionPinHash,
    legalName: input.legalName,
    dateOfBirth: input.dateOfBirth,
    address: input.address,
    panIdHash,
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
