import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import node from '@components/node/node.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(node);

export default router;
