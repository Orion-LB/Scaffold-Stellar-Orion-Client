// Contract Services
export { ContractService } from './ContractService';
export { VaultService } from './VaultService';
export { LendingPoolService } from './LendingPoolService';
export { MockRWAService } from './MockRWAService';
export { OracleService } from './OracleService';
export { USDCService } from './USDCService';
export { StakedRWAService } from './StakedRWAService';

// Alias for multi-asset compatibility
export { StakedRWAService as StRWAService } from './StakedRWAService';

// Types
export type {
  TransactionResult,
  StellarWalletProvider,
  SignOptions,
  SignedTransaction,
  ContractClientOptions
} from './ContractService';

export type { Vault } from './VaultService';
export type { LoanInfo } from './LendingPoolService';
export type { PriceData } from './OracleService';

// Contract addresses and configuration
// ✅ MULTI-ASSET DEPLOYMENT - COMPLETE
// Deployed: 2025-11-10 | Network: Stellar Testnet
// Oracle Updated: 2025-11-10 15:26 UTC (fixed get_price crash)
export const CONTRACT_ADDRESSES = {
  // Core Infrastructure
  USDC: 'CAXHQJ6IHN2TPAJ4NEOXJJLRRAO74BEAWA3RXHD6NSOWRBQCTVZA3ZGS',
  LENDING_POOL: 'CCW2TFZ7DWNMORNW3QVPYI5VYLNITMUMH42OKILXDLPN2J7HZQ545TWJ',
  MOCK_ORACLE: 'CDQ3C3T477QZFH6KQMQEA4HTIVIHOMN5YKDWHBDQT4EBO4MNXI5ZXKVX', // ✅ UPDATED 2025-11-10

  // Invoice RWA Tokens - ✅ DEPLOYED
  RWA_INVOICES: 'CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP',
  STRWA_INVOICES: 'CDHGP3XMH2FUQ6FFUHGLDFN5C26W7C6FW5GZ5N743M546KXWKHHK74IL',
  VAULT_INVOICES: 'CCYADH4LWFOIRCZPWCIMGG46M5ZUUQ3WQUA4FF2BJNSFQUHIKTE32N2G',

  // T-Bills RWA Tokens - ✅ DEPLOYED
  RWA_TBILLS: 'CD3ZKDA3VG4PQAPXCPJV6VZJ65ACA2N7ISPUF4FN73ITMCNHKCEGMZAW',
  STRWA_TBILLS: 'CDGL6V3VT6HAIWNDQLYTLWFXF4O7L3TNWYD3OUEE4JNCLX3EXHH2HSEA',
  VAULT_TBILLS: 'CAFQWK3D3QLMGSW2OL6HE3VTCLCKZKPWNTCTKBM5MFLKKZWIKTA6Z7DP',

  // Real Estate RWA Tokens - ✅ DEPLOYED
  RWA_REALESTATE: 'CCSCN4NNINMSENMRRFYHW7M6D3NBMK33NE3BA5XCCT26CSCJT5ZKYF46',
  STRWA_REALESTATE: 'CD5WDVFPWBLERKA3RYQT6L7V5J5NLHL3HP64WYJUVZMNUQLAGPLEYOZR',
  VAULT_REALESTATE: 'CAGUJJGFK7N5WC4CEYS3CS6QH7RIAWBPZIMB6ELVHGBJ5KBA3R3WMWLI',

  // Legacy single-asset addresses (kept for backwards compatibility)
  MOCK_RWA_A: 'CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP', // Using invoices as default
  STAKED_RWA_A: 'CDHGP3XMH2FUQ6FFUHGLDFN5C26W7C6FW5GZ5N743M546KXWKHHK74IL', // Using invoices as default
  RWA_VAULT_A: 'CCYADH4LWFOIRCZPWCIMGG46M5ZUUQ3WQUA4FF2BJNSFQUHIKTE32N2G', // Using invoices as default
};

// Network configuration
export const NETWORK_CONFIG = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
  },
  MAINNET: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban-mainnet.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
  },
  FUTURENET: {
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
  },
};

// Service factory functions
import { VaultService } from './VaultService';
import { LendingPoolService } from './LendingPoolService';
import { MockRWAService } from './MockRWAService';
import { OracleService } from './OracleService';
import { USDCService } from './USDCService';
import { StakedRWAService } from './StakedRWAService';
import type { StellarWalletProvider } from './ContractService';

