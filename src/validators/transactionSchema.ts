import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/, 'Must be a valid 24-char hex ObjectId');

// Transfer money from authenticated user's account to another user's account
export const TransferSchema = z.object({
  sourceAccountId: objectId,
  destinationAccountId: objectId,
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
  (data) => data.sourceAccountId !== data.destinationAccountId,
  { message: 'Source and destination accounts must be different', path: ['destinationAccountId'] },
);

export type TransferInput = z.infer<typeof TransferSchema>;
