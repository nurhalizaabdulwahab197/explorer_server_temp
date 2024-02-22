// block.service.ts

import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { BlockModel } from '@components/block/block.model';
import { IBlock } from '@components/block/block.interface';

const create = async (blockData: IBlock): Promise<boolean> => {
  try {
    const newBlock = await BlockModel.create(blockData);
    logger.debug(`Block created: %O`, newBlock);
    return true;
  } catch (err) {
    logger.error(`Block create err: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Block was not created!');
  }
};

const read = async (blockNumber: number): Promise<IBlock> => {
  logger.debug(`Sent block.number ${blockNumber}`);
  const block = await BlockModel.findOne({ number: blockNumber });
  return block as IBlock;
};

const readByHash = async (blockHash: string): Promise<IBlock> => {
  logger.debug(`Sent block.hash ${blockHash}`);
  const block = await BlockModel.findOne({ hash: blockHash });
  return block as IBlock;
};
const getLatestList = async (): Promise<IBlock[]> => {
  const blocks: IBlock[] = await BlockModel.aggregate([
    { $sort: { timestamp: -1 } },
    { $limit: 10 },
  ]);
  return blocks;
};

// Function to get the last synced block number
const getLastSyncedBlock = async (): Promise<number> => {
  // Find the highest block number in your database
  const lastBlock = await BlockModel.findOne().sort({ number: -1 });
  return lastBlock ? lastBlock.number : 0; // Return '0' if no blocks are saved
};

// Function to set the last synced block number
const setLastSyncedBlock = async (blockNumber: number): Promise<void> => {
  // You might implement this as part of the saveBlock function,
  // or as a separate function if you're storing this elsewhere.
};

export { create, read, readByHash, getLatestList, getLastSyncedBlock, setLastSyncedBlock };
