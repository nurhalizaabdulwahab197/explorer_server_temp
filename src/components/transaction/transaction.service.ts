import logger from '@core/utils/logger';
import { ITransaction } from './transaction.interface';
import { TransactionModel } from './transaction.model';

const read = async (): Promise<ITransaction[]> => {
  try {
    const transactions: ITransaction[] = await TransactionModel.find();
    return transactions;
  } catch (error) {
    logger.error('Error occurred while reading transactions:', error);
    throw error;
  }
};

const readByHashId = async (hashId: String): Promise<ITransaction> => {
  logger.debug(`Sent user.id ${hashId}`);
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




// eslint-disable-next-line import/prefer-default-export
export { getLatestList, read, readByHashId };

