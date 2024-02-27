import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { ITransaction } from '@components/transaction/transaction.interface';
import { TransactionModel } from '@components/transaction/transaction.model';
import { timeStamp } from 'console';

const retrieveTransactionLists = async (address: string): Promise<ITransaction[]> => {
  try {
    // Use the TransactionModel to find all transactions with the specified address as either sender or receiver
    const transactions: ITransaction[] = await TransactionModel.find({
      $or: [{ senderAddress: address }, { receiverAddress: address }],
    }).sort({ timestamp: -1 });
    return transactions;
  } catch (error) {
    // If an error occurs during the database query, log the error and rethrow it
    logger.error('Error occurred while reading transactions:', error);
    throw error;
  }
};

const retrieveBalanceETH = async (address: string): Promise<string> => {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));

  return new Promise((resolve, reject) => {
    web3.eth
      .getBalance(address)
      .then((balance) => {
        const balanceInEther = web3.utils.fromWei(balance, 'ether');
        logger.info(`Balance of ${address}: ${balanceInEther} ETH`);
        resolve(balanceInEther);
      })
      .catch((error) => {
        logger.error('Error fetching balance:', error);
        reject(error);
      });
  });
};

export { retrieveTransactionLists, retrieveBalanceETH };
