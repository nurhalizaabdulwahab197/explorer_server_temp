import { Request, Response } from 'express';
import httpStatus from 'http-status';
import logger from '@core/utils/logger';
import {
  checkAddressType,
  retrieveTransactionLists,
} from '../account_overview/account_overview.service';
import {
  read,
  readByHashId,
  getLatestList,
  readTransactionByPage,
  readNextTransactionByHashId,
  retrievePreviousTransactionsByHashId,
  getThirtyDayTransactionNumber,
  getTransactionStatistics,
  getTransactionCount,
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
    // to check whether the contract address is null or not. Contract address is null if the item is updated/deleted
    if (transaction.contractAddress !== 'null') {
      transaction.receiverAddress = transaction.contractAddress;
    }
    // to check whether the address is contract or not
    const type = await checkAddressType(transaction.receiverAddress);
    let seq = 0;
    if (type === 'contract') {
      const transactionList = await retrieveTransactionLists(transaction.receiverAddress)
      const reverseList = transactionList.reverse();
      for (let i = 0; i < reverseList.length; i += 1) {
        if (transactionList[i].hash === transaction.hash) {
          seq = i;
        }
      }
    }
    // If the transaction is found, return it with a 200 status code
    res
      .status(200)
      .json({ message: 'Transaction retrieved successfully', output: transaction, type, seq });
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

const readByPage = async (req: Request, res: Response) => {
  const pageNumber: number = parseInt(req.params.pageNumber, 10);

  // Check if pageNumber is NaN or less than 1, set to 1 by default
  // eslint-disable-next-line no-restricted-globals
  const safePageNumber: number = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;

  try {
    const output = await readTransactionByPage(safePageNumber);
    res.status(httpStatus.OK).send({ message: 'Read latest transaction list', output });
  } catch (error) {
    console.error('Error while reading the transactions by page:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error reading transactions' });
  }
};

// eslint-disable-next-line consistent-return
const retrieveNextTransactionsByHashId = async (req: Request, res: Response) => {
  try {
    const transaction = await readNextTransactionByHashId(req.params.hashId);
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

// eslint-disable-next-line consistent-return
const retrievePrevTransactionsByHashId = async (req: Request, res: Response) => {
  try {
    const transaction = await retrievePreviousTransactionsByHashId(req.params.hashId);
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
const retrieveThirtyDayTransactionNumber = async (req: Request, res: Response) => {
  const output = await getThirtyDayTransactionNumber();
  const statistics = await getTransactionStatistics();
  res.status(httpStatus.OK);
  res.send({ message: 'Read latest thirty day transaction number', output, statistics });
};

const getTransactionCountNumber = async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  res.send({ message: 'Read', output: await getTransactionCount() });
};

// eslint-disable-next-line import/prefer-default-export
export {
  retrieveTransactions,
  retrieveTransactionsByHashId,
  getLatestTransactionList,
  readByPage,
  retrieveNextTransactionsByHashId,
  retrievePrevTransactionsByHashId,
  retrieveThirtyDayTransactionNumber,
  getTransactionCountNumber,
};
