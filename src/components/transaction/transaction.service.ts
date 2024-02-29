import logger from '@core/utils/logger';
import { ITransaction } from './transaction.interface';
import { TransactionModel } from './transaction.model';

const read = async (): Promise<ITransaction[]> => {
  try {
    const transactions: ITransaction[] = await TransactionModel.aggregate([
      { $sort: { timestamp: -1 } },
    ]);
    return transactions;
  } catch (error) {
    logger.error('Error occurred while reading transactions:', error);
    throw error;
  }
};

const readByHashId = async (hashId: String): Promise<ITransaction> => {
  const transaction = await TransactionModel.findOne({ hash: hashId });
  return transaction as ITransaction;
};

const getLatestList = async (): Promise<ITransaction[]> => {
  const blocks: ITransaction[] = await TransactionModel.aggregate([
    { $sort: { timestamp: -1 } },
    { $limit: 10 },
  ]);
  return blocks;
};

const readTransactionByPage = async (transaction: number): Promise<ITransaction[]> => {
  try {
    const pageSize = 10;
    const skipCount = (transaction - 1) * pageSize;
    const pageBlock: ITransaction[] = await TransactionModel.find()
      .sort({ timestamp: -1 })
      .skip(skipCount)
      .limit(pageSize);

    return pageBlock;
  } catch (error) {
    console.error('Error while reading the transactions:', error);
    throw error;
  }
};

const readNextTransactionByHashId = async (hashId: String): Promise<ITransaction> => {
  const currentTransaction = await TransactionModel.findOne({ hash: hashId });
  // eslint-disable-next-line no-underscore-dangle
  const nextTransaction = await TransactionModel.findOne({ _id: { $gt: currentTransaction._id } })
    .sort({ _id: 1 }) // Sort by _id in ascending order (insertion order)
    .limit(1); // Limit to the next transaction

  return nextTransaction as ITransaction;
};

const retrievePreviousTransactionsByHashId = async (hashId: String): Promise<ITransaction> => {
  const currentTransaction = await TransactionModel.findOne({ hash: hashId });
  const previousTransaction = await TransactionModel.findOne({
    timestamp: { $lt: currentTransaction.timestamp }, // Find transactions with timestamp less than current
  })
    .sort({ timestamp: -1 }) // Sort by _id in ascending order (insertion order)
    .limit(1); // Limit to the next transaction

  return previousTransaction as ITransaction;
};

export {
  getLatestList,
  read,
  readByHashId,
  readTransactionByPage,
  readNextTransactionByHashId,
  retrievePreviousTransactionsByHashId,
};
