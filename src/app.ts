import express, { Application } from 'express';
import api from 'api';
import lusca from 'lusca';
import cors from 'cors';
import httpContext from 'express-http-context';
import expressMongoSanitize from 'express-mongo-sanitize';
import consts from '@config/consts';
import httpLogger from '@core/utils/httpLogger';
import errorHandling from '@core/middlewares/errorHandling.middleware';
import uniqueReqId from '@core/middlewares/uniqueReqId.middleware';
import http404 from '@components/404/404.router';
import swaggerApiDocs from '@components/swagger-ui/swagger.router';
import db from '@db';

import blockchainService from './services/blockchainService';
import nodeService from './services/nodeService';

db.connect();
blockchainService.startPolling();
nodeService.startPolling();

const app: Application = express();
app.use(cors());
app.use(lusca.xssProtection(true));
app.use(expressMongoSanitize());
app.use(httpContext.middleware);
app.use(httpLogger.successHandler);
app.use(httpLogger.errorHandler);
app.use(uniqueReqId);
app.use(express.json());
app.use(consts.API_ROOT_PATH, api);
app.use(swaggerApiDocs);
app.use(http404);

app.use(errorHandling);

// eslint-disable-next-line prettier/prettier
export default app;