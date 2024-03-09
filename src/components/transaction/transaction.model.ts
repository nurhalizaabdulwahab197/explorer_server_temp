// transaction.model.ts

import mongoose from 'mongoose';
import { ITransaction } from './transaction.interface';

// Define the schema for a transaction
const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    hash: { type: String, required: true, unique: true },
    block: { type: Number, required: true },
    senderAddress: { type: String, required: true },
    amount: { type: Number, required: true },
    receiverAddress: { type: String, required: true },
    contractAddress: { type: String, required: true },
    status: { type: String, required: true },
    value: { type: Number, required: true },
    gasPrice: { type: Number, required: true },
    transactionFee: { type: Number, required: true },
    gasLimit: { type: Number, required: true },
    gasUsed: { type: Number, required: true },
    gasFees: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    maxFeePerGas: { type: Number, required: true },
    maxPriorityFeePerGas: { type: Number, required: true },
    baseFeePerGas: { type: Number, required: true },
    // ... any other properties you want to include
  },
  { timestamps: true }
);

// Create the model from the schema
const TransactionModel = mongoose.model<ITransaction>('Transaction', transactionSchema);

// eslint-disable-next-line import/prefer-default-export
export { TransactionModel };
