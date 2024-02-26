// transaction.interface.ts

export interface ITransaction {
  hash: string;
  block: number;
  senderAddress: string;
  amount: number;
  receiverAddress: string;
  value: number;
  gasPrice: number;
  transactionFee: number;
  gasLimit: number;
  gasUsed: number;
  gasFees: number;
  timestamp: Date;
  // ... any other properties you want to include
}
