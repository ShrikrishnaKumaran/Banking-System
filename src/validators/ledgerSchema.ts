import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/, 'Must be a valid 24-char hex ObjectId');

// External deposit into an account
export const ExternalDepositSchema = z.object({
  accountId: objectId,
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
  accountId: objectId,
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
