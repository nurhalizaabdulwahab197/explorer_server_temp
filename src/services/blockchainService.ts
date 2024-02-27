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

  async fetchLatestBlock() {
    try {
      const blockData = await this.web3.eth.getBlock('latest');

      const block: IBlock = {
        number: Number(blockData.number), // Convert bigint to string
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        nonce: Number(blockData.nonce), // Convert bigint to string if it's not undefined
        sha3Uncles: blockData.sha3Uncles,
        transactions: blockData.transactions?.map((tx) => (typeof tx === 'string' ? tx : tx.hash)),
        miner: blockData.miner,
        difficulty: Number(blockData.difficulty), // Convert bigint to string
        totalDifficulty: Number(blockData.totalDifficulty), // Convert bigint to string
        size: Number(blockData.size), // Convert bigint to string
        extraData: blockData.extraData,
        gasLimit: Number(blockData.gasLimit), // Convert bigint to string
        gasUsed: Number(blockData.gasUsed), // Convert bigint to string
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        // ... add all the other properties as needed
      };

      // Save the block using the block service
      // await createBlock(block);
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
        number: Number(blockData.number), // Convert bigint to string
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        nonce: Number(blockData.nonce), // Convert bigint to string if it's not undefined
        sha3Uncles: blockData.sha3Uncles,
        transactions: blockData.transactions?.map((tx) => (typeof tx === 'string' ? tx : tx.hash)),
        miner: blockData.miner,
        difficulty: Number(blockData.difficulty), // Convert bigint to string
        totalDifficulty: Number(blockData.totalDifficulty), // Convert bigint to string
        size: Number(blockData.size), // Convert bigint to string
        extraData: blockData.extraData,
        gasLimit: Number(blockData.gasLimit), // Convert bigint to string
        gasUsed: Number(blockData.gasUsed), // Convert bigint to string
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        // ... add all the other properties as needed
      };

      await saveBlock(block);
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
