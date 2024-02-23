import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { create, read } from '@components/node/node.service';
import { INode } from '@components/node/node.interface';

const createNode = async (req: Request, res: Response) => {
  const node = req.body as INode;
  await create(node);
  res.status(httpStatus.CREATED);
  return res.send({ message: 'Created' });
};

const readNode = async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  res.send({ message: 'Read', output: await read(req.params.id) });
};

export { createNode, readNode };
