// node.controller.ts
import { Request, Response } from 'express';
import NodeService from '@services/nodeService'; // Import NodeService

class NodeController {
  // eslint-disable-next-line class-methods-use-this
  async getNodeDetails(req: Request, res: Response): Promise<void> {
    try {
      const nodeId = req.params.id;
      console.log('Node ID:', nodeId); // Log the node ID to check if it's correctly received
      const nodeDetails = await NodeService.fetchNodeDetails(nodeId);

      if (nodeDetails) {
        res.status(200).json(nodeDetails);
      } else {
        res.status(404).json({ error: 'Node not found' });
      }
    } catch (error) {
      console.error('Error in getNodeDetails:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new NodeController();
