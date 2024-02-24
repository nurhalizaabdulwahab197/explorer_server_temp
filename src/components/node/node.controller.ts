import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { create, read, fetchNodeDetails } from '@components/node/node.service';
import { INode } from '@components/node/node.interface';

const createNode = async (req: Request, res: Response) => {
  const node = req.body as INode;
  await create(node);
  res.status(httpStatus.CREATED);
  return res.send({ message: 'Created' });
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
    const url = 'http://intenexplorer.southeastasia.cloudapp.azure.com:8545'; // Replace with your URL
    const nodeDetails = await fetchNodeDetails(url);
    res.status(httpStatus.OK).send({ message: 'Fetched node details', output: nodeDetails });
  } catch (error) {
    // Handle errors appropriately
    res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
  }
};

export { createNode, readNode, fetchNodeDetailsController };
