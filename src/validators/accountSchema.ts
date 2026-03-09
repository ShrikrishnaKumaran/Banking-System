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
