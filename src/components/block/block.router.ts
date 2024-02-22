import { Router } from 'express';

import {
  readBlock,
  readBlockByHash,
  getLatestBlockList,
  readBlockPage,
} from '@components/block/block.controller';

const router: Router = Router();

router.get('/block/number/:number', readBlock);
router.get('/block/hash/:hash', readBlockByHash);
router.get('/block/latestBlockList', getLatestBlockList);
router.get('/block/blockList/:pageNumber', readBlockPage);
export default router;
