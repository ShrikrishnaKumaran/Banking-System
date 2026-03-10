import mongoose from 'mongoose';
import Account from '../models/account';
import Transaction, { TransactionStatus } from '../models/transaction';
import Ledger, { LedgerEntryType, LedgerSource } from '../models/ledger';
import User from '../models/user';
import { TransferInput } from '../validators/transactionSchema';

export const transferFunds = async (
  firebaseUid: string,
  input: TransferInput,
) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  // Check idempotency — return existing transaction if already processed
  const existingTxn = await Transaction.findOne({ idempotencyKey: input.idempotencyKey });
  if (existingTxn) {
    return existingTxn;
  }

  // Validate source account belongs to authenticated user and is ACTIVE
  const sourceAccount = await Account.findOne({ _id: input.sourceAccountId, userId: user._id });
  if (!sourceAccount) {
    throw Object.assign(new Error('Source account not found'), { statusCode: 404 });
  }
  if (sourceAccount.status !== 'ACTIVE') {
    throw Object.assign(new Error('Source account is not active'), { statusCode: 400 });
  }

  // Validate destination account exists and is ACTIVE
  const destAccount = await Account.findById(input.destinationAccountId);
  if (!destAccount) {
    throw Object.assign(new Error('Destination account not found'), { statusCode: 404 });
  }
  if (destAccount.status !== 'ACTIVE') {
    throw Object.assign(new Error('Destination account is not active'), { statusCode: 400 });
  }

  // Check sufficient balance via ledger aggregation
  const balanceResult = await Ledger.aggregate([
    { $match: { accountId: sourceAccount._id } },
    { $group: { _id: null, balance: { $sum: '$amount' } } },
  ]);
  const currentBalance = balanceResult[0]?.balance || 0;
  if (currentBalance < input.amount) {
    throw Object.assign(new Error('Insufficient balance'), { statusCode: 400 });
  }

  // Execute transfer atomically within a MongoDB transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [transaction] = await Transaction.create(
      [
        {
          sourceAccountId: input.sourceAccountId,
          destinationAccountId: input.destinationAccountId,
          amount: input.amount,
          status: TransactionStatus.SETTLED,
          idempotencyKey: input.idempotencyKey,
          note: input.note,
        },
      ],
      { session },
    );

    await Ledger.create(
      [
        {
          accountId: input.sourceAccountId,
          amount: -input.amount,
          type: LedgerEntryType.DEBIT,
          source: LedgerSource.TRANSFER,
          description: `Transfer to ${destAccount.accountNumber}`,
        },
        {
          accountId: input.destinationAccountId,
          amount: input.amount,
          type: LedgerEntryType.CREDIT,
          source: LedgerSource.TRANSFER,
          description: `Transfer from ${sourceAccount.accountNumber}`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
