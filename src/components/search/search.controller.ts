// search.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as SearchService from './search.service';

const performSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.params; // Or req.query for query parameters
    const results = await SearchService.search(query);
    res.status(httpStatus.OK);
    res.json({ output: results });
  } catch (error) {
    res.status(500).send({ message: 'Error performing search', error });
  }
};

// eslint-disable-next-line import/prefer-default-export
export { performSearch };
