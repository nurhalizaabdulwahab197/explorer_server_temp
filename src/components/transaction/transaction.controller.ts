import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  read,
  readByHashId,
  getLatestList,
  getThirtyDayTransactionNumber,
  getTransactionStatistics,
} from './transaction.service';

// Retrieve transactions from the database
// eslint-disable-next-line consistent-return
const retrieveTransactions = async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  res.send({ message: 'Read', output: await read() });
};

// eslint-disable-next-line consistent-return
const retrieveTransactionsByHashId = async (req: Request, res: Response) => {
  try {
    const transaction = await readByHashId(req.params.hashId);
    if (!transaction) {
      // If the transaction is not found, return a 404 status code
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // If the transaction is found, return it with a 200 status code
    res.status(200).json({ message: 'Transaction retrieved successfully', output: transaction });
  } catch (error) {
    // If an error occurs during retrieval, return a 500 status code with the error message
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const getLatestTransactionList = async (req: Request, res: Response) => {
  const output = await getLatestList();
  res.status(httpStatus.OK);
  res.send({ message: 'Read latest transaction list', output });
};

const retrieveThirtyDayTransactionNumber = async (req: Request, res: Response) => {
  const output = await getThirtyDayTransactionNumber();
  const statistics = await getTransactionStatistics();
  res.status(httpStatus.OK);
  res.send({ message: 'Read latest thirty day transaction number', output, statistics });
};

// eslint-disable-next-line import/prefer-default-export
export {
  retrieveTransactions,
  retrieveTransactionsByHashId,
  getLatestTransactionList,
  retrieveThirtyDayTransactionNumber,
};
