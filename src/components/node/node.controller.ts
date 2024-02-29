// node.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import NodeService from '@services/nodeService';

const retrieveNodes = async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({ message: 'Read', output: await NodeService.readNodes() });
};

const retrieveNodeByNodeID = async (req: Request, res: Response) => {
  try {
    const node = await NodeService.readNodeByNodeID(req.params.node_id);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }
    res.status(200).json({ message: 'Node retrieved successfully', output: node });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export { retrieveNodes, retrieveNodeByNodeID };
