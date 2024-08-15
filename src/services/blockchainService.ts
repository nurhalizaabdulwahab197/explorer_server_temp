/* eslint-disable no-restricted-syntax */
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
import transactionService from './transactionService';

class BlockchainService {
  web3: Web3;

  pollingInterval: number;

  isSyncing: boolean;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 30000;
    this.isSyncing = false;
  }

  startPolling() {
    setInterval(() => this.syncBlocks(), this.pollingInterval);
  }

  async traceBlockInternalTransactions(blockNumber: number): Promise<number> {
    try {
      const block = await this.web3.eth.getBlock(blockNumber);

      if (!block.transactions || block.transactions.length === 0) {
        // Return 0 if there are no transactions
        return 0;
      }

      const transactionTracesPromises = [];

      for (const txHash of block.transactions) {
        const tracePromise = new Promise((resolve, reject) => {
          this.web3.currentProvider.send(
            {
              jsonrpc: '2.0',
              method: 'debug_traceTransaction',
              params: [txHash, {}],
              id: new Date().getTime(),
            },
            (error, response) => {
              if (error) {
                reject(error);
              } else {
                resolve(response);
              }
            }
          );
        });

        transactionTracesPromises.push(tracePromise);
      }

      const transactionTraces = await Promise.all(transactionTracesPromises);

      // Process the traces to extract internal transactions
      let contractInternalTransactionCount = 0;

      transactionTraces.forEach((trace) => {
        if (trace.result && trace.result.structLogs) {
          // Check if any structLog has a "depth" greater than 0, indicating an internal call
          if (trace.result.structLogs.some((log) => log.depth > 0)) {
            contractInternalTransactionCount++;
          }
        }
      });

      return contractInternalTransactionCount;
    } catch (error) {
      console.error(error);
      // Return -1 for other errors
      return -1;
    }
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
        const transactionPromises = block.transactions.map(async (txHash) => {
          const tx = await this.web3.eth.getTransaction(txHash);

          if (!tx) {
            console.error(`Transaction not found for hash ${txHash}`);
            return 0;
          }

          const gasPrice = Number(tx.gasPrice);
          const gas = Number(tx.gas);

          if (Number.isNaN(gasPrice) || Number.isNaN(gas)) {
            console.error(`Invalid gasPrice or gas for hash ${txHash}`);
            return 0;
          }

          const transactionFee = Number(
            this.web3.utils.fromWei((gasPrice * gas).toString(), 'ether')
          );

          return transactionFee;
        });

        const transactionFees = await Promise.all(transactionPromises);

        totalTransactionFee = transactionFees.reduce((acc, fee) => acc + fee, 0);
      }

      return totalTransactionFee;
    } catch (error) {
      console.error('Error calculating transaction fees:', error);
      return 0;
    }
  }

  async syncBlock(blockNumber: number, latestBlockNumber: number) {
    if (blockNumber > latestBlockNumber) {
      this.isSyncing = false;
      logger.info(`Synced up to block number: ${latestBlockNumber}`);
      return;
    }

    try {
      this.isSyncing = true;
      const blockData = await this.web3.eth.getBlock(blockNumber);

      const blockMiner = await new Promise<string>((resolve) => {
        (this.web3.currentProvider as any).send(
          {
            method: 'clique_getSigner',
            params: [blockData.hash],
            jsonrpc: '2.0',
            id: new Date().getTime(),
          },
          (error: Error, response: { result: any }) => {
            if (error) {
              logger.error(error.message); // Log the error
              resolve('0x29e7152d0456258fa4babb7a3f37b8a0347684eb'); // Use default value in case of error
            } else {
              resolve(response.result as string);
            }
          }
        );
      }).catch((error) => {
        logger.error(error); // Log any error that might have occurred during the promise
        return '0x29e7152d0456258fa4babb7a3f37b8a0347684eb'; // Return default value in case of error
      });

      const transactionNumber = Number(
        await this.web3.eth.getBlockTransactionCount(blockData.number)
      );
      const block: IBlock = {
        number: Number(blockData.number),
        hash: blockData.hash,
        parentHash: blockData.parentHash,
        nonce: Number(blockData.nonce),
        sha3Uncles: blockData.sha3Uncles,
        transactions: blockData.transactions?.map((tx) => (typeof tx === 'string' ? tx : tx.hash)),
        miner: blockMiner,
        difficulty: Number(blockData.difficulty),
        totalDifficulty: Number(blockData.totalDifficulty),
        size: Number(blockData.size),
        extraData: blockData.extraData,
        gasLimit: Number(blockData.gasLimit),
        gasUsed: Number(blockData.gasUsed),
        timestamp: new Date(Number(blockData.timestamp) * 1000),
        transactionNumber,
        transactionFee: Number(await this.calculateTransactionFees(Number(blockData.number))),
        blockReward: Number(await this.calculateTransactionFees(Number(blockData.number))) + 0,
        internalTransaction: Number(
          await this.traceBlockInternalTransactions(Number(blockData.number))
        ),
        // ... (other properties)
      };

      if (transactionNumber > 0) {
        logger.info(`Block ${block.number} has ${transactionNumber} internal transactions`);
        transactionService.detectAndSaveTransactions(block.number);
      }

      await saveBlock(block);
      await setLastSyncedBlock(blockNumber);

      // Process the next block
      await this.syncBlock(blockNumber + 1, latestBlockNumber);
    } catch (error) {
      logger.error(`Error syncing block number ${blockNumber}:`, error);
      // Handle error, maybe retry current block or stop syncing
    }
  }

  async syncBlocks() {
    try {
      if (this.isSyncing) {
        logger.info('Already syncing blocks');
        return;
      }
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
