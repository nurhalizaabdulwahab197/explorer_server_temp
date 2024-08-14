// transaction.interface.ts

export interface ITransaction {
  hash: string;
  block: number;
  senderAddress: string;
  amount: number;
  receiverAddress: string;
  contractAddress: string;
  status: string;
  input: string;
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
  note?: string;
  onComplete?: string;
  // ... any other properties you want to include
}
