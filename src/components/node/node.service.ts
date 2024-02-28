import logger from '@core/utils/logger';
import { INode } from './node.interface';
import { NodeModel } from './node.model';

const readNode = async (): Promise<INode[]> => {
  try {
    const nodes: INode[] = await NodeModel.find();
    return nodes;
  } catch (error) {
    logger.error('Error occurred while reading node:', error);
    throw error;
  }
};

const readNodeByNodeID = async (nodeID: String): Promise<INode> => {
  //   logger.debug(`Sent node.id ${nodeID}`);
  const node = await NodeModel.findOne({ node_id: nodeID });
  //   logger.debug(`Inside readNodeByNodeID: Found node ${node}`);
  return node as INode;
};

export { readNode, readNodeByNodeID };
