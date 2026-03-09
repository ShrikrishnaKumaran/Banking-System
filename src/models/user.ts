import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
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
  panIdHash: string;
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      countryCode: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+\d{1,4}$/, 'Country code must be in E.164 format (e.g. +91)'],
      },
      number: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{7,12}$/, 'Phone number must be 7-12 digits'],
      },
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
    panIdHash: {
      type: String,
      required: true,
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