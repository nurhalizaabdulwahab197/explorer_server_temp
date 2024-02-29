import { Router } from 'express';
import {
  retrieveTransactions,
  retrieveTransactionsByHashId,
  getLatestTransactionList,
  readByPage,
  retrieveNextTransactionsByHashId,
  retrievePrevTransactionsByHashId,
  retrieveThirtyDayTransactionNumber,
} from './transaction.controller';

const router: Router = Router();

router.get('/transaction/', retrieveTransactions);
router.get('/transaction/:hashId', retrieveTransactionsByHashId);
router.get('/transaction/next/:hashId', retrieveNextTransactionsByHashId);
router.get('/transaction/prev/:hashId', retrievePrevTransactionsByHashId);
router.get('/transaction/transactionlist/:pageNumber', readByPage);
router.get('/transaction/fetch/latestTransactionList', getLatestTransactionList);
router.get('/transaction/latestThirtyDay/transactionNumber', retrieveThirtyDayTransactionNumber);
export default router;
