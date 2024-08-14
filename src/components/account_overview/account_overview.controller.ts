import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  retrieveTransactionLists,
  retrieveBalanceETH,
  checkAddressType,
} from './account_overview.service';

const getAccountOverview = async (req: Request, res: Response) => {
  try {
    const add = req.params.address;
    if (!add) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ success: false, error: 'Missing address parameter' });
    } else {
      const addressType = await checkAddressType(add);
      // Call the service function to retrieve the transaction list
      const transactionList = await retrieveTransactionLists(add);
      const balance = await retrieveBalanceETH(add);

      // Send the transaction list as a response
      res
        .status(httpStatus.OK)
        .json({ success: true, data: transactionList, balance, addressType });
    }
  } catch (error) {
    // Handle errors
    // console.error('Error in getTransactionList:', error);

    // You can customize the error response based on the error type or use a generic error message
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: 'Internal Server Error' });
  }
};

export default getAccountOverview;
