import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import {
  createAccount as createAccountService,
  getUserAccounts,
  getAccountBalance as getAccountBalanceService,
  getAccountDetails as getAccountDetailsService,
  getTransactionHistory,
} from '../services/accountService';
import { TransactionHistoryQuerySchema } from '../validators/accountSchema';

export const createAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const account = await createAccountService(firebaseUid);

    res.status(201).json({
      message: 'Account created successfully',
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        status: account.status,
        createdAt: account.createdAt,
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

export const listAccounts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const accounts = await getUserAccounts(firebaseUid);

    res.status(200).json({
      message: 'Accounts retrieved successfully',
      accounts: accounts.map((acc) => ({
        id: acc._id,
        accountNumber: acc.accountNumber,
        status: acc.status,
        balance: acc.balance,
        createdAt: acc.createdAt,
      })),
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const getAccountBalance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const accountId = req.params.accountId as string;
    const result = await getAccountBalanceService(firebaseUid, accountId);

    res.status(200).json({
      message: 'Balance retrieved successfully',
      ...result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const getAccountDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const accountId = req.params.accountId as string;
    const result = await getAccountDetailsService(firebaseUid, accountId);

    res.status(200).json({
      message: 'Account details retrieved successfully',
      account: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const getAccountTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const accountId = req.params.accountId as string;

    // Validate query params
    const queryResult = TransactionHistoryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: queryResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await getTransactionHistory(firebaseUid, accountId, queryResult.data);

    res.status(200).json({
      message: 'Transaction history retrieved successfully',
      ...result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};
