import { Router } from 'express';
import { retrieveTransactions, retrieveTransactionsByHashId } from './transaction.controller';

const router: Router = Router();

router.post('/transaction/', retrieveTransactions);
router.get('/transaction/:hashId', retrieveTransactionsByHashId);

export default router;
