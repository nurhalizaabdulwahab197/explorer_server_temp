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

      console.log(latestBlock);
      // Process transactions in the latest block
      // eslint-disable-next-line consistent-return
      const transactionPromises = latestBlock.transactions.map(async (tx) => {
        if (typeof tx !== 'string') {
          const transaction = await this.web3.eth.getTransactionReceipt(tx.hash);
          console.log(transaction);
          const transactionData = {
            hash: tx.hash,
            block: Number(latestBlock.number),
            senderAddress: tx.from,
            amount: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            receiverAddress: tx.to || 'null',
            contractAddress: transaction.contractAddress || 'null',
            status: transaction.status,
            value: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            gasPrice: Number(this.web3.utils.fromWei(tx.gasPrice.toString(), 'gwei')),
            gasLimit: Number(tx.gas),
            gasUsed: Number(transaction.gasUsed),
            gasFees: Number(this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')),
            timestamp: new Date(Number(latestBlock.timestamp) * 1000),
            transactionFee: Number(
              this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')
            ),
            maxFeePerGas: Number(
              this.web3.utils.fromWei(Number(Number(tx.gasPrice) * 1.2).toString(), 'gwei')
            ),
            maxPriorityFeePerGas: Number(
              this.web3.utils.fromWei(Number(Number(tx.gasPrice) * 0.2).toString(), 'gwei')
            ),
            baseFeePerGas: Number(
              this.web3.utils.fromWei(
                latestBlock.baseFeePerGas?.toString() ||
                  Number(Number(tx.gasPrice) * 1.2 - Number(tx.gasPrice) * 0.2).toString(),
                'gwei'
              )
            ),
          };
          logger.info(`Transactions saved: ${tx.hash}`);
          return TransactionModel.create(transactionData);
        }
      });

      await Promise.all(transactionPromises);
    } catch (error) {
      logger.error('Error detecting and saving transactions:', error);
    }
  }
}

export default new TransactionService();
