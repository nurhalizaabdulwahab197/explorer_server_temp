// node.router.ts
import express from 'express';
import NodeController from '@components/node/node.controller';

const router = express.Router();

router.get('/nodes/:id', NodeController.getNodeDetails); // Use GET for fetching data

export default router;
