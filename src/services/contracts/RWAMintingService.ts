import { ContractService, TransactionResult, StellarWalletProvider, ContractClientOptions } from './ContractService';
import { getContractAddress, AssetType, NETWORK_CONFIG } from '../../config/contracts';
import { SimulationService } from '../localStorage/SimulationService';

/**
 * RWA Token Minting Service
 * Real contract integration for minting RWA tokens
 *
 * STATUS: ✅ WORKING (contracts deployed and tested)
 * Function: mint_rwa_tokenss(user, amount)
 * Features: Auto-whitelisting, event emission
 */
export class RWAMintingService extends ContractService {
  private assetType: AssetType;

  constructor(assetType: AssetType, wallet?: StellarWalletProvider) {
    const contractId = getContractAddress('rwa', assetType);
    super({
      contractId,
      networkPassphrase: NETWORK_CONFIG.networkPassphrase,
      rpcUrl: NETWORK_CONFIG.rpcUrl,
      wallet,
    });
    this.assetType = assetType;
  }

  /**
   * Mint RWA tokens (REAL CONTRACT CALL)
   * This function is verified to work on testnet
   * Automatically whitelists the user
   */
  async mintRWATokens(
    userAddress: string,
    amount: number,
    wallet?: StellarWalletProvider
  ): Promise<TransactionResult> {
    try {
      const contractAmount = this.toContractUnits(amount);

      // Call real contract
      const result = await this.invokeContract(
        'mint_rwa_tokenss',
        {
          user: userAddress,
          amount: contractAmount.toString(),
        },
        wallet
      );

      if (result.success) {
        // Update localStorage for UI consistency
        SimulationService.updateRWABalance(userAddress, this.assetType, amount);

        // Add transaction record
        SimulationService.addTransaction(userAddress, {
          id: `tx_${Date.now()}`,
          type: 'mint',
          assetType: this.assetType,
          amount,
          timestamp: Date.now(),
          status: 'completed',
          txHash: result.transactionHash,
        });
      }

      return result;
    } catch (error) {
      console.error('RWA minting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Minting failed',
      };
    }
  }

  /**
   * Get RWA balance (REAL CONTRACT QUERY)
   */
  async getBalance(userAddress: string): Promise<number> {
    try {
      const result = await this.queryContract('balance', { account: userAddress });
      const balance = BigInt(result || '0');
      return this.fromContractUnits(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Check if user is whitelisted (REAL CONTRACT QUERY)
   */
  async isWhitelisted(userAddress: string): Promise<boolean> {
    try {
      const result = await this.queryContract('allowed', { account: userAddress });
      return Boolean(result);
    } catch (error) {
      console.error('Failed to check whitelist status:', error);
      return false;
    }
  }

  /**
   * Get total supply (REAL CONTRACT QUERY)
   */
  async getTotalSupply(): Promise<number> {
    try {
      const result = await this.queryContract('total_supply');
      const supply = BigInt(result || '0');
      return this.fromContractUnits(supply);
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return 0;
    }
  }

  /**
   * Convert RWA amount to contract units (18 decimals)
   */
  private toContractUnits(rwaAmount: number): bigint {
    return BigInt(Math.floor(rwaAmount * 1e18));
  }

  /**
   * Convert contract units to RWA amount
   */
  private fromContractUnits(contractUnits: bigint): number {
    return Number(contractUnits) / 1e18;
  }
}

/**
 * Factory function to create minting service for specific asset
 */
export function createRWAMintingService(
  assetType: AssetType,
  wallet?: StellarWalletProvider
): RWAMintingService {
  return new RWAMintingService(assetType, wallet);
}
