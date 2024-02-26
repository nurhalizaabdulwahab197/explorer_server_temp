import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import transaction from '@components/transaction/transaction.router';
import account_overview from '@components/account_overview/account_overview.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(transaction);
router.use(account_overview);

export default router;
