import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  userName: string;
  email: string;
  passwordHash: string;
  transactionPinHash: string;
  legalName: {
    firstName: string;
    lastName: string;
  };
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  panId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    transactionPinHash: {
      type: String,
      required: true,
    },
    legalName: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    panId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;