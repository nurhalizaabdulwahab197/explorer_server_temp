// nodeService.ts
import axios from 'axios';
import os from 'os';
import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { INode } from '@components/node/node.interface';

const nodeCache: Record<string, INode> = {};

class NodeService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 5000; // Poll every 5 seconds

    // Populate nodeCache initially
    this.startPolling();
  }

  startPolling() {
    setInterval(async () => {
      await this.fetchNodeDetails(); // Update nodeCache periodically
    }, this.pollingInterval);
  }

  async fetchNodeDetails() {
    try {
      // Clear existing nodes in cache
      Object.keys(nodeCache).forEach((key) => delete nodeCache[key]);

      const peerInfoResponse = await axios.post(config.privateNetwork, {
        jsonrpc: '2.0',
        method: 'admin_peers',
        params: [],
        id: 1,
      });

      const peers = peerInfoResponse.data.result;
      const peerCount = await this.web3.eth.net.getPeerCount();
      const peerStatus = await this.web3.eth.isSyncing();

      // Process peer data and update or add to nodeCache
      await Promise.all(
        peers.map(async (peer: any) => {
          const nodeDetails: INode = {
            status: peerStatus ? 'Syncing' : 'Running',
            peers: Number(peerCount),
            blocks: Number(peer.status ? 0 : await this.web3.eth.getBlockNumber()),
            queued: Number(
              peer.status ? 0 : await this.web3.eth.getBlockTransactionCount('pending')
            ),
            client: peer.name ? peer.name.match(/^([^/]+)/)?.[1] || 'Unknown' : 'Unknown',
            node_id: peer.id.toString(),
            node_name: peer.name.toString(),
            enode: peer.enode.toString(),
            rpc_url: config.privateNetwork,
            local_host: this.getLocalHost(),
          };

          // Check if node with the same ID exists in nodeCache
          if (nodeCache[nodeDetails.node_id]) {
            // Update existing node
            Object.assign(nodeCache[nodeDetails.node_id], nodeDetails);
            logger.info(`Node updated: ${nodeDetails.node_id}`);
          } else {
            // Add new node to cache
            nodeCache[nodeDetails.node_id] = nodeDetails;

            try {
              // logger.info(`Node created: ${nodeDetails.node_id}`);
              // console.log('Node Details:', nodeDetails);
            } catch (createError) {
              logger.error('Error creating node:', createError);
            }
          }

          return nodeDetails;
        })
      );
    } catch (error) {
      logger.error('Error:', error);
    }
  }

  getLocalHost() {
    return (
      Object.values(os.networkInterfaces())
        .flat()
        .filter((info) => info.family === 'IPv4' && !info.internal)
        .map((info) => info.address)
        .find(Boolean) || 'Unknown'
    );
  }

  async readNodes(): Promise<INode[]> {
    try {
      const nodes: INode[] = Object.values(nodeCache);
      return nodes;
    } catch (error) {
      logger.error('Error occurred while reading nodes:', error);
      throw error;
    }
  }

  async readNodeByNodeID(nodeID: string): Promise<INode | undefined> {
    return nodeCache[nodeID];
  }
}

export default new NodeService();
