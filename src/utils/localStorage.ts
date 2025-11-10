/**
 * LocalStorage Simulation Layer
 * For demo purposes when contract calls fail or aren't yet implemented
 */

export interface Transaction {
  id: string;
  type: 'mint' | 'stake' | 'unstake' | 'claim' | 'borrow' | 'repay';
  assetType: 'invoices' | 'tbills' | 'realestate';
  amount: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
}

export interface VaultBalance {
  assetType: 'invoices' | 'tbills' | 'realestate';
  rwaBalance: string;
  stRwaBalance: string;
  claimableYield: string;
}

export interface LoanData {
  assetType: 'invoices' | 'tbills' | 'realestate';
  borrowedAmount: number;
  collateralAmount: number;
  hasLoan: boolean;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'orion_transactions',
  VAULT_BALANCES: 'orion_vault_balances',
  LOANS: 'orion_loans',
  LAST_SYNC: 'orion_last_sync',
};

class LocalStorageService {
  // ==================== TRANSACTIONS ====================

  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    transactions.unshift(newTx); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions.slice(0, 100))); // Keep last 100
    return newTx;
  }

  updateTransactionStatus(id: string, status: Transaction['status'], hash?: string) {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(tx => tx.id === id);
    if (txIndex !== -1) {
      transactions[txIndex].status = status;
      if (hash) transactions[txIndex].hash = hash;
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }

  clearTransactions() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }

  // ==================== VAULT BALANCES ====================

  getVaultBalances(): VaultBalance[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VAULT_BALANCES);
      return data ? JSON.parse(data) : this.getDefaultVaultBalances();
    } catch {
      return this.getDefaultVaultBalances();
    }
  }

  private getDefaultVaultBalances(): VaultBalance[] {
    return [
      {
        assetType: 'invoices',
        rwaBalance: '0',
        stRwaBalance: '0',
        claimableYield: '0',
      },
      {
        assetType: 'tbills',
        rwaBalance: '0',
        stRwaBalance: '0',
        claimableYield: '0',
      },
      {
        assetType: 'realestate',
        rwaBalance: '0',
        stRwaBalance: '0',
        claimableYield: '0',
      },
    ];
  }

  updateVaultBalance(assetType: VaultBalance['assetType'], updates: Partial<Omit<VaultBalance, 'assetType'>>) {
    const balances = this.getVaultBalances();
    const index = balances.findIndex(b => b.assetType === assetType);
    if (index !== -1) {
      balances[index] = { ...balances[index], ...updates };
    } else {
      balances.push({ assetType, rwaBalance: '0', stRwaBalance: '0', claimableYield: '0', ...updates });
    }
    localStorage.setItem(STORAGE_KEYS.VAULT_BALANCES, JSON.stringify(balances));
    this.updateLastSync();
  }

  // Simulate minting
  simulateMint(assetType: VaultBalance['assetType'], amount: string) {
    const balances = this.getVaultBalances();
    const vault = balances.find(b => b.assetType === assetType);
    if (vault) {
      const currentBalance = BigInt(vault.rwaBalance || '0');
      const mintAmount = BigInt(amount);
      vault.rwaBalance = (currentBalance + mintAmount).toString();
      this.updateVaultBalance(assetType, { rwaBalance: vault.rwaBalance });
    }
  }

  // Simulate staking
  simulateStake(assetType: VaultBalance['assetType'], amount: string) {
    const balances = this.getVaultBalances();
    const vault = balances.find(b => b.assetType === assetType);
    if (vault) {
      const rwaBalance = BigInt(vault.rwaBalance || '0');
      const stakeAmount = BigInt(amount);
      if (rwaBalance >= stakeAmount) {
        const newRwa = (rwaBalance - stakeAmount).toString();
        const stRwaBalance = BigInt(vault.stRwaBalance || '0');
        const newStRwa = (stRwaBalance + stakeAmount).toString();
        this.updateVaultBalance(assetType, {
          rwaBalance: newRwa,
          stRwaBalance: newStRwa
        });
      }
    }
  }

  // Simulate unstaking
  simulateUnstake(assetType: VaultBalance['assetType'], amount: string) {
    const balances = this.getVaultBalances();
    const vault = balances.find(b => b.assetType === assetType);
    if (vault) {
      const stRwaBalance = BigInt(vault.stRwaBalance || '0');
      const unstakeAmount = BigInt(amount);
      if (stRwaBalance >= unstakeAmount) {
        const newStRwa = (stRwaBalance - unstakeAmount).toString();
        const rwaBalance = BigInt(vault.rwaBalance || '0');
        const newRwa = (rwaBalance + unstakeAmount).toString();
        this.updateVaultBalance(assetType, {
          rwaBalance: newRwa,
          stRwaBalance: newStRwa
        });
      }
    }
  }

  // Simulate yield accumulation (call this periodically)
  simulateYieldAccumulation() {
    const balances = this.getVaultBalances();
    balances.forEach(vault => {
      const staked = BigInt(vault.stRwaBalance || '0');
      if (staked > 0n) {
        // Add 0.01% of staked amount as yield (simplified)
        const yieldAmount = (staked * 1n) / 10000n; // 0.01%
        const currentYield = BigInt(vault.claimableYield || '0');
        const newYield = (currentYield + yieldAmount).toString();
        this.updateVaultBalance(vault.assetType, { claimableYield: newYield });
      }
    });
  }

  // Simulate claiming yield
  simulateClaimYield(assetType: VaultBalance['assetType']): string {
    const balances = this.getVaultBalances();
    const vault = balances.find(b => b.assetType === assetType);
    if (vault) {
      const claimed = vault.claimableYield || '0';
      this.updateVaultBalance(assetType, { claimableYield: '0' });
      return claimed;
    }
    return '0';
  }

  clearVaultBalances() {
    localStorage.removeItem(STORAGE_KEYS.VAULT_BALANCES);
  }

  // ==================== LOANS ====================

  getLoans(): LoanData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  updateLoan(assetType: LoanData['assetType'], loanData: Omit<LoanData, 'assetType'>) {
    const loans = this.getLoans();
    const index = loans.findIndex(l => l.assetType === assetType);
    if (index !== -1) {
      loans[index] = { ...loans[index], ...loanData };
    } else {
      loans.push({ assetType, ...loanData });
    }
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
    this.updateLastSync();
  }

  clearLoans() {
    localStorage.removeItem(STORAGE_KEYS.LOANS);
  }

  // ==================== SYNC ====================

  updateLastSync() {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  getLastSync(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? parseInt(data) : 0;
    } catch {
      return 0;
    }
  }

  // Clear all Orion data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }

  // Initialize with demo data
  initializeDemoData() {
    // Add some initial balances for demo
    this.updateVaultBalance('invoices', {
      rwaBalance: (5000n * BigInt(10**18)).toString(),
      stRwaBalance: (2500n * BigInt(10**18)).toString(),
      claimableYield: (45n * BigInt(10**7)).toString(),
    });

    this.updateVaultBalance('tbills', {
      rwaBalance: (3000n * BigInt(10**18)).toString(),
      stRwaBalance: (1500n * BigInt(10**18)).toString(),
      claimableYield: (28n * BigInt(10**7)).toString(),
    });

    this.updateVaultBalance('realestate', {
      rwaBalance: (2000n * BigInt(10**18)).toString(),
      stRwaBalance: (1000n * BigInt(10**18)).toString(),
      claimableYield: (32n * BigInt(10**7)).toString(),
    });

    // Add some demo transactions
    this.addTransaction({
      type: 'mint',
      assetType: 'invoices',
      amount: '5000',
      status: 'success',
      hash: '0x1234...5678',
    });

    this.addTransaction({
      type: 'stake',
      assetType: 'invoices',
      amount: '2500',
      status: 'success',
      hash: '0xabcd...efgh',
    });

    // Add demo loans
    this.updateLoan('invoices', {
      borrowedAmount: 1200,
      collateralAmount: 2500,
      hasLoan: true,
    });

    this.updateLoan('tbills', {
      borrowedAmount: 750,
      collateralAmount: 1500,
      hasLoan: true,
    });
  }
}

export const localStorageService = new LocalStorageService();

// Start yield accumulation simulation (every 30 seconds)
if (typeof window !== 'undefined') {
  setInterval(() => {
    localStorageService.simulateYieldAccumulation();
  }, 30000);
}
