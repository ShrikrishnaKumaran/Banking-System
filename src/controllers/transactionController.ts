import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { transferFunds } from '../services/transactionService';

export const transfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const transaction = await transferFunds(firebaseUid, req.body);

    res.status(201).json({
      message: 'Transfer completed successfully',
      transaction: {
        id: transaction._id,
        sourceAccountId: transaction.sourceAccountId,
        destinationAccountId: transaction.destinationAccountId,
        amount: transaction.amount,
        status: transaction.status,
        idempotencyKey: transaction.idempotencyKey,
        note: transaction.note,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};
