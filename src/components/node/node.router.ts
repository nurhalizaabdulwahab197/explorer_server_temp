// node.router.ts

import express from 'express';
import { createNode, readNode, fetchNodeDetailsController } from '@components/node/node.controller';

const router = express.Router();

router.post('/create', createNode);
router.get('/read/:id', readNode);
router.post('/fetch-and-create', fetchNodeDetailsController); // Use POST for actions that change the state

export default router;
