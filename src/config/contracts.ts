/**
 * Contract Configuration
 * Deployed contract addresses and network settings
 */

import deployedAddresses from '../../contracts/contracts/deployed-addresses.json';

export interface ContractAddresses {
  usdc_mock: string;
  mock_rwa_token: string;
  strwa_token: string;
  rwa_vault: string;
  mock_oracle: string;
  lending_pool: string;
}

export interface NetworkConfig {
  network: string;
  rpcUrl: string;
  networkPassphrase: string;
  deployerAddress: string;
}

export const NETWORK_CONFIG: NetworkConfig = {
  network: deployedAddresses.network,
  rpcUrl: deployedAddresses.rpc_url,
  networkPassphrase: deployedAddresses.network_passphrase,
  deployerAddress: deployedAddresses.deployer_address,
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  usdc_mock: deployedAddresses.contracts.usdc_mock,
  mock_rwa_token: deployedAddresses.contracts.rwa_invoices, // Use invoices as default
  strwa_token: deployedAddresses.contracts.strwa_invoices, // Use invoices as default  
  rwa_vault: deployedAddresses.contracts.vault_invoices, // Use invoices as default
  mock_oracle: deployedAddresses.contracts.mock_oracle,
  lending_pool: deployedAddresses.contracts.lending_pool,
};

// Multi-asset addresses from deployed-addresses.json
export const MULTI_ASSET_ADDRESSES = {
  rwaTokens: {
    invoices: deployedAddresses.contracts.rwa_invoices,
    tbills: deployedAddresses.contracts.rwa_tbills,
    real_estate: deployedAddresses.contracts.rwa_realestate,
  },
  strwaTokens: {
    invoices: deployedAddresses.contracts.strwa_invoices,
    tbills: deployedAddresses.contracts.strwa_tbills,
    real_estate: deployedAddresses.contracts.strwa_realestate,
  },
  vaults: {
    invoices: deployedAddresses.contracts.vault_invoices,
    tbills: deployedAddresses.contracts.vault_tbills,
    real_estate: deployedAddresses.contracts.vault_realestate,
  },
  core: {
    usdc: deployedAddresses.contracts.usdc_mock,
    oracle: deployedAddresses.contracts.mock_oracle,
    lendingPool: deployedAddresses.contracts.lending_pool,
  },
};

export type AssetType = 'invoices' | 'tbills' | 'real_estate';

// Enum-like object for AssetType values
export const AssetTypeEnum = {
  INVOICES: 'invoices' as AssetType,
  TBILLS: 'tbills' as AssetType,
  REALESTATE: 'real_estate' as AssetType,
} as const;

export const ASSET_NAMES: Record<AssetType, string> = {
  invoices: 'Invoice Tokens',
  tbills: 'T-Bills',
  real_estate: 'Real Estate',
};

export const ASSET_DESCRIPTIONS: Record<AssetType, string> = {
  invoices: 'Tokenized invoice financing with 8.5% APY',
  tbills: 'Treasury bill-backed tokens with 5.2% APY',
  real_estate: 'Real estate-backed tokens with 6.8% APY',
};

export function getContractAddress(type: 'rwa' | 'strwa' | 'vault', assetType: AssetType): string {
  switch (type) {
    case 'rwa':
      return MULTI_ASSET_ADDRESSES.rwaTokens[assetType];
    case 'strwa':
      return MULTI_ASSET_ADDRESSES.strwaTokens[assetType];
    case 'vault':
      return MULTI_ASSET_ADDRESSES.vaults[assetType];
    default:
      throw new Error(`Unknown contract type: ${type}`);
  }
}

export function isContractDeployed(): boolean {
  return Boolean(
    MULTI_ASSET_ADDRESSES.rwaTokens.invoices &&
    MULTI_ASSET_ADDRESSES.strwaTokens.invoices &&
    MULTI_ASSET_ADDRESSES.vaults.invoices
  );
}
