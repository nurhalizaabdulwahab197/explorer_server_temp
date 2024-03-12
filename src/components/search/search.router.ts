// search.router.ts
import { Router } from 'express';
import { performSearch } from './search.controller';

const router: Router = Router();

router.get('/search/:query', performSearch);

export default router;
