// node.router.ts
import express from 'express';
import { retrieveNode, retrieveNodeByNodeID } from '@components/node/node.controller';

const router = express.Router();

router.get('/nodes/:node_id', retrieveNodeByNodeID); // Use GET for fetching data
router.get('/nodes', retrieveNode);

export default router;
