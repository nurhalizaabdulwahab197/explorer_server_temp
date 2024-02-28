// nodeService.ts
import axios from 'axios'; // yam
import os from 'os'; // yam
import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { INode } from '@components/node/node.interface';
import { NodeModel } from '@components/node/node.model';

class NodeService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
    this.pollingInterval = 5000; // Poll every 5 seconds
  }

  startPolling() {
    setInterval(() => this.fetchNodeDetails(), this.pollingInterval * 2); // Adjust the interval as needed
  }

  async fetchNodeDetails() {
    try {
      const peerInfoResponse = await axios.post(config.privateNetwork, {
        jsonrpc: '2.0',
        method: 'admin_peers',
        params: [],
        id: 1,
      });

      const peers = peerInfoResponse.data.result;

      // logger.info('Connected Peers:');
      // peers.forEach((peer: any, index: number) => {
      //   logger.info(`Peer ${index + 1}:`);
      //   Object.entries(peer).forEach(([key, value]) => {
      //     logger.info(`  ${key}: ${value}`);
      //   });
      // });

      const peerCount = await this.web3.eth.net.getPeerCount();
      const peerStatus = await this.web3.eth.isSyncing();
      const localHost = Object.values(os.networkInterfaces())
        .flat()
        .filter((info) => info.family === 'IPv4' && !info.internal)
        .map((info) => info.address)
        .find(Boolean);

      // logger.info(`Number of connected peers: ${peerStatus}`);

      // logger.info('Connected Peers:');
      // peers.forEach((peer: any, index: number) => {
      //   logger.info(`Peer ${index + 1} ID: ${peer.enode}`);
      // });

      // const peerDetailsArray: INode[] = [];

      await NodeModel.deleteMany({});

      const nodeDetailsArray = await Promise.all(
        peers.map(async (peer) => {
          const clientMatch = `${peer.name}`.match(/^([^/]+)/);
          const CLIENT = clientMatch ? clientMatch[1] : 'Unknown';
          const BLOCK = Number(peerStatus ? 0 : await this.web3.eth.getBlockNumber());
          const QUEUE = Number(
            peerStatus ? 0 : await this.web3.eth.getBlockTransactionCount('pending')
          );

          const nodeDetails: INode = {
            status: peerStatus ? 'Syncing' : 'Running',
            peers: Number(peerCount),
            blocks: BLOCK,
            queued: QUEUE,
            client: CLIENT,
            node_id: `${peer.id}`.toString(),
            node_name: `${peer.name}`.toString(),
            enode: `${peer.enode}`.toString(),
            rpc_url: config.privateNetwork,
            local_host: localHost || 'Unknown',
          };

          try {
            const createdNode = await NodeModel.create(nodeDetails);
            logger.info(`Node created: ${createdNode.node_id}`);
            // console.log('Node Details:', nodeDetails);
          } catch (createError) {
            logger.error('Error creating node:', createError);
          }

          return nodeDetails;
        })
      );

      // peerDetailsArray.push(nodeDetails);
      // logger.info('Peer Details Array:');
      // nodeDetailsArray.forEach((peerDetail, index) => {
      //   logger.info(`Peer ${index + 1} Information:`);
      //   Object.entries(peerDetail).forEach(([key, value]) => {
      //     logger.info(`  ${key}: ${value}`);
      //   });
      // });

      return peers;
    } catch (error) {
      logger.error('Error:', error);
    }

    return 0;
  }

  // no use
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
