import mongoose, { Schema, Document, Types } from 'mongoose';

export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export interface ILedger extends Document {
  transactionId: Types.ObjectId;
  accountId: Types.ObjectId;
  amount: number;
  type: LedgerEntryType;
  createdAt: Date;
  updatedAt: Date;
}

const ledgerSchema = new Schema<ILedger>(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(LedgerEntryType),
      required: true,
    },
  },
  {
    timestamps: true, // Immutable: never update or delete, only create
  },
);

const Ledger = mongoose.model<ILedger>('Ledger', ledgerSchema);

export default Ledger;
