import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { TransactionModel } from '@components/transaction/transaction.model';

class TransactionService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 30000; // Poll every 30 seconds
  }

  startPolling() {
    setInterval(() => this.detectAndSaveTransactions(), this.pollingInterval);
  }

  async detectAndSaveTransactions() {
    try {
      // Fetch latest block
      const latestBlockNumber = await this.web3.eth.getBlockNumber();
      const latestBlock = await this.web3.eth.getBlock(latestBlockNumber, true);

      if (!latestBlock || !latestBlock.transactions) {
        logger.info('No transactions found in the latest block.');
        return;
      }

      // Process transactions in the latest block
      // eslint-disable-next-line no-restricted-syntax
      for (const tx of latestBlock.transactions) {
        if (typeof tx !== 'string') {
          const transactionData = {
            hash: tx.hash,
            block: Number(latestBlock.number),
            senderAddress: tx.from,
            amount: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            receiverAddress: tx.to,
            value: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            gasPrice: Number(this.web3.utils.fromWei(tx.gasPrice.toString(), 'gwei')),
            gasLimit: Number(tx.gasLimit) || 0, // Ensure gasLimit is a number, defaulting to 0 if undefined
            gasUsed: Number(tx.gas),
            gasFees: Number(this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')),
            timestamp: new Date(Number(latestBlock.timestamp) * 1000),
            transactionFee: Number(
              this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')
            ), // Provide a default value for transactionFee
            // Add other relevant transaction data here
          };
          // eslint-disable-next-line no-await-in-loop
          await TransactionModel.create(transactionData);
          logger.info(`Transaction saved: ${tx.hash}`);
        }
      }
    } catch (error) {
      logger.error('Error detecting and saving transactions:', error);
    }
  }
}

export default new TransactionService();
