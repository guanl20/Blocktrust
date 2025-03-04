import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// Contract ABI will be generated after compilation
import SupplyChainABI from '../../../artifacts/contracts/SupplyChain.sol/SupplyChain.json';

/**
 * BlockchainService: Handles interaction with the Ethereum blockchain
 */
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(contractAddress: string) {
    // Connect to the blockchain network
    this.provider = new ethers.JsonRpcProvider(process.env.VITE_ETHEREUM_RPC_URL);
    
    // Initialize contract instance
    this.contract = new ethers.Contract(
      contractAddress,
      SupplyChainABI.abi,
      this.provider
    );
  }

  /**
   * Connects a wallet to the service
   */
  async connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = await this.provider.getSigner();
    this.contract = this.contract.connect(this.signer);
  }

  /**
   * Creates a new product on the blockchain
   */
  async createProduct(name: string, description: string) {
    try {
      const tx = await this.contract.createProduct(name, description);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Transfers product ownership
   */
  async transferOwnership(productId: number, newOwner: string) {
    try {
      const tx = await this.contract.transferOwnership(productId, newOwner);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  }

  /**
   * Updates product status
   */
  async updateStatus(productId: number, status: number) {
    try {
      const tx = await this.contract.updateStatus(productId, status);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  /**
   * Gets product information
   */
  async getProduct(productId: number) {
    try {
      const product = await this.contract.getProduct(productId);
      return {
        name: product[0],
        description: product[1],
        currentOwner: product[2],
        status: product[3],
        timestamp: new Date(product[4].toNumber() * 1000)
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }
}

// Hook for blockchain interactions
export function useBlockchain() {
  const { toast } = useToast();
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error('Contract address not configured');
  }

  const service = new BlockchainService(contractAddress);

  return {
    createProduct: async (name: string, description: string) => {
      try {
        await service.connectWallet();
        const hash = await service.createProduct(name, description);
        toast({
          title: 'Product Created',
          description: `Transaction hash: ${hash}`,
        });
        return hash;
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    transferOwnership: async (productId: number, newOwner: string) => {
      try {
        await service.connectWallet();
        const hash = await service.transferOwnership(productId, newOwner);
        toast({
          title: 'Ownership Transferred',
          description: `Transaction hash: ${hash}`,
        });
        return hash;
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    updateStatus: async (productId: number, status: number) => {
      try {
        await service.connectWallet();
        const hash = await service.updateStatus(productId, status);
        toast({
          title: 'Status Updated',
          description: `Transaction hash: ${hash}`,
        });
        return hash;
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    getProduct: service.getProduct.bind(service),
  };
}
