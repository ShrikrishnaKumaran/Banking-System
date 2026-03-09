import { z } from 'zod';

// Minimum age check: must be 18+
const minAge = (date: Date) => {
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return date <= eighteenYearsAgo;
};

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address'),
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
  panId: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format ABCDE1234F'),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;