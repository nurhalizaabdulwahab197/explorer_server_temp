import fs from 'fs/promises';
import path from 'path';

class FileAbiStorage {
  private baseDir: string;

  constructor() {
    // Ensure baseDir points to 'dist/contracts' after build
    this.baseDir = path.resolve(__dirname, 'contracts');
  }

  async getABI(contractType: string): Promise<any[]> {
    try {
      // Construct the file path dynamically based on the contract type
      const filePath = path.join(this.baseDir, `${contractType.toUpperCase()}.json`);

      // Check if the file exists
      await fs.access(filePath);

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
