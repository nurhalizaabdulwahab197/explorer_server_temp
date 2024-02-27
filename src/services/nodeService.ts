// nodeService.ts
import axios from 'axios'; // yam
import os from 'os'; // yam
import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { INode } from '@components/node/node.interface';

class NodeService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 10000; // Poll every 10 seconds
  }

  startPolling() {
    setInterval(() => this.fetchNodeDetails('12345'), this.pollingInterval * 2); // Adjust the interval as needed
    setInterval(() => this.fetchNodeDetails('67890'), this.pollingInterval * 2); // Adjust the interval as needed
  }

  // yam
  async fetchNodeDetails(_nodeId: String): Promise<INode | null> {
    try {
      // Fetch individual properties
      const [nodeId, nodeName, peerCount, syncingStatus] = await Promise.all([
        this.web3.eth.net.getId(), // Fetch node ID
        this.web3.eth.getNodeInfo(), // Fetch node name
        this.web3.eth.net.getPeerCount(),
        this.web3.eth.isSyncing(),
      ]);

      // Check if the provided _nodeId matches the fetched nodeId
      if (_nodeId !== nodeId.toString()) {
        // If not, return null or handle as appropriate (e.g., throw an error)
        logger.info(`Node not found`);
        return null;
      }

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
      return nodeDetails;
    } catch (error) {
      console.error('Error fetching node details:', error);
      throw error; // Rethrow the error for handling in higher layers
    }
  }
}

export default new NodeService();
