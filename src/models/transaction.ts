import mongoose, { Schema, Document, Types } from 'mongoose';

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
}

export interface ITransaction extends Document {
  sourceAccountId: Types.ObjectId | null;
  destinationAccountId: Types.ObjectId | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  idempotencyKey: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    sourceAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      index: true,
    },
    destinationAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1 paise'],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    note: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
