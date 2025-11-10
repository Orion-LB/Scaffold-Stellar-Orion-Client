/**
 * localStorage Simulation Layer
 * Provides persistent mock data for development and testing
 * Allows users to interact with the app without contract calls
 */

import { AssetType } from "@/services/contracts";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AssetBalance {
  rwaBalance: bigint;
  stRwaBalance: bigint;
  claimableYield: bigint;
  price: number;
}

export interface VaultLoanInfo {
  borrowedAmount: number;
  hasLoan: boolean;
}

export interface Transaction {
  id: string;
  type: "Stake" | "Unstake" | "Borrow" | "Repay" | "Claim" | "Mint";
  asset: string;
  amount: string;
  date: string;
  timestamp: number;
  hash: string;
  status: "Completed" | "Pending" | "Failed";
}

export interface UserProfile {
  address: string;
  assetBalances: Record<AssetType, AssetBalance>;
  vaultLoans: Record<AssetType, VaultLoanInfo>;
  usdcBalance: bigint;
  activeLoan: any | null;
  vaultAutoRepay: Record<AssetType, boolean>;
  transactions: Transaction[];
  lastUpdated: number;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_PREFIX = "orion_rwa_";
const PROFILE_KEY = `${STORAGE_PREFIX}profile`;
const TRANSACTIONS_KEY = `${STORAGE_PREFIX}transactions`;

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_ASSET_BALANCES: Record<AssetType, AssetBalance> = {
  [AssetType.INVOICES]: {
    rwaBalance: 5000n * BigInt(10**18),
    stRwaBalance: 25000n * BigInt(10**18),
    claimableYield: 450n * BigInt(10**7),
    price: 1.05
  },
  [AssetType.TBILLS]: {
    rwaBalance: 3000n * BigInt(10**18),
    stRwaBalance: 15000n * BigInt(10**18),
    claimableYield: 280n * BigInt(10**7),
    price: 1.02
  },
  [AssetType.REALESTATE]: {
    rwaBalance: 2000n * BigInt(10**18),
    stRwaBalance: 10000n * BigInt(10**18),
    claimableYield: 320n * BigInt(10**7),
    price: 1.08
  },
};

const DEFAULT_VAULT_LOANS: Record<AssetType, VaultLoanInfo> = {
  [AssetType.INVOICES]: { borrowedAmount: 12000, hasLoan: true },
  [AssetType.TBILLS]: { borrowedAmount: 7500, hasLoan: true },
  [AssetType.REALESTATE]: { borrowedAmount: 0, hasLoan: false },
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "Stake",
    asset: "Invoice RWA",
    amount: "50.00",
    date: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    hash: "0x1234...5678",
    status: "Completed"
  },
  {
    id: "2",
    type: "Claim",
    asset: "T-Bills Vault",
    amount: "$45.00",
    date: "1 day ago",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    hash: "0xabcd...efgh",
    status: "Completed"
  },
  {
    id: "3",
    type: "Borrow",
    asset: "USDC",
    amount: "$1,200.00",
    date: "3 days ago",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    hash: "0x9876...5432",
    status: "Completed"
  },
  {
    id: "4",
    type: "Repay",
    asset: "USDC",
    amount: "$100.00",
    date: "5 days ago",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    hash: "0xfedc...ba98",
    status: "Completed"
  },
  {
    id: "5",
    type: "Mint",
    asset: "Invoice RWA",
    amount: "100.00",
    date: "1 week ago",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    hash: "0x1111...2222",
    status: "Completed"
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert BigInt to string for JSON serialization
 */
function serializeProfile(profile: UserProfile): string {
  const serialized = {
    ...profile,
    usdcBalance: profile.usdcBalance.toString(),
    assetBalances: Object.entries(profile.assetBalances).reduce((acc, [key, value]) => {
      acc[key as AssetType] = {
        ...value,
        rwaBalance: value.rwaBalance.toString(),
        stRwaBalance: value.stRwaBalance.toString(),
        claimableYield: value.claimableYield.toString(),
      };
      return acc;
    }, {} as any),
  };
  return JSON.stringify(serialized);
}

/**
 * Convert string back to BigInt after JSON deserialization
 */
function deserializeProfile(data: string): UserProfile {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    usdcBalance: BigInt(parsed.usdcBalance),
    assetBalances: Object.entries(parsed.assetBalances).reduce((acc, [key, value]: [string, any]) => {
      acc[key as AssetType] = {
        ...value,
        rwaBalance: BigInt(value.rwaBalance),
        stRwaBalance: BigInt(value.stRwaBalance),
        claimableYield: BigInt(value.claimableYield),
      };
      return acc;
    }, {} as Record<AssetType, AssetBalance>),
  };
}

/**
 * Generate a mock transaction hash
 */
function generateMockHash(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  const segment = () => Array.from({ length: 4 }, hex).join('');
  return `0x${segment()}...${segment()}`;
}

/**
 * Format relative time from timestamp
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

/**
 * Initialize profile for a wallet address
 */
export function initializeProfile(address: string): UserProfile {
  const profile: UserProfile = {
    address,
    assetBalances: DEFAULT_ASSET_BALANCES,
    vaultLoans: DEFAULT_VAULT_LOANS,
    usdcBalance: 8500n * BigInt(10**7),
    activeLoan: null,
    vaultAutoRepay: {
      [AssetType.INVOICES]: false,
      [AssetType.TBILLS]: false,
      [AssetType.REALESTATE]: false,
    },
    transactions: DEFAULT_TRANSACTIONS,
    lastUpdated: Date.now(),
  };

  saveProfile(profile);
  return profile;
}

/**
 * Load profile from localStorage
 */
export function loadProfile(address: string): UserProfile | null {
  try {
    const key = `${PROFILE_KEY}_${address}`;
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    return deserializeProfile(data);
  } catch (error) {
    console.error("Failed to load profile from localStorage:", error);
    return null;
  }
}

/**
 * Save profile to localStorage
 */
export function saveProfile(profile: UserProfile): void {
  try {
    const key = `${PROFILE_KEY}_${profile.address}`;
    const data = serializeProfile({
      ...profile,
      lastUpdated: Date.now(),
    });
    localStorage.setItem(key, data);
  } catch (error) {
    console.error("Failed to save profile to localStorage:", error);
  }
}

/**
 * Get or create profile for address
 */
export function getProfile(address: string): UserProfile {
  const existing = loadProfile(address);
  if (existing) {
    return existing;
  }
  return initializeProfile(address);
}

/**
 * Clear profile for address
 */
export function clearProfile(address: string): void {
  try {
    const key = `${PROFILE_KEY}_${address}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear profile:", error);
  }
}

// ============================================================================
// BALANCE OPERATIONS
// ============================================================================

/**
 * Update asset balance
 */
export function updateAssetBalance(
  address: string,
  assetType: AssetType,
  updates: Partial<AssetBalance>
): void {
  const profile = getProfile(address);
  profile.assetBalances[assetType] = {
    ...profile.assetBalances[assetType],
    ...updates,
  };
  saveProfile(profile);
}

/**
 * Update USDC balance
 */
export function updateUSDCBalance(address: string, newBalance: bigint): void {
  const profile = getProfile(address);
  profile.usdcBalance = newBalance;
  saveProfile(profile);
}

/**
 * Update vault loan info
 */
export function updateVaultLoan(
  address: string,
  assetType: AssetType,
  loanInfo: Partial<VaultLoanInfo>
): void {
  const profile = getProfile(address);
  profile.vaultLoans[assetType] = {
    ...profile.vaultLoans[assetType],
    ...loanInfo,
  };
  saveProfile(profile);
}

/**
 * Toggle auto-repay for vault
 */
export function toggleAutoRepay(address: string, assetType: AssetType, enabled: boolean): void {
  const profile = getProfile(address);
  profile.vaultAutoRepay[assetType] = enabled;
  saveProfile(profile);
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Add a new transaction
 */
export function addTransaction(
  address: string,
  type: Transaction["type"],
  asset: string,
  amount: string
): Transaction {
  const profile = getProfile(address);

  const transaction: Transaction = {
    id: Date.now().toString(),
    type,
    asset,
    amount,
    timestamp: Date.now(),
    date: "Just now",
    hash: generateMockHash(),
    status: "Completed",
  };

  profile.transactions.unshift(transaction);
  saveProfile(profile);

  return transaction;
}

/**
 * Get all transactions
 */
export function getTransactions(address: string): Transaction[] {
  const profile = loadProfile(address);
  if (!profile) {
    return [];
  }

  // Update relative dates
  return profile.transactions.map(tx => ({
    ...tx,
    date: formatRelativeTime(tx.timestamp),
  }));
}

/**
 * Clear all transactions
 */
export function clearTransactions(address: string): void {
  const profile = getProfile(address);
  profile.transactions = [];
  saveProfile(profile);
}

// ============================================================================
// SIMULATION FUNCTIONS
// ============================================================================

/**
 * Simulate staking RWA tokens
 */
export function simulateStake(
  address: string,
  assetType: AssetType,
  amount: bigint
): void {
  const profile = getProfile(address);
  const balances = profile.assetBalances[assetType];

  // Deduct RWA, add stRWA (1:1)
  balances.rwaBalance -= amount;
  balances.stRwaBalance += amount;

  profile.assetBalances[assetType] = balances;
  saveProfile(profile);

  // Add transaction
  const amountStr = (Number(amount) / 1e18).toFixed(2);
  addTransaction(address, "Stake", `${assetType} RWA`, amountStr);
}

/**
 * Simulate unstaking stRWA tokens
 */
export function simulateUnstake(
  address: string,
  assetType: AssetType,
  amount: bigint
): void {
  const profile = getProfile(address);
  const balances = profile.assetBalances[assetType];

  // Deduct stRWA, add RWA (1:1)
  balances.stRwaBalance -= amount;
  balances.rwaBalance += amount;

  profile.assetBalances[assetType] = balances;
  saveProfile(profile);

  // Add transaction
  const amountStr = (Number(amount) / 1e18).toFixed(2);
  addTransaction(address, "Unstake", `${assetType} stRWA`, amountStr);
}

/**
 * Simulate claiming yield
 */
export function simulateClaimYield(
  address: string,
  assetType: AssetType
): bigint {
  const profile = getProfile(address);
  const balances = profile.assetBalances[assetType];
  const yieldAmount = balances.claimableYield;

  // Reset yield, add to USDC balance
  balances.claimableYield = 0n;
  profile.usdcBalance += yieldAmount;

  profile.assetBalances[assetType] = balances;
  saveProfile(profile);

  // Add transaction
  const amountStr = `$${(Number(yieldAmount) / 1e7).toFixed(2)}`;
  addTransaction(address, "Claim", `${assetType} Vault`, amountStr);

  return yieldAmount;
}

/**
 * Simulate minting RWA tokens
 */
export function simulateMint(
  address: string,
  assetType: AssetType,
  amount: bigint
): void {
  const profile = getProfile(address);
  const balances = profile.assetBalances[assetType];

  // Add RWA tokens
  balances.rwaBalance += amount;

  profile.assetBalances[assetType] = balances;
  saveProfile(profile);

  // Add transaction
  const amountStr = (Number(amount) / 1e18).toFixed(2);
  addTransaction(address, "Mint", `${assetType} RWA`, amountStr);
}

/**
 * Simulate borrowing USDC
 */
export function simulateBorrow(
  address: string,
  assetType: AssetType,
  amount: bigint,
  collateralAmount: bigint
): void {
  const profile = getProfile(address);

  // Add USDC to balance
  profile.usdcBalance += amount;

  // Update vault loan
  profile.vaultLoans[assetType] = {
    borrowedAmount: Number(amount) / 1e7,
    hasLoan: true,
  };

  saveProfile(profile);

  // Add transaction
  const amountStr = `$${(Number(amount) / 1e7).toFixed(2)}`;
  addTransaction(address, "Borrow", "USDC", amountStr);
}

/**
 * Simulate repaying loan
 */
export function simulateRepay(
  address: string,
  assetType: AssetType,
  amount: bigint
): void {
  const profile = getProfile(address);

  // Deduct USDC from balance
  profile.usdcBalance -= amount;

  // Update vault loan
  const loanInfo = profile.vaultLoans[assetType];
  const newBorrowed = loanInfo.borrowedAmount - (Number(amount) / 1e7);

  profile.vaultLoans[assetType] = {
    borrowedAmount: Math.max(0, newBorrowed),
    hasLoan: newBorrowed > 0,
  };

  saveProfile(profile);

  // Add transaction
  const amountStr = `$${(Number(amount) / 1e7).toFixed(2)}`;
  addTransaction(address, "Repay", "USDC", amountStr);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all stored addresses
 */
export function getAllStoredAddresses(): string[] {
  const addresses: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROFILE_KEY)) {
        const address = key.replace(`${PROFILE_KEY}_`, '');
        addresses.push(address);
      }
    }
  } catch (error) {
    console.error("Failed to get stored addresses:", error);
  }

  return addresses;
}

/**
 * Clear all Orion data from localStorage
 */
export function clearAllData(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear all data:", error);
  }
}
