// node.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { create, read, fetchNodeDetails } from '@components/node/node.service';
import { INode } from '@components/node/node.interface';

const createNode = async (req: Request, res: Response) => {
  try {
    const node = req.body as INode;
    await create(node);
    res.status(httpStatus.CREATED).send({ message: 'Created' });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
};

const readNode = async (req: Request, res: Response) => {
  try {
    const nodeDetails = await read(req.params.id);
    res.status(httpStatus.OK).send({ message: 'Read', output: nodeDetails });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
};

const fetchNodeDetailsController = async (req: Request, res: Response) => {
  try {
    const nodeId = req.params.id; // Assuming the node ID is part of the URL
    const nodeDetails = await fetchNodeDetails(nodeId);
    if (nodeDetails) {
      res.status(httpStatus.OK).send({ message: 'Fetched node details', output: nodeDetails });
    } else {
      res.status(httpStatus.NOT_FOUND).send({ message: 'Node not found' });
    }
  } catch (error) {
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
  }
};

export { createNode, readNode, fetchNodeDetailsController };
