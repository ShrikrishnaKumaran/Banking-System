import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import {
  externalDeposit as externalDepositService,
  externalWithdrawal as externalWithdrawalService,
} from '../services/ledgerService';

export const deposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const entry = await externalDepositService(firebaseUid, req.body);

    res.status(201).json({
      message: 'Deposit successful',
      ledgerEntry: {
        id: entry._id,
        accountId: entry.accountId,
        amount: entry.amount,
        type: entry.type,
        source: entry.source,
        description: entry.description,
        createdAt: entry.createdAt,
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

export const withdraw = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const entry = await externalWithdrawalService(firebaseUid, req.body);

    res.status(201).json({
      message: 'Withdrawal successful',
      ledgerEntry: {
        id: entry._id,
        accountId: entry.accountId,
        amount: entry.amount,
        type: entry.type,
        source: entry.source,
        description: entry.description,
        createdAt: entry.createdAt,
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
