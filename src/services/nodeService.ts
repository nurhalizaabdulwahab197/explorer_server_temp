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
    this.pollingInterval = 5000; // Poll every 5 seconds
  }

  startPolling() {
    setInterval(
      () => this.fetchNodeDetails('0x70af2edcf2754913cc11fc04f69809fcd5499959'),
      this.pollingInterval * 2
    ); // Adjust the interval as needed
    setInterval(
      () =>
        this.fetchNodeDetails('cf1056bcc9383be556cf015abe897d6ee724b625e7cb1536f5bcf1eaffe15285'),
      this.pollingInterval * 2
    ); // Adjust the interval as needed
    setInterval(() => this.fetchNodeDetails('[::]:30306'), this.pollingInterval * 2); // Adjust the interval as needed
    setInterval(
      () =>
        this.fetchNodeDetails(
          'enode://488ed15a478c0baee0096c1c52ba9f5a85f532d2b17844240e0a4f17e72cd37cd1f9c0933e6a4a0a1ab350035a53af3152dca737f24aaafba15cc2b96c7e1f86@127.0.0.1:30305'
        ),
      this.pollingInterval * 2
    ); // Adjust the interval as needed
    setInterval(() => this.getNodeIds(), this.pollingInterval * 2); // Adjust the interval as needed
  }

  // yam
  async fetchNodeDetails(_nodeId: string): Promise<INode | null> {
    try {
      // Fetch individual properties
      const [nodeINFO, peerCount, syncingStatus] = await Promise.all([
        this.web3.eth.getNodeInfo(), // Fetch node name
        this.web3.eth.net.getPeerCount(),
        this.web3.eth.isSyncing(),
      ]);

      // Extract client from nodeName (assuming it appears before the '/')
      const clientMatch = nodeINFO.match(/^([^/]+)/);
      const CLIENT = clientMatch ? clientMatch[1] : 'Unknown';

      // Make an RPC call to get the enode information
      const enodeResponse = await axios.post(config.privateNetwork, {
        jsonrpc: '2.0',
        method: 'admin_nodeInfo',
        params: [],
        id: 1,
      });

      const nodeInfo = enodeResponse.data.result;

      // Extract relevant information from the nodeInfo
      const nodeId = nodeInfo?.listenAddr || 'Unknown';
      const nodeName = nodeInfo?.name || 'Unknown';
      const ENODE = nodeInfo?.enode || 'Unknown';

      // Check if the provided _nodeId matches the fetched nodeId
      if (_nodeId !== ENODE.toString()) {
        // If not, return null or handle as appropriate (e.g., throw an error)
        logger.info(`Node not found`);
        return null;
      }

      const localHost = Object.values(os.networkInterfaces())
        .flat()
        .filter((info) => info.family === 'IPv4' && !info.internal)
        .map((info) => info.address)
        .find(Boolean);

      const nodeDetails: INode = {
        status: nodeInfo?.syncing ? 'Syncing' : 'Running',
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

  async getNodeIds(): Promise<string[] | null> {
    try {
      // Make an RPC call to get information about connected peers
      const peersResponse = await axios.post(config.privateNetwork, {
        jsonrpc: '2.0',
        method: 'admin_peers',
        params: [],
        id: 1,
      });

      const enodeIds = peersResponse.data.result.map((peer) => peer?.id || 'Unknown');
      console.log('Enode IDs:', enodeIds);

      return enodeIds;
    } catch (error) {
      console.error('Error fetching enode IDs:', error);
      throw error; // Rethrow the error for handling in higher layers
    }
  }
}

export default new NodeService();
