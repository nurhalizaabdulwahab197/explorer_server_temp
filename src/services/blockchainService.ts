// blockchainService.ts
import axios from 'axios'; // yam
import os from 'os'; // yam
import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import {
  create as saveBlock,
  setLastSyncedBlock,
  getLastSyncedBlock,
} from '@components/block/block.service';
import { IBlock } from '@components/block/block.interface';
import { INode } from '@components/node/node.interface';

class BlockchainService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 10000; // Poll every 10 seconds
  }

  startPolling() {
    setInterval(() => this.syncBlocks(), this.pollingInterval);
    setInterval(() => this.fetchNodeDetails(), this.pollingInterval * 2); // Adjust the interval as needed
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

  // yam
  async fetchNodeDetails() {
    try {
      // Fetch individual properties
      const [nodeId, nodeName, peerCount, syncingStatus] = await Promise.all([
        this.web3.eth.net.getId(), // Fetch node ID
        this.web3.eth.getNodeInfo(), // Fetch node name
        this.web3.eth.net.getPeerCount(),
        this.web3.eth.isSyncing(),
      ]);

      // Extract client from nodeName (assuming it appears before the '/')
      const clientMatch = nodeName.match(/^([^/]+)/);
      const CLIENT = clientMatch ? clientMatch[1] : 'Unknown';

      // Make an RPC call to get the enode information
      const enodeResponse = await axios.post(config.privateNetwork, {
        jsonrpc: '2.0',
        method: 'admin_nodeInfo',
        params: [],
        id: 1,
      });

      const ENODE = enodeResponse.data.result?.enode || 'Unknown';

      const localHost = Object.values(os.networkInterfaces())
        .flat()
        .filter((info) => info.family === 'IPv4' && !info.internal)
        .map((info) => info.address)
        .find(Boolean);

      const nodeDetails: INode = {
        status: syncingStatus ? 'Syncing' : 'Running',
        peers: Number(peerCount),
        blocks: Number(syncingStatus ? 0 : await this.web3.eth.getBlockNumber()),
        queued: Number(syncingStatus ? 0 : await this.web3.eth.getBlockTransactionCount('pending')),
        client: CLIENT,
        node_id: nodeId.toString(),
        node_name: nodeName,
        enode: ENODE,
        rpc_url: config.privateNetwork,
        local_host: localHost || 'Unknown',
      };

      console.log('Node Details:', nodeDetails); // Log the nodeDetails to inspect its structure
    } catch (error) {
      console.error('Error fetching node details:', error);
      // Implement retry logic or error handling as needed
    }
  }
}

export default new BlockchainService();
