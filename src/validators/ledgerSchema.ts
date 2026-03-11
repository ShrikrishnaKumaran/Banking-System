import { z } from 'zod';

const accountNumber = z
  .string()
  .regex(/^\d{12}$/, 'Must be a valid 12-digit account number');

// External deposit into an account
export const ExternalDepositSchema = z.object({
  accountNumber: accountNumber,
  amount: z
    .number()
    .int('Amount must be an integer (paise)')
    .positive('Amount must be at least 1 paise'),
  description: z
    .string()
    .max(255, 'Description must be 255 characters or fewer')
    .trim()
    .optional(),
});

export type ExternalDepositInput = z.infer<typeof ExternalDepositSchema>;

// External withdrawal from an account
export const ExternalWithdrawalSchema = z.object({
  accountNumber: accountNumber,
  amount: z
    .number()
    .int('Amount must be an integer (paise)')
    .positive('Amount must be at least 1 paise'),
  description: z
    .string()
    .max(255, 'Description must be 255 characters or fewer')
    .trim()
    .optional(),
});

export type ExternalWithdrawalInput = z.infer<typeof ExternalWithdrawalSchema>;
