// blockchainService.ts
import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import {
  create as saveBlock,
  setLastSyncedBlock,
  getLastSyncedBlock,
} from '@components/block/block.service';
import { IBlock } from '@components/block/block.interface';

class BlockchainService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 10000; // Poll every 10 seconds
  }

  startPolling() {
    setInterval(() => this.syncBlocks(), this.pollingInterval);
  }

  async calculateTransactionFees(blockNumber: number): Promise<number> {
    try {
      const block = await this.web3.eth.getBlock(blockNumber);

      if (!block) {
        console.error(`Block not found for block number ${blockNumber}`);
        return 0;
      }

      let totalTransactionFee = 0;
      if (block.transactions && block.transactions.length > 0) {
        block.transactions.forEach(async (txHash) => {
          const tx = await this.web3.eth.getTransaction(txHash);

          if (!tx) {
            console.error(`Transaction not found for hash ${txHash}`);
            return;
          }

          const gasPrice = Number(tx.gasPrice);
          const gas = Number(tx.gas);

          const transactionFee = Number(
            this.web3.utils.fromWei((gasPrice * gas).toString(), 'ether')
          );

          // Accumulate transaction fees
          totalTransactionFee += transactionFee;
        });
      }

      return totalTransactionFee;
    } catch (error) {
      console.error('Error calculating transaction fees:', error);
      return 0;
    }
  }

  async fetchLatestBlock() {
    try {
      const blockData = await this.web3.eth.getBlock('latest');

      const block: IBlock = {
        number: Number(blockData.number),
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        nonce: Number(blockData.nonce),
        sha3Uncles: blockData.sha3Uncles,
        transactions: blockData.transactions?.map((tx) => (typeof tx === 'string' ? tx : tx.hash)),
        miner: blockData.miner,
        difficulty: Number(blockData.difficulty),
        totalDifficulty: Number(blockData.totalDifficulty),
        size: Number(blockData.size),
        extraData: blockData.extraData,
        gasLimit: Number(blockData.gasLimit),
        gasUsed: Number(blockData.gasUsed),
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        transactionNumber: Number(await this.web3.eth.getBlockTransactionCount(blockData.number)),
        transactionFee: Number(await this.calculateTransactionFees(Number(blockData.number))),
        blockReward: Number(await this.calculateTransactionFees(Number(blockData.number))) + 0,
        // ... (other properties)
      };

      block.transactionFee = await this.calculateTransactionFees(Number(blockData.number));

      // Save the block using the block service
      await saveBlock(block);
      logger.info(`Block number ${block.number} saved to the database.`);
    } catch (error) {
      logger.error('Error fetching the latest block:', error);
      // Implement retry logic or error handling as needed
    }
  }

  async syncBlock(blockNumber: number, latestBlockNumber: number) {
    if (blockNumber > latestBlockNumber) {
      logger.info(`Synced up to block number: ${latestBlockNumber}`);
      return;
    }

    try {
      const blockData = await this.web3.eth.getBlock(blockNumber);
      const block: IBlock = {
        number: Number(blockData.number),
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        nonce: Number(blockData.nonce),
        sha3Uncles: blockData.sha3Uncles,
        transactions: blockData.transactions?.map((tx) => (typeof tx === 'string' ? tx : tx.hash)),
        miner: blockData.miner,
        difficulty: Number(blockData.difficulty),
        totalDifficulty: Number(blockData.totalDifficulty),
        size: Number(blockData.size),
        extraData: blockData.extraData,
        gasLimit: Number(blockData.gasLimit),
        gasUsed: Number(blockData.gasUsed),
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        transactionNumber: Number(await this.web3.eth.getBlockTransactionCount(blockData.number)),
        transactionFee: Number(await this.calculateTransactionFees(Number(blockData.number))),
        blockReward: Number(await this.calculateTransactionFees(Number(blockData.number))) + 0,
        // ... (other properties)
      };

      // await saveBlock(block);
      await setLastSyncedBlock(blockNumber);

      // Process the next block
      await this.syncBlock(blockNumber + 1, latestBlockNumber);
      return;
    } catch (error) {
      logger.error(`Error syncing block number ${blockNumber}:`, error);
      // Handle error, maybe retry current block or stop syncing
    }
  }

  async syncBlocks() {
    try {
      const lastSyncedBlockNumber = await getLastSyncedBlock();
      const latestBlockNumber = await this.web3.eth.getBlockNumber();
      logger.info(`Syncing blocks from ${lastSyncedBlockNumber + 1} to ${latestBlockNumber}`);
      await this.syncBlock(lastSyncedBlockNumber + 1, Number(latestBlockNumber));
    } catch (error) {
      logger.error('Error initiating block sync:', error);
    }
  }
}

export default new BlockchainService();
