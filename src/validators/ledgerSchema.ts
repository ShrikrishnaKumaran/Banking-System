import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/, 'Must be a valid 24-char hex ObjectId');

// Base Ledger schema — entries are immutable (append-only)
export const BaseLedgerSchema = z.object({
  transactionId: objectId,

  accountId: objectId,

  // Signed amount: DEBIT → negative, CREDIT → positive
  amount: z
    .number()
    .int('Amount must be an integer (paise)')
    .refine((v) => v !== 0, 'Amount cannot be zero'),

  type: z.enum(['DEBIT', 'CREDIT'], {
    message: 'Type must be DEBIT or CREDIT',
  }),
}).refine(
  (data) =>
    (data.type === 'DEBIT' && data.amount < 0) ||
    (data.type === 'CREDIT' && data.amount > 0),
  'DEBIT amount must be negative, CREDIT amount must be positive',
);

export type BaseLedgerInput = z.infer<typeof BaseLedgerSchema>;
