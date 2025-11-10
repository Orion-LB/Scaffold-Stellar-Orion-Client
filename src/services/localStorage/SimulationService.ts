/**
 * LocalStorage Simulation Service
 * Simulates backend functionality for features requiring additional contract setup
 *
 * REAL CONTRACT INTEGRATION:
 * - RWA Token Minting (WORKS - contracts deployed and tested)
 *
 * SIMULATED FEATURES (require contract setup):
 * - Staking/Unstaking (needs vault whitelisting)
 * - Borrowing/Repaying (needs LP liquidity)
 * - Yield claiming (needs yield funding)
 */

// ============ Types ============

export interface UserStake {
  id: string;
  assetType: 'invoices' | 'tbills' | 'real_estate';
  rwaAmount: number;
  strwaAmount: number;
  apy: number;
  stakedAt: number;
  lastYieldClaim: number;
  accumulatedYield: number;
}

export interface UserLoan {
  id: string;
  borrower: string;
  collateralAssets: {
    assetType: 'invoices' | 'tbills' | 'real_estate';
    strwaAmount: number;
    valueUSD: number;
  }[];
  principalAmount: number;
  interestRate: number;
  currentDebt: number;
  healthFactor: number;
  durationMonths: number;
  originatedAt: number;
  lastRepayment: number;
  status: 'active' | 'repaid' | 'liquidated';
}

export interface Transaction {
  id: string;
  type: 'mint' | 'stake' | 'unstake' | 'borrow' | 'repay' | 'claim_yield';
  assetType?: 'invoices' | 'tbills' | 'real_estate';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  details?: any;
}

export interface UserProfile {
  address: string;
  rwaBalances: {
    invoices: number;
    tbills: number;
    real_estate: number;
  };
  strwaBalances: {
    invoices: number;
    tbills: number;
    real_estate: number;
  };
  usdcBalance: number;
  totalStakedValue: number;
  totalBorrowedValue: number;
  totalYieldEarned: number;
  healthFactor: number;
  joinedAt: number;
  lastActivity: number;
}

// ============ Storage Keys ============

const STORAGE_KEYS = {
  PROFILE: (address: string) => `orion_profile_${address}`,
  STAKES: (address: string) => `orion_stakes_${address}`,
  LOANS: (address: string) => `orion_loans_${address}`,
  TRANSACTIONS: (address: string) => `orion_transactions_${address}`,
  GLOBAL_CONFIG: 'orion_global_config',
};

// ============ Simulation Service ============

export class SimulationService {
  private static readonly APY_RATES = {
    invoices: 8.5,
    tbills: 5.2,
    real_estate: 6.8,
  };

  private static readonly COLLATERAL_RATIOS = {
    invoices: 0.75, // 75% LTV
    tbills: 0.80,   // 80% LTV
    real_estate: 0.70, // 70% LTV
  };

  private static readonly ASSET_PRICES = {
    invoices: 1.05,
    tbills: 1.02,
    real_estate: 1.00,
  };

  // ============ Profile Management ============

  static getProfile(address: string): UserProfile {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE(address));
    if (stored) {
      return JSON.parse(stored);
    }

    // Create new profile
    const newProfile: UserProfile = {
      address,
      rwaBalances: { invoices: 0, tbills: 0, real_estate: 0 },
      strwaBalances: { invoices: 0, tbills: 0, real_estate: 0 },
      usdcBalance: 10000, // Initial mock USDC
      totalStakedValue: 0,
      totalBorrowedValue: 0,
      totalYieldEarned: 0,
      healthFactor: 0,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.saveProfile(address, newProfile);
    return newProfile;
  }

  static saveProfile(address: string, profile: UserProfile): void {
    profile.lastActivity = Date.now();
    localStorage.setItem(STORAGE_KEYS.PROFILE(address), JSON.stringify(profile));
  }

  static updateRWABalance(address: string, assetType: keyof UserProfile['rwaBalances'], amount: number): void {
    const profile = this.getProfile(address);
    profile.rwaBalances[assetType] += amount;
    this.saveProfile(address, profile);
  }

