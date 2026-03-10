import crypto from 'crypto';
import mongoose from 'mongoose';
import Account, { AccountStatus, IAccount } from '../models/account';
import Ledger from '../models/ledger';
import Transaction from '../models/transaction';
import User from '../models/user';
import { TransactionHistoryQuery, UpdateAccountStatusInput } from '../validators/accountSchema';

// Generate a unique 12-digit account number
const generateAccountNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomInt(100000, 999999).toString();
  return timestamp + random;
};

export const createAccount = async (firebaseUid: string) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  // Check if user already has an active account
  const existingAccount = await Account.findOne({
    userId: user._id,
    status: 'ACTIVE',
  });
  if (existingAccount) {
    throw Object.assign(new Error('User already has an active account'), { statusCode: 409 });
  }

  const account = await Account.create({
    userId: user._id,
    accountNumber: generateAccountNumber(),
    status: 'ACTIVE',
  });

  return { account, userName: user.userName };
};

export const getUserAccounts = async (firebaseUid: string) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  // Get all accounts with their computed balance from ledger
  const accounts = await Account.aggregate([
    { $match: { userId: user._id } },
    { $sort: { createdAt: -1 as const } },
    {
      $lookup: {
        from: 'ledgers',
        localField: '_id',
        foreignField: 'accountId',
        as: 'ledgerEntries',
      },
    },
    {
      $addFields: {
        balance: { $sum: '$ledgerEntries.amount' },
      },
    },
    {
      $project: {
        ledgerEntries: 0,
      },
    },
  ]);

  return accounts;
};

export const getAccountBalance = async (
  firebaseUid: string,
  accountId: string,
) => {
  const account = await getVerifiedAccount(firebaseUid, accountId);

  const result = await Ledger.aggregate([
    { $match: { accountId: account._id } },
    {
      $group: {
        _id: null,
        balance: { $sum: '$amount' },
        totalCredits: {
          $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] },
        },
        totalDebits: {
          $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] },
        },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        balance: 1,
        totalCredits: 1,
        totalDebits: 1,
        transactionCount: 1,
      },
    },
  ]);

  const summary = result[0] || { balance: 0, totalCredits: 0, totalDebits: 0, transactionCount: 0 };

  return { accountNumber: account.accountNumber, ...summary };
};

export const getAccountDetails = async (
  firebaseUid: string,
  accountId: string,
) => {
  const account = await getVerifiedAccount(firebaseUid, accountId);

  // Single pipeline: account info + balance + recent transactions
  const result = await Account.aggregate([
    { $match: { _id: account._id } },
    // Join ledger to compute balance
    {
      $lookup: {
        from: 'ledgers',
        localField: '_id',
        foreignField: 'accountId',
        as: 'ledgerEntries',
      },
    },
    {
      $addFields: {
        balance: { $sum: '$ledgerEntries.amount' },
      },
    },
    // Join recent transactions (last 5)
    {
      $lookup: {
        from: 'transactions',
        let: { accId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$sourceAccountId', '$$accId'] },
                  { $eq: ['$destinationAccountId', '$$accId'] },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 as const } },
          { $limit: 5 },
          { $project: { idempotencyKey: 0 } },
        ],
        as: 'recentTransactions',
      },
    },
    {
      $project: {
        ledgerEntries: 0,
      },
    },
  ]);

  if (!result.length) {
    throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  }

  return result[0];
};

export const getTransactionHistory = async (
  firebaseUid: string,
  accountId: string,
  query: TransactionHistoryQuery,
) => {
  const account = await getVerifiedAccount(firebaseUid, accountId);

  // Build date filter
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (query.range === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (query.range === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(query.startDate!);
    endDate = new Date(query.endDate!);
  }

  const accountObjectId = account._id as mongoose.Types.ObjectId;
  const skip = (query.page - 1) * query.limit;

  // Single aggregation with $facet for data + metadata in one round-trip
  const result = await Transaction.aggregate([
    {
      $match: {
        $or: [
          { sourceAccountId: accountObjectId },
          { destinationAccountId: accountObjectId },
        ],
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $facet: {
        transactions: [
          { $sort: { createdAt: -1 as const } },
          { $skip: skip },
          { $limit: query.limit },
          // Add a direction field relative to this account
          {
            $addFields: {
              direction: {
                $cond: [
                  { $eq: ['$sourceAccountId', accountObjectId] },
                  'OUTGOING',
                  'INCOMING',
                ],
              },
            },
          },
        ],
        metadata: [
          { $count: 'total' },
        ],
      },
    },
  ]);

  const transactions = result[0]?.transactions || [];
  const total = result[0]?.metadata[0]?.total || 0;

  return {
    transactions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

// Helper: verify account exists and belongs to the authenticated user
const getVerifiedAccount = async (
  firebaseUid: string,
  accountId: string,
): Promise<IAccount> => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw Object.assign(new Error('Invalid account ID'), { statusCode: 400 });
  }

  const account = await Account.findOne({ _id: accountId, userId: user._id });
  if (!account) {
    throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  }

  return account;
};

export const updateAccountStatus = async (
  firebaseUid: string,
  accountId: string,
  input: UpdateAccountStatusInput,
): Promise<IAccount> => {
  const account = await getVerifiedAccount(firebaseUid, accountId);

  if (account.status === input.status) {
    throw Object.assign(new Error(`Account is already ${input.status}`), { statusCode: 400 });
  }

  if (account.status === 'CLOSED') {
    throw Object.assign(new Error('Cannot change status of a closed account'), { statusCode: 400 });
  }

  account.status = input.status as AccountStatus;
  await account.save();

  return account;
};
