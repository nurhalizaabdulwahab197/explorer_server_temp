// transaction.interface.ts

export interface ITransaction {
  hash: string;
  block: number;
  senderAddress: string;
  amount: number;
  receiverAddress: string;
  contractAddress: string;
  input: string;
  status: string;
  value: number;
  gasPrice: number;
  transactionFee: number;
  gasLimit: number;
  gasUsed: number;
  gasFees: number;
  timestamp: Date;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  baseFeePerGas: number;
  // ... any other properties you want to include
}
