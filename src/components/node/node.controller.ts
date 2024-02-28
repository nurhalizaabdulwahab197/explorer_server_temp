// node.controller.ts
import logger from '@core/utils/logger';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { readNode, readNodeByNodeID } from './node.service';

const retrieveNode = async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  res.send({ message: 'Read', output: await readNode() });
};

const retrieveNodeByNodeID = async (req: Request, res: Response) => {
  try {
    logger.debug(req.params.node_id);
    const node = await readNodeByNodeID(req.params.node_id);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }
    res.status(200).json({ message: 'Node retrieved successfully', output: node });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export { retrieveNode, retrieveNodeByNodeID };
