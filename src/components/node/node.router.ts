// havent done yet

import express from 'express';
import { createNode, readNode, fetchNodeDetailsController } from '@components/node/node.controller';

const router = express.Router();

router.post('/create', createNode);
router.get('/read/:id', readNode);
router.get('/fetch-details', fetchNodeDetailsController); // New route for fetching node details

export default router;