  // ============ Staking Operations ============

  static getStakes(address: string): UserStake[] {
    const stored = localStorage.getItem(STORAGE_KEYS.STAKES(address));
    return stored ? JSON.parse(stored) : [];
  }

  static saveStakes(address: string, stakes: UserStake[]): void {
    localStorage.setItem(STORAGE_KEYS.STAKES(address), JSON.stringify(stakes));
  }

  static async simulateStake(
    address: string,
    assetType: 'invoices' | 'tbills' | 'real_estate',
    amount: number
  ): Promise<{ success: boolean; stakeId?: string; error?: string }> {
    try {
      const profile = this.getProfile(address);

      // Check balance
      if (profile.rwaBalances[assetType] < amount) {
        return { success: false, error: 'Insufficient RWA balance' };
      }

      // Create stake
      const stake: UserStake = {
        id: `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assetType,
        rwaAmount: amount,
        strwaAmount: amount, // 1:1 ratio
        apy: this.APY_RATES[assetType],
        stakedAt: Date.now(),
        lastYieldClaim: Date.now(),
        accumulatedYield: 0,
      };

      // Update balances
      profile.rwaBalances[assetType] -= amount;
      profile.strwaBalances[assetType] += amount;
      profile.totalStakedValue += amount * this.ASSET_PRICES[assetType];

      // Save
      const stakes = this.getStakes(address);
      stakes.push(stake);
      this.saveStakes(address, stakes);
      this.saveProfile(address, profile);

      // Add transaction
      this.addTransaction(address, {
        id: `tx_${Date.now()}`,
        type: 'stake',
        assetType,
        amount,
        timestamp: Date.now(),
        status: 'completed',
        details: { stakeId: stake.id },
      });

      return { success: true, stakeId: stake.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Staking failed' };
    }
  }

  static async simulateUnstake(
    address: string,
    stakeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stakes = this.getStakes(address);
      const stakeIndex = stakes.findIndex(s => s.id === stakeId);

      if (stakeIndex === -1) {
        return { success: false, error: 'Stake not found' };
      }

      const stake = stakes[stakeIndex];
      const profile = this.getProfile(address);

      // Update yield before unstaking
      this.updateStakeYield(stake);

      // Update balances
      profile.rwaBalances[stake.assetType] += stake.rwaAmount;
      profile.strwaBalances[stake.assetType] -= stake.strwaAmount;
      profile.totalStakedValue -= stake.rwaAmount * this.ASSET_PRICES[stake.assetType];
      profile.usdcBalance += stake.accumulatedYield; // Auto-claim yield
      profile.totalYieldEarned += stake.accumulatedYield;

      // Remove stake
      stakes.splice(stakeIndex, 1);
      this.saveStakes(address, stakes);
      this.saveProfile(address, profile);

      // Add transaction
      this.addTransaction(address, {
        id: `tx_${Date.now()}`,
        type: 'unstake',
        assetType: stake.assetType,
        amount: stake.rwaAmount,
        timestamp: Date.now(),
        status: 'completed',
        details: { yieldClaimed: stake.accumulatedYield },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unstaking failed' };
    }
  }

  static async simulateClaimYield(
    address: string,
    stakeId: string
  ): Promise<{ success: boolean; amount?: number; error?: string }> {
    try {
      const stakes = this.getStakes(address);
      const stake = stakes.find(s => s.id === stakeId);

      if (!stake) {
        return { success: false, error: 'Stake not found' };
      }

      // Update yield
      this.updateStakeYield(stake);

      if (stake.accumulatedYield === 0) {
        return { success: false, error: 'No yield to claim' };
      }

      const profile = this.getProfile(address);
      const claimedAmount = stake.accumulatedYield;

      // Update balances
      profile.usdcBalance += claimedAmount;
      profile.totalYieldEarned += claimedAmount;
      stake.accumulatedYield = 0;
      stake.lastYieldClaim = Date.now();

      // Save
      this.saveStakes(address, stakes);
      this.saveProfile(address, profile);

      // Add transaction
      this.addTransaction(address, {
        id: `tx_${Date.now()}`,
        type: 'claim_yield',
        assetType: stake.assetType,
        amount: claimedAmount,
        timestamp: Date.now(),
        status: 'completed',
      });

      return { success: true, amount: claimedAmount };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Claim failed' };
    }
  }

  private static updateStakeYield(stake: UserStake): void {
    const now = Date.now();
    const timeSinceLastClaim = (now - stake.lastYieldClaim) / (1000 * 60 * 60 * 24 * 365); // Years
    const newYield = stake.rwaAmount * (stake.apy / 100) * timeSinceLastClaim;
    stake.accumulatedYield += newYield;
  }

  static getTotalClaimableYield(address: string): number {
    const stakes = this.getStakes(address);
    let total = 0;

    stakes.forEach(stake => {
      this.updateStakeYield(stake);
      total += stake.accumulatedYield;
    });

    return total;
  }

  // ============ Loan Operations ============

  static getLoans(address: string): UserLoan[] {
    const stored = localStorage.getItem(STORAGE_KEYS.LOANS(address));
    return stored ? JSON.parse(stored) : [];
  }

  static saveLoans(address: string, loans: UserLoan[]): void {
    localStorage.setItem(STORAGE_KEYS.LOANS(address), JSON.stringify(loans));
  }

  static async simulateBorrow(
    address: string,
    collaterals: { assetType: 'invoices' | 'tbills' | 'real_estate'; amount: number }[],
    loanAmount: number,
    durationMonths: number
  ): Promise<{ success: boolean; loanId?: string; error?: string }> {
    try {
      const profile = this.getProfile(address);

      // Calculate total collateral value
      let totalCollateralValue = 0;
      const collateralAssets: UserLoan['collateralAssets'] = [];

      for (const col of collaterals) {
        if (profile.strwaBalances[col.assetType] < col.amount) {
          return { success: false, error: `Insufficient ${col.assetType} stRWA balance` };
        }

        const valueUSD = col.amount * this.ASSET_PRICES[col.assetType];
        totalCollateralValue += valueUSD * this.COLLATERAL_RATIOS[col.assetType];

        collateralAssets.push({
          assetType: col.assetType,
          strwaAmount: col.amount,
          valueUSD,
        });
      }

      // Check if loan amount is within limits
      if (loanAmount > totalCollateralValue) {
        return { success: false, error: 'Loan amount exceeds collateral value' };
      }

      // Calculate health factor
      const healthFactor = (totalCollateralValue / loanAmount) * 100;

      if (healthFactor < 125) {
        return { success: false, error: 'Health factor too low (minimum 125%)' };
      }

      // Create loan
      const loan: UserLoan = {
        id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        borrower: address,
        collateralAssets,
        principalAmount: loanAmount,
        interestRate: 12, // 12% APR
        currentDebt: loanAmount,
        healthFactor,
        durationMonths,
        originatedAt: Date.now(),
        lastRepayment: Date.now(),
        status: 'active',
      };

      // Update balances
      profile.usdcBalance += loanAmount;
      profile.totalBorrowedValue += loanAmount;
      profile.healthFactor = healthFactor;

      // Save
      const loans = this.getLoans(address);
      loans.push(loan);
      this.saveLoans(address, loans);
      this.saveProfile(address, profile);

      // Add transaction
      this.addTransaction(address, {
        id: `tx_${Date.now()}`,
        type: 'borrow',
        amount: loanAmount,
        timestamp: Date.now(),
        status: 'completed',
        details: { loanId: loan.id, healthFactor },
      });

      return { success: true, loanId: loan.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Borrowing failed' };
    }
  }

  static async simulateRepay(
    address: string,
    loanId: string,
    amount: number
  ): Promise<{ success: boolean; remainingDebt?: number; error?: string }> {
    try {
      const loans = this.getLoans(address);
      const loan = loans.find(l => l.id === loanId);

      if (!loan) {
        return { success: false, error: 'Loan not found' };
      }

      if (loan.status !== 'active') {
        return { success: false, error: 'Loan is not active' };
      }

      const profile = this.getProfile(address);

      if (profile.usdcBalance < amount) {
        return { success: false, error: 'Insufficient USDC balance' };
      }

      // Update interest
      this.updateLoanInterest(loan);

      // Calculate repayment
      const repayAmount = Math.min(amount, loan.currentDebt);

      // Update balances
      profile.usdcBalance -= repayAmount;
      loan.currentDebt -= repayAmount;
      loan.lastRepayment = Date.now();

      if (loan.currentDebt <= 0.01) {
        loan.currentDebt = 0;
        loan.status = 'repaid';
        profile.totalBorrowedValue -= loan.principalAmount;
      }

      // Recalculate health factor
      if (loan.status === 'active') {
        const totalCollateralValue = loan.collateralAssets.reduce(
          (sum, col) => sum + col.valueUSD * this.COLLATERAL_RATIOS[col.assetType],
          0
        );
        loan.healthFactor = (totalCollateralValue / loan.currentDebt) * 100;
        profile.healthFactor = loan.healthFactor;
      }

      // Save
      this.saveLoans(address, loans);
      this.saveProfile(address, profile);

      // Add transaction
      this.addTransaction(address, {
        id: `tx_${Date.now()}`,
        type: 'repay',
        amount: repayAmount,
        timestamp: Date.now(),
        status: 'completed',
        details: { loanId, remainingDebt: loan.currentDebt },
      });

      return { success: true, remainingDebt: loan.currentDebt };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Repayment failed' };
    }
  }

  private static updateLoanInterest(loan: UserLoan): void {
    const now = Date.now();
    const timeElapsed = (now - loan.lastRepayment) / (1000 * 60 * 60 * 24 * 365); // Years
    const interest = loan.currentDebt * (loan.interestRate / 100) * timeElapsed;
    loan.currentDebt += interest;
  }

  // ============ Transaction Management ============

  static getTransactions(address: string): Transaction[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS(address));
    return stored ? JSON.parse(stored) : [];
  }

  static addTransaction(address: string, transaction: Transaction): void {
    const transactions = this.getTransactions(address);
    transactions.unshift(transaction); // Add to beginning

    // Keep only last 100 transactions
    if (transactions.length > 100) {
      transactions.splice(100);
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS(address), JSON.stringify(transactions));
  }

  // ============ Utility Functions ============

  static formatAddress(address: string): string {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  static formatAmount(amount: number, decimals: number = 2): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  static calculatePortfolioValue(address: string): {
    totalValue: number;
    breakdown: {
      rwa: number;
      strwa: number;
      usdc: number;
      borrowed: number;
      net: number;
    };
  } {
    const profile = this.getProfile(address);

    const rwaValue =
      profile.rwaBalances.invoices * this.ASSET_PRICES.invoices +
      profile.rwaBalances.tbills * this.ASSET_PRICES.tbills +
      profile.rwaBalances.real_estate * this.ASSET_PRICES.real_estate;

    const strwaValue =
      profile.strwaBalances.invoices * this.ASSET_PRICES.invoices +
      profile.strwaBalances.tbills * this.ASSET_PRICES.tbills +
      profile.strwaBalances.real_estate * this.ASSET_PRICES.real_estate;

    const totalValue = rwaValue + strwaValue + profile.usdcBalance;
    const netValue = totalValue - profile.totalBorrowedValue;

    return {
      totalValue,
      breakdown: {
        rwa: rwaValue,
        strwa: strwaValue,
        usdc: profile.usdcBalance,
        borrowed: profile.totalBorrowedValue,
        net: netValue,
      },
    };
  }

  // ============ Reset/Debug Functions ============

  static resetUserData(address: string): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE(address));
    localStorage.removeItem(STORAGE_KEYS.STAKES(address));
    localStorage.removeItem(STORAGE_KEYS.LOANS(address));
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS(address));
  }

  static exportUserData(address: string): string {
    return JSON.stringify({
      profile: this.getProfile(address),
      stakes: this.getStakes(address),
      loans: this.getLoans(address),
      transactions: this.getTransactions(address),
    }, null, 2);
  }
}
