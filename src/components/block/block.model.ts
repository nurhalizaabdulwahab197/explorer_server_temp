// block.model.ts

import mongoose from 'mongoose';
import { IBlock } from './block.interface';

// Define the schema for a block
const blockSchema = new mongoose.Schema<IBlock>(
  {
    number: { type: Number, required: true, unique: true },
    hash: { type: String, required: true, unique: true },
    parentHash: { type: String, required: true },
    nonce: { type: Number, required: false }, // Nonce might be not present in PoA
    sha3Uncles: { type: String, required: true },
    transactions: [{ type: String }], // Array of transaction hashes
    miner: { type: String, required: true },
    difficulty: { type: Number, required: true },
    totalDifficulty: { type: Number, required: true },
    size: { type: Number, required: true },
    extraData: { type: String, required: true },
    gasLimit: { type: Number, required: true },
    gasUsed: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    // ... any other properties you want to include
  },
  { timestamps: true }
);

// Create the model from the schema
const BlockModel = mongoose.model<IBlock>('Block', blockSchema);

// eslint-disable-next-line import/prefer-default-export
export { BlockModel };
