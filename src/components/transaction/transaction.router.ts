import { Router } from 'express';
import { retrieveTransactions, retrieveTransactionsByHashId ,getLatestTransactionList} from './transaction.controller';

const router: Router = Router();

router.get('/transaction/', retrieveTransactions);
router.get('/transaction/:hashId', retrieveTransactionsByHashId);
router.get('/transaction/fetch/latestTransactionList', getLatestTransactionList);
export default router;
