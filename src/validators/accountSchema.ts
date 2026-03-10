import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/, 'Must be a valid 24-char hex ObjectId');

// Base Account schema — derive API-specific schemas via .pick() / .omit()
export const BaseAccountSchema = z.object({
  userId: objectId,

  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .trim(),

  status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED'], {
    message: 'Status must be ACTIVE, FROZEN, or CLOSED',
  }),
});

export type BaseAccountInput = z.infer<typeof BaseAccountSchema>;

// Create account — no body needed, account is auto-generated for the authenticated user
export const CreateAccountSchema = z.object({});

// Get transaction history — query params validation
export const TransactionHistoryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive('Page must be a positive integer')),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100, 'Limit must be between 1 and 100')),
  range: z
    .enum(['7d', '30d', 'custom'], { message: 'Range must be 7d, 30d, or custom' })
    .optional()
    .default('30d'),
  startDate: z
    .string()
    .datetime({ message: 'startDate must be a valid ISO 8601 date' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'endDate must be a valid ISO 8601 date' })
    .optional(),
}).refine(
  (data) => {
    if (data.range === 'custom') {
      return !!data.startDate && !!data.endDate;
    }
    return true;
  },
  { message: 'startDate and endDate are required when range is "custom"', path: ['startDate'] },
);

export type TransactionHistoryQuery = z.infer<typeof TransactionHistoryQuerySchema>;

// Update account status
export const UpdateAccountStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED'], {
    message: 'Status must be ACTIVE, FROZEN, or CLOSED',
  }),
});

export type UpdateAccountStatusInput = z.infer<typeof UpdateAccountStatusSchema>;
