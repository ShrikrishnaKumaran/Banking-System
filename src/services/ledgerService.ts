import Account from '../models/account';
import Ledger, { LedgerEntryType, LedgerSource } from '../models/ledger';
import User from '../models/user';
import { ExternalDepositInput, ExternalWithdrawalInput } from '../validators/ledgerSchema';

export const externalDeposit = async (
  firebaseUid: string,
  input: ExternalDepositInput,
) => {
  const account = await getVerifiedAccount(firebaseUid, input.accountNumber);

  const ledgerEntry = await Ledger.create({
    accountId: account._id,
    amount: input.amount,
    type: LedgerEntryType.CREDIT,
    source: LedgerSource.EXTERNAL,
    description: input.description || 'External deposit',
  });

  return ledgerEntry;
};

export const externalWithdrawal = async (
  firebaseUid: string,
  input: ExternalWithdrawalInput,
) => {
  const account = await getVerifiedAccount(firebaseUid, input.accountNumber);

  // Check sufficient balance
  const balanceResult = await Ledger.aggregate([
    { $match: { accountId: account._id } },
    { $group: { _id: null, balance: { $sum: '$amount' } } },
  ]);
  const currentBalance = balanceResult[0]?.balance || 0;
  if (currentBalance < input.amount) {
    throw Object.assign(new Error('Insufficient balance'), { statusCode: 400 });
  }

  const ledgerEntry = await Ledger.create({
    accountId: account._id,
    amount: -input.amount,
    type: LedgerEntryType.DEBIT,
    source: LedgerSource.EXTERNAL,
    description: input.description || 'External withdrawal',
  });

  return ledgerEntry;
};

// Helper: verify account exists, belongs to user, and is ACTIVE
const getVerifiedAccount = async (firebaseUid: string, accountNumber: string) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const account = await Account.findOne({ accountNumber, userId: user._id });
  if (!account) {
    throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  }

  if (account.status !== 'ACTIVE') {
    throw Object.assign(new Error('Account is not active'), { statusCode: 400 });
  }

  return account;
};
