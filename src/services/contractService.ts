import Web3 from 'web3';
import config from '@config/config';

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
}

export default new ContractService();
