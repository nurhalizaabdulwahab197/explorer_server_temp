// search.interface.ts

export interface ISearchResult {
  type: string; // e.g., 'block', 'transaction', 'account', 'contract
  data: any; // e.g., IBlock, ITransaction, IAccount, IContract
}
