import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import { TransactionModel } from '@components/transaction/transaction.model';
import { checkAddressType } from '@components/account_overview/account_overview.service';
import FileAbiStorage from '@contracts/abiStorage';
import ContractProxy from '@contracts/contractProxy';
import ContractInteractor from '@contracts/contractFactory';
import methodConfig from '@contracts/methodConfig.json';

const commonABI = [
  {
    inputs: [],
    name: 'CONTRACT_TYPE',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VERSION',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const abiStorage = new FileAbiStorage();
class TransactionService {
  web3: Web3;

  pollingInterval: number;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
  }

  // eslint-disable-next-line class-methods-use-this
  getStatusName(value) {
    const RFIDStatuses = {
      Pending: 0,
      Available: 1,
      Unavailable: 2,
      Deleted: 3,
    };
    // Iterate through the keys of RFIDStatuses
    // eslint-disable-next-line no-restricted-syntax
    for (const key in RFIDStatuses) {
      // If the value is equal to the value of the key, return the key
      if (RFIDStatuses[key] === value) {
        return key;
      }
    }
    // If the value is not found, return null
    return null;
  }

  async detectAndSaveTransactions(latestBlockNumber?: number) {
    try {
      // Fetch latest block
      // eslint-disable-next-line no-param-reassign
      if (!latestBlockNumber) latestBlockNumber = Number(await this.web3.eth.getBlockNumber());
      const latestBlock = await this.web3.eth.getBlock(latestBlockNumber, true);

      if (!latestBlock || !latestBlock.transactions) {
        logger.info('No transactions found in the latest block.');
        return;
      }
      // Process transactions in the latest block
      // eslint-disable-next-line consistent-return
      const transactionPromises = latestBlock.transactions.map(async (tx) => {
        if (typeof tx !== 'string') {
          const transaction = await this.web3.eth.getTransactionReceipt(tx.hash);
          if (!transaction) {
            logger.info('No transactions receipt found');
          }
          const { baseFeePerGas } = latestBlock;
          const priorityFeePerGas =
            Number(tx.maxPriorityFeePerGas) || Number(tx.gasPrice) - Number(baseFeePerGas);
          // check if the transaction is a contract creation Error checking contract type
          // to check whether the contract address is null or not. Contract address is null if the item is updated/deleted
          let receiverAddress: string = tx.to || 'null';
          if (transaction.contractAddress !== undefined) {
            receiverAddress = transaction.contractAddress;
          }
          // to check whether the address is contract or not
          const type = await checkAddressType(receiverAddress);
          let note: any = []; // Initialize as an empty array
          let onComplete: any;

          if (type === 'contract') {
            const contractType = await this.checkContractType(receiverAddress);
            const interactor = new ContractInteractor(abiStorage, methodConfig);
            const contractProxy = new ContractProxy(interactor, contractType, receiverAddress);

            if (contractType !== 'Unknown') {
              note = await contractProxy.getHistory();
              onComplete = await contractProxy.getStatus();
            } else {
              note = []; // Assign an empty array
              onComplete = 'Unknown';
            }

            // Ensure note is an array before accessing length
            if (!Array.isArray(note) || note.length <= 0) {
              note = [{ description: 'No history found for this contract address' }];
            }

            if (contractType === 'RFID') {
              const latestNote = note[note.length - 1];
              const latestDescription = latestNote.description;

              // Extract the numeric status code from the description
              const statusCodeMatch = latestDescription.match(/RFID status changed to (\d+)/);
              if (statusCodeMatch) {
                const statusCode = parseInt(statusCodeMatch[1], 10);
                const readableStatus = this.getStatusName(statusCode);
                note = latestDescription.replace(/\d+$/, readableStatus);
              } else {
                note = latestDescription;
              }
              onComplete = this.getStatusName(Number(onComplete));
            } else if (contractType === 'CERTIFICATE') {
              const latestNote = note[note.length - 1];
              const stringData = `${latestNote.action} by ${latestNote.modifiedBy}`;
              note = stringData;
            } else {
              note = 'No history found for this contract address';
              onComplete = 'Unknown';
            }
          }

          const transactionData = {
            hash: tx.hash,
            block: Number(latestBlock.number),
            senderAddress: tx.from,
            amount: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            receiverAddress: tx.to || 'null',
            contractAddress: transaction.contractAddress || 'null',
            status: transaction.status,
            input: tx.input || '0x',
            value: Number(this.web3.utils.fromWei(tx.value.toString(), 'ether')),
            gasPrice: tx.gasPrice
              ? Number(this.web3.utils.fromWei(tx.gasPrice.toString(), 'gwei'))
              : 0,
            gasLimit: Number(tx.gas),
            gasUsed: Number(transaction.gasUsed),
            gasFees: Number(this.web3.utils.fromWei((tx.gasPrice * tx.gas).toString(), 'ether')),
            timestamp: new Date(Number(latestBlock.timestamp) * 1000),
            maxFeePerGas: tx.maxFeePerGas
              ? Number(this.web3.utils.fromWei(tx.maxFeePerGas.toString(), 'gwei'))
              : 0,
            maxPriorityFeePerGas: priorityFeePerGas
              ? Number(this.web3.utils.fromWei(priorityFeePerGas.toString(), 'gwei'))
              : 0,
            baseFeePerGas: baseFeePerGas
              ? Number(this.web3.utils.fromWei(baseFeePerGas.toString(), 'gwei'))
              : 0,
            // Calculate the transaction fee based on EIP-1559
            transactionFee: transaction.effectiveGasPrice
              ? Number(
                  this.web3.utils.fromWei(
                    (
                      Number(transaction.effectiveGasPrice) * Number(transaction.gasUsed)
                    ).toString(),
                    'ether'
                  )
                )
              : 0,
            note,
            onComplete,
          };
          return TransactionModel.create(transactionData);
        }
      });

      await Promise.all(transactionPromises);
    } catch (error) {
      logger.error('Error detecting and saving transactions:', error);
    }
  }

  async checkContractType(contractAddress: string): Promise<string> {
    try {
      const contract = new this.web3.eth.Contract(commonABI, contractAddress);
      if (contract.methods.CONTRACT_TYPE) {
        return (await contract.methods.CONTRACT_TYPE().call()) || 'Unknown';
      }
      logger.info('CONTRACT_TYPE function not found in contract:', contractAddress);
      return 'Unknown';
    } catch (error) {
      logger.info('Error checking contract type (expected for some contracts):', error.message);
      return 'Unknown'; // Return 'Unknown' when CONTRACT_TYPE is not available
    }
  }
}

export default new TransactionService();
