import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import block from '@components/block/block.router';
import account_overview from '@components/account_overview/account_overview.router';
import transaction from '@components/transaction/transaction.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(block);
router.use(account_overview);
router.use(transaction);

export default router;
