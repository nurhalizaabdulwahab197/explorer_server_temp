import fs from 'fs/promises';
import path from 'path';

class FileAbiStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(__dirname, 'contracts');
  }

  async getABI(contractType: string): Promise<any[]> {
    try {
      // Construct the file path dynamically based on the contract type
      const filePath = path.join(this.baseDir, `${contractType.toUpperCase()}.json`);
      const abiJson = await fs.readFile(filePath, 'utf8');
      const abiObject = JSON.parse(abiJson);
      // Assuming the JSON structure has an 'abi' key
      if (!abiObject.abi) {
        throw new Error('ABI not found in the JSON file');
      }
      return abiObject.abi;
    } catch (error) {
      throw new Error(`Failed to load ABI from file: ${error.message}`);
    }
  }
}

export default FileAbiStorage;
