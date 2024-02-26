import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { read, readByHash, getLatestList, readBlockByPage } from '@components/block/block.service';
// import { IBlock } from '@components/block/block.interface';

// const createBlock = async (req: Request, res: Response) => {
//   const block = req.body as IBlock;
//   await create(block);
//   res.status(httpStatus.CREATED);
//   return res.send({ message: 'Created' });
// };

const readBlockPage = async (req: Request, res: Response) => {
  const pageNumber: number = parseInt(req.params.number, 10);
  const output = await readBlockByPage(pageNumber);
  res.status(httpStatus.OK);
  res.send({ message: 'Read latest block list', output });
};

const readBlock = async (req: Request, res: Response) => {
  const blockNumber: number = parseInt(req.params.number, 10);
  //   res.status(httpStatus.OK);
  //   res.send({ message: 'Read', output: await read(blockNumber) });
  if (Number.isNaN(blockNumber)) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid block number' });
  }

  try {
    const output = await read(blockNumber);
    res.status(httpStatus.OK).json({ message: 'Read', output });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
  return 0;
};

const readBlockByHash = async (req: Request, res: Response) => {
  const blockHash = req.params.hash;
  res.status(httpStatus.OK);
  res.send({ message: 'Read block by hash', output: await readByHash(blockHash) });
};

const getLatestBlockList = async (req: Request, res: Response) => {
  // const blocks: IBlock[] = await getLatestList();
  const output = await getLatestList();
  res.status(httpStatus.OK);
  res.send({ message: 'Read latest block list', output });
};

// const getLastSyncedBlocks = async (res: Response) => {
//   await getLastSyncedBlock();
//   res.status(httpStatus.OK);
//   res.send({ message: 'LastSyncBlock get' });
// };

// const setLastSyncedBlocks = async (req: Request, res: Response) => {
//   const { lastSyncedBlock } = req.body;
//   await setLastSyncedBlock(lastSyncedBlock);
//   res.status(httpStatus.OK);
//   res.send({ message: 'LastSyncBlock set' });
// };
// const updateBlock = async (req: Request, res: Response) => {
//   const block = req.body as IBlock;
//   await update(block);
//   res.status(httpStatus.OK);
//   res.send({ message: 'Updated' });
// };

// const deleteBlock = async (req: Request, res: Response) => {
//   await deleteById(req.params.email);
//   res.status(httpStatus.ACCEPTED);
//   res.send({ message: 'Removed' });
// };

export { readBlock, readBlockByHash, getLatestBlockList, readBlockPage };