export const createVaultService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new VaultService({
    contractId: CONTRACT_ADDRESSES.RWA_VAULT_A,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createLendingPoolService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new LendingPoolService({
    contractId: CONTRACT_ADDRESSES.LENDING_POOL,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createMockRWAService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new MockRWAService({
    contractId: CONTRACT_ADDRESSES.MOCK_RWA_A,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createOracleService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new OracleService({
    contractId: CONTRACT_ADDRESSES.MOCK_ORACLE,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createUSDCService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new USDCService({
    contractId: CONTRACT_ADDRESSES.USDC,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createStakedRWAService = (wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new StakedRWAService({
    contractId: CONTRACT_ADDRESSES.STAKED_RWA_A,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

// ============================================================================
// ✅ MULTI-ASSET CONFIGURATION - PRODUCTION READY
// Each asset type now has its own deployed contracts
// Deployed: 2025-11-10 | Network: Stellar Testnet
// See: orion/Backened_ready.md for full deployment details
// ============================================================================

/**
 * Asset types supported by the platform
 * Each type has separate RWA, stRWA, and Vault contracts
 */
export enum AssetType {
  INVOICES = 'invoices',
  TBILLS = 'tbills',
  REALESTATE = 'realestate'
}

/**
 * Multi-asset contract configuration
 * ✅ PRODUCTION READY: Each asset type has unique deployed contracts
 */
export const ASSET_CONTRACTS = {
  [AssetType.INVOICES]: {
    name: 'Invoice RWA',
    displayName: 'Invoice Financing',
    shortName: 'Invoices',
    symbol: 'iRWA',
    emoji: '📄',
    rwa: CONTRACT_ADDRESSES.RWA_INVOICES,
    stRwa: CONTRACT_ADDRESSES.STRWA_INVOICES,
    vault: CONTRACT_ADDRESSES.VAULT_INVOICES,
    mockPrice: 1.05, // Oracle price: $1.05 per token
    baseAPY: 8.5,
    decimals: 18, // RWA/stRWA token decimals
  },
  [AssetType.TBILLS]: {
    name: 'T-Bills Vault',
    displayName: 'Treasury Bills',
    shortName: 'T-Bills',
    symbol: 'tRWA',
    emoji: '🏦',
    rwa: CONTRACT_ADDRESSES.RWA_TBILLS,
    stRwa: CONTRACT_ADDRESSES.STRWA_TBILLS,
    vault: CONTRACT_ADDRESSES.VAULT_TBILLS,
    mockPrice: 1.02, // Oracle price: $1.02 per token
    baseAPY: 5.2,
    decimals: 18,
  },
  [AssetType.REALESTATE]: {
    name: 'Real Estate',
    displayName: 'Real Estate',
    shortName: 'Real Estate',
    symbol: 'rRWA',
    emoji: '🏢',
    rwa: CONTRACT_ADDRESSES.RWA_REALESTATE,
    stRwa: CONTRACT_ADDRESSES.STRWA_REALESTATE,
    vault: CONTRACT_ADDRESSES.VAULT_REALESTATE,
    mockPrice: 1.08, // Oracle price: $1.08 per token
    baseAPY: 12.3,
    decimals: 18,
  },
};

/**
 * Get all supported asset types
 * @returns Array of all AssetType values
 */
export const getAllAssetTypes = (): AssetType[] => {
  return [AssetType.INVOICES, AssetType.TBILLS, AssetType.REALESTATE];
};

/**
 * Get configuration for a specific asset type
 * @param assetType - The asset type to get config for
 * @returns Asset configuration object
 */
export const getAssetConfig = (assetType: AssetType) => {
  return ASSET_CONTRACTS[assetType];
};

/**
 * Get asset type from contract address
 * Looks up which asset type a contract address belongs to
 * @param contractAddress - The contract address to look up
 * @returns AssetType or undefined
 */
export const getAssetTypeFromAddress = (contractAddress: string): AssetType | undefined => {
  for (const [assetType, config] of Object.entries(ASSET_CONTRACTS)) {
    if (
      config.rwa === contractAddress ||
      config.stRwa === contractAddress ||
      config.vault === contractAddress
    ) {
      return assetType as AssetType;
    }
  }
  return undefined;
};

/**
 * Create service instances from contract addresses
 * These helpers allow ProfileSection to instantiate services with just a contract ID
 */
export const createMockRWAServiceFromAddress = (contractId: string, wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new MockRWAService({
    contractId,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createStRWAServiceFromAddress = (contractId: string, wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new StakedRWAService({
    contractId,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};

export const createVaultServiceFromAddress = (contractId: string, wallet?: StellarWalletProvider, network: keyof typeof NETWORK_CONFIG = 'TESTNET') => {
  return new VaultService({
    contractId,
    networkPassphrase: NETWORK_CONFIG[network].networkPassphrase,
    rpcUrl: NETWORK_CONFIG[network].rpcUrl,
    wallet,
  });
};