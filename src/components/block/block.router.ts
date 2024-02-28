import { Router } from 'express';

import {
  readBlock,
  readBlockByHash,
  getLatestBlockList,
  readBlockPage,
  readBlockWithSkip,
} from '@components/block/block.controller';

const router: Router = Router();

router.get('/block/number/:number', readBlock);
router.get('/block/hash/:hash', readBlockByHash);
router.get('/block/latestBlockList', getLatestBlockList);
router.get('/block/blockList/:pageNumber', readBlockPage);
router.get('/block/blockListWithSkip/:skipNum', readBlockWithSkip);
export default router;
