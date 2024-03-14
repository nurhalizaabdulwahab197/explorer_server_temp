// search.service.ts

import { BlockModel } from '@components/block/block.model';
import { TransactionModel } from '@components/transaction/transaction.model';
import { checkAddressType } from '@components/account_overview/account_overview.service'; // This path might need adjustment
import { ISearchResult } from './search.interface';

const isNumeric = (str: string) => {
  return /^\d+$/.test(str);
};

const search = async (query: string): Promise<ISearchResult> => {
  let result: ISearchResult = { type: '', data: null };
  const numQuery = isNumeric(query) ? parseInt(query, 10) : '0';
  const blockQuery = {
    $or: [{ number: numQuery }, { hash: query }],
  };

  try {
    // Search for a block by number or hash
    const block = await BlockModel.findOne(blockQuery);

    if (block) {
      result = { type: 'block', data: block };
      return result;
    }

    // Search for a transaction by hash
    const transaction = await TransactionModel.findOne({ hash: query });
    if (transaction) {
      result = { type: 'transaction', data: transaction };
      return result;
    }

    // Search for an account by address using the account service
    const addressType = await checkAddressType(query);
    if (addressType === 'account') {
      result = { type: 'account', data: query };
      return result;
    }

    if (addressType === 'contract') {
      result = { type: 'contract', data: query };
      return result;
    }

    return result;
  } catch (error) {
    console.error('Error occurred while searching:', error);
    throw error;
  }
};

// eslint-disable-next-line import/prefer-default-export
export { search };
