// node.service.ts

import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { NodeModel } from '@components/node/node.model';
import { INode } from '@components/node/node.interface';

const create = async (node: INode): Promise<boolean> => {
  try {
    const newNode = await NodeModel.create(node);
    logger.debug(`Node created: %O`, newNode);
    return true;
  } catch (err) {
    logger.error(`Node create err: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Node was not created!');
  }
};

const read = async (node_id: string): Promise<INode> => {
  logger.debug(`Sent node.id ${node_id}`);
  const node = await NodeModel.findOne({ id: node_id });
  return node as INode;
};

export { create, read };
