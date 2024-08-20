import Web3 from 'web3';
import config from '@config/config';
import ABIStorage from './abiStorage';

const web3 = new Web3(new Web3.providers.HttpProvider(config.privateNetwork));
class ContractInteractor {
  abiStorage: any;

  methodConfig: any;

  constructor(abiStorage: ABIStorage, methodConfig: any) {
    this.abiStorage = abiStorage;
    this.methodConfig = methodConfig;
  }

  async invokeMethod(contractType: string, contractAddress: string, methodName: string) {
    const abi = await this.abiStorage.getABI(contractType);
    const contract = new web3.eth.Contract(abi, contractAddress);
    const methodKey = this.methodConfig[contractType].methods[methodName];

    if (contract.methods[methodKey]) {
      return contract.methods[methodKey]().call();
    }
    throw new Error(`Method ${methodName} not available for contract type ${contractType}`);
  }
}

export default ContractInteractor;
