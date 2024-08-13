import Web3 from 'web3';
import config from '@config/config';
import logger from '@core/utils/logger';
import item from '../core/contracts/itemContractV1.json';

const { abi } = item;
class ContractService {
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

  // eslint-disable-next-line consistent-return
  async readContract(contractAddress?: string) {
    try {
      const contract = new this.web3.eth.Contract(abi, contractAddress);
      const data = await contract.methods.rfidStatus().call();
      const stringData = this.getStatusName(Number(data));
      logger.info(stringData);
      return stringData;
    } catch (error) {
      logger.error('Error detecting and saving transactions:', error);
    }
  }
}

export default new ContractService();
