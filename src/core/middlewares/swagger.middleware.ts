import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';

import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import consts from '@config/consts';
import swaggerDocument from '../../swagger.json';

const swaggerForbidden = () => {
  logger.error('Trying to access swagger docs on production');
  throw new AppError(
    httpStatus.FORBIDDEN,
    'API docs are not available on production',
  );
};

const swaggerBasePath = (req: Request, res: Response, next: NextFunction) => {
  // Update the servers array instead of basePath
  swaggerDocument.servers = [
    {
      url: `${req.protocol}://${req.get('host')}`,
      description: 'Current server',
    },
  ];

  swaggerUi.setup(swaggerDocument)(req, res, next);
};

export { swaggerBasePath, swaggerForbidden };
