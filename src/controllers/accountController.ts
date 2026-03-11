import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import * as accountService from '../services/accountService';
import { TransactionHistoryQuerySchema } from '../validators/accountSchema';

export const createAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const { account, userName } = await accountService.createAccount(firebaseUid);

    res.status(201).json({
      message: 'Account created successfully',
      account: {
        id: account._id,
        userName,
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
    const accounts = await accountService.getUserAccounts(firebaseUid);

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
    const accountNumber = req.params.accountNumber as string;
    const result = await accountService.getAccountBalance(firebaseUid, accountNumber);

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
    const accountNumber = req.params.accountNumber as string;
    const result = await accountService.getAccountDetails(firebaseUid, accountNumber);

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
    const accountNumber = req.params.accountNumber as string;

    // Validate query params
    const queryResult = TransactionHistoryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: queryResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await accountService.getTransactionHistory(firebaseUid, accountNumber, queryResult.data);

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

export const updateAccountStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { firebaseUid } = req.user!;
    const accountNumber = req.params.accountNumber as string;
    const account = await accountService.updateAccountStatus(firebaseUid, accountNumber, req.body);

    res.status(200).json({
      message: 'Account status updated successfully',
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        status: account.status,
        updatedAt: account.updatedAt,
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
