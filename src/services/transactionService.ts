import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { TransactionModel } from '@components/transaction/transaction.model';
import { getLastSyncedBlock } from '@components/block/block.service';

class TransactionService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 30000; // Poll every 30 seconds
  }

  startPolling() {
    setInterval(() => this.syncTransactions(), this.pollingInterval);
  }

  async detectAndSaveTransactions(blockNumber: number, latestBlockNumber: number) {
    if (blockNumber > latestBlockNumber) {
      logger.info(`Synced transaction up to block number: ${latestBlockNumber}`);
      return;
    }
    try {
      // Fetch latest block
      const blockData = await this.web3.eth.getBlock(blockNumber, true);

      if (!blockData || !blockData.transactions) {
        logger.info(`No transactions found in the block number: ${blockNumber}.`);
        await this.detectAndSaveTransactions(blockNumber + 1, latestBlockNumber);
        return;
      }

      console.log(blockData);
      // Process transactions in the latest block
      // eslint-disable-next-line consistent-return
      const transactionPromises = blockData.transactions.map(async (tx) => {
        if (typeof tx !== 'string') {
          const transaction = await this.web3.eth.getTransactionReceipt(tx.hash);
          if (!transaction) {
            logger.info('No transactions receipt found');
          }

          const { baseFeePerGas } = blockData;
          const priorityFeePerGas = tx.maxPriorityFeePerGas || tx.gasPrice - baseFeePerGas;

          const transactionData = {
            hash: tx.hash,
            block: Number(blockData.number),
            senderAddress: tx.from,
            amount: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            receiverAddress: tx.to || 'null',
            contractAddress: transaction.contractAddress || 'null',
            status: transaction.status,
            input: tx.input || '0x',
            value: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            gasPrice: tx.gasPrice
              ? Number(this.web3.utils.fromWei(tx.gasPrice.toString(), 'gwei'))
              : 0,
            gasLimit: Number(tx.gas),
            gasUsed: Number(transaction.gasUsed),
            gasFees: Number(this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')),
            timestamp: new Date(Number(blockData.timestamp) * 1000),
            maxFeePerGas: tx.maxFeePerGas
              ? Number(this.web3.utils.fromWei(tx.maxFeePerGas.toString(), 'gwei'))
              : 0,
            maxPriorityFeePerGas: priorityFeePerGas
              ? Number(this.web3.utils.fromWei(priorityFeePerGas.toString(), 'gwei'))
              : 0,
            baseFeePerGas: baseFeePerGas
              ? Number(this.web3.utils.fromWei(baseFeePerGas.toString(), 'gwei'))
              : 0,
            // Calculate the transaction fee based on EIP-1559
            transactionFee: transaction.effectiveGasPrice
              ? Number(
                  this.web3.utils.fromWei(
                    (
                      Number(transaction.effectiveGasPrice) * Number(transaction.gasUsed)
                    ).toString(),
                    'ether'
                  )
                )
              : 0,
          };

          console.log(transaction.status, tx.input);
          logger.info(`Transactions saved: ${tx.hash}`);
          await TransactionModel.create(transactionData);
          await this.detectAndSaveTransactions(blockNumber + 1, latestBlockNumber);
        }
      });

      await Promise.all(transactionPromises);
    } catch (error) {
      logger.error('Error detecting and saving transactions:', error);
    }
  }

  async syncTransactions() {
    try {
      const lastSyncedBlockNumber = await getLastSyncedBlock();
      const latestBlockNumber = await this.web3.eth.getBlockNumber();
      await this.detectAndSaveTransactions(lastSyncedBlockNumber + 1, Number(latestBlockNumber));
    } catch (error) {
      logger.error('Error initiating transaction sync:', error);
    }
  }
}

export default new TransactionService();
