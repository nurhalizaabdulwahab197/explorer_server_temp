import ContratInteractor from './contractFactory';

class ContractProxy {
  interactor: any;

  contractType: any;

  contractAddress: any;

  constructor(
    contractInteractor: ContratInteractor,
    contractType: string,
    contractAddress: string
  ) {
    this.interactor = contractInteractor;
    this.contractType = contractType;
    this.contractAddress = contractAddress;
  }

  async getStatus() {
    return this.interactor.invokeMethod(this.contractType, this.contractAddress, 'getStatus');
  }

  async getHistory() {
    return this.interactor.invokeMethod(this.contractType, this.contractAddress, 'getHistory');
  }
}

export default ContractProxy;
