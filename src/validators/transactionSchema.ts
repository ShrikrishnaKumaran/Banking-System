import { z } from 'zod';

const accountNumber = z
  .string()
  .regex(/^\d{12}$/, 'Must be a valid 12-digit account number');

// Transfer money from authenticated user's account to another user's account
export const TransferSchema = z.object({
  sourceAccountNumber: accountNumber,
  destinationAccountNumber: accountNumber,
  amount: z
    .number()
    .int('Amount must be an integer (paise)')
    .positive('Amount must be at least 1 paise'),
  idempotencyKey: z
    .string()
    .uuid('Idempotency key must be a valid UUID')
    .trim(),
  note: z
    .string()
    .max(255, 'Note must be 255 characters or fewer')
    .trim()
    .optional(),
}).refine(
  (data) => data.sourceAccountNumber !== data.destinationAccountNumber,
  { message: 'Source and destination accounts must be different', path: ['destinationAccountNumber'] },
);

export type TransferInput = z.infer<typeof TransferSchema>;
