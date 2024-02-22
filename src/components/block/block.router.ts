import { Router } from 'express';

import { readBlock, readBlockByHash, getLatestBlockList } from '@components/block/block.controller';

const router: Router = Router();

router.get('/block/number/:number', readBlock);
router.get('/block/hash/:hash', readBlockByHash);
router.get('/block/latestBlockList', getLatestBlockList);
export default router;
