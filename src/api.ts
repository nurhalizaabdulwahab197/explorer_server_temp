import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import block from '@components/block/block.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(block);

export default router;
