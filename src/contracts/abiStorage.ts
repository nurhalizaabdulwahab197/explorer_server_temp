// src/contracts/abiStorage.ts

import CERTIFICATE from '@contracts/contracts/CERTIFICATE.json';
import RFID from '@contracts/contracts/RFID.json';

class FileAbiStorage {
  private abiMap: { [key: string]: any[] } = {
    CERTIFICATE: CERTIFICATE.abi,
    RFID: RFID.abi,
  };

  async getABI(contractType: string): Promise<any[]> {
    const abi = this.abiMap[contractType.toUpperCase()];
    if (!abi) {
      throw new Error(`ABI not found for contract type: ${contractType}`);
    }
    return abi;
  }
}

export default FileAbiStorage;
