// node.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { create, read, fetchAndCreateNode } from '@components/node/node.service';
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

const fetchAndCreateNodeController = async (req: Request, res: Response) => {
  try {
    const newNodeCreated = await fetchAndCreateNode();
    if (newNodeCreated) {
      res.status(httpStatus.CREATED).send({ message: 'Node fetched and created successfully' });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Failed to create node' });
    }
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
};

export { createNode, readNode, fetchAndCreateNodeController };
