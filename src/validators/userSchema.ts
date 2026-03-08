import { z } from 'zod';

// Minimum age check: must be 18+
const minAge = (date: Date) => {
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return date <= eighteenYearsAgo;
};

// 1. BASE schema — single source of truth for all field rules
const BaseUserSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Invalid email address'),
  phone: z.object({
    countryCode: z
      .string()
      .regex(/^\+\d{1,4}$/, 'Country code must be in E.164 format (e.g. +91)'),
    number: z
      .string()
      .regex(/^\d{7,12}$/, 'Phone number must be 7-12 digits'),
  }),
  transactionPin: z.string().regex(/^\d{4,6}$/, 'Transaction PIN must be 4-6 digits'),
  legalName: z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
  }),
  dateOfBirth: z
    .string()
    .date()
    .transform((val) => new Date(val))
    .refine(minAge, 'Must be at least 18 years old'),
  address: z.object({
    street: z.string().min(1, 'Street is required').trim(),
    city: z.string().min(1, 'City is required').trim(),
    state: z.string().min(1, 'State is required').trim(),
    postalCode: z.string().min(1, 'Postal code is required').trim(),
    country: z.string().min(1, 'Country is required').trim(),
  }),
  panId: z.string().min(1, 'PAN ID is required'),
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FROZEN']),
  isActive: z.boolean(),
});

// 2. CREATE schema — for user creation, all fields required
export const CreateUserSchema = BaseUserSchema;