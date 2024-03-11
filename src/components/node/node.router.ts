// node.router.ts
import express from 'express';
import { retrieveNodes, retrieveNodeByNodeID } from './node.controller';

const router = express.Router();

router.get('/nodes/:node_id', retrieveNodeByNodeID);
router.get('/nodes', retrieveNodes);

export default router;
