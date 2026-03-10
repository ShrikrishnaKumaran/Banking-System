import mongoose, { Schema, Document, Types } from 'mongoose';

export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum LedgerSource {
  TRANSFER = 'TRANSFER',
  EXTERNAL = 'EXTERNAL',
}

export interface ILedger extends Document {
  accountId: Types.ObjectId;
  amount: number;
  type: LedgerEntryType;
  source: LedgerSource;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ledgerSchema = new Schema<ILedger>(
  {
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
    source: {
      type: String,
      enum: Object.values(LedgerSource),
      required: true,
    },
    description: {
      type: String,
      maxlength: 255,
    },
  },
  {
    timestamps: true, // Immutable: never update or delete, only create
  },
);

const Ledger = mongoose.model<ILedger>('Ledger', ledgerSchema);

export default Ledger;
