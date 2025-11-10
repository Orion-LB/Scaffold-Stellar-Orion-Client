# 🎯 Complete Frontend-Contract Integration Guide

**Date**: November 10, 2025
**Status**: READY FOR IMPLEMENTATION

---

## Overview

This guide shows the complete integration of all contract functions with the frontend dashboard, including the proper data flow from **Mint → Stake → Borrow → Repay**.

---

## 📦 What Has Been Created

### 1. ✅ Complete Contract Mapping
**File**: [`CONTRACT_FUNCTIONS_MAPPING.md`](CONTRACT_FUNCTIONS_MAPPING.md)

All contract functions documented with:
- Function signatures
- Parameters and return values
- Prerequisites and restrictions
- Frontend usage examples

### 2. ✅ LocalStorage Simulation Service
**File**: [`src/services/localStorage/SimulationService.ts`](src/services/localStorage/SimulationService.ts)

Complete simulation layer for features requiring setup:
- Staking/unstaking with APY calculations
- Multi-collateral loans with health factor
- Yield accumulation and claiming
- Transaction history

### 3. ✅ Contract Configuration
**File**: [`src/config/contracts.ts`](src/config/contracts.ts)

Centralized contract addresses for all 3 asset types:
- RWA Tokens (Invoices, T-Bills, Real Estate)
- stRWA Tokens
- Vaults
- Core contracts (USDC, Oracle, Lending Pool)

### 4. ✅ RWA Minting Service (WORKING)
**File**: [`src/services/contracts/RWAMintingService.ts`](src/services/contracts/RWAMintingService.ts)

Real contract integration for minting:
```typescript
// ✅ WORKING on testnet
const service = createRWAMintingService('invoices', wallet);
const result = await service.mintRWATokens(userAddress, 1000, wallet);
```

### 5. ✅ Professional Toast System
**File**: [`src/lib/toast.ts`](src/lib/toast.ts)

Clean notifications for all user actions:
- `toast.mintSuccess()`, `toast.stakeSuccess()`, `toast.borrowSuccess()`
- `toast.insufficientBalance()`, `toast.healthFactorTooLow()`
- `toast.processing()`, `toast.simulationMode()`

### 6. ✅ Updated Profile Dashboard
**File**: [`src/components/dashboard/ProfileSectionNew.tsx`](src/components/dashboard/ProfileSectionNew.tsx)

Complete dashboard with:
- Portfolio value and performance chart
- Risk & health factor monitoring
- Active stakes with yield tracking
- Claim yield functionality

---

## 🔄 Complete User Flow Implementation

### Flow 1: Mint RWA Tokens (✅ WORKING)

```typescript
/**
 * Step 1: User clicks "Get RWA Tokens" button
 * Contract: RWAToken.mint_rwa_tokens()
 * Status: ✅ WORKING on testnet
 */

// Frontend implementation:
import { createRWAMintingService } from '@/services/contracts/RWAMintingService';
import toast from '@/lib/toast';

const handleMint = async (assetType: 'invoices' | 'tbills' | 'real_estate', amount: number) => {
  // 1. Create service
  const mintingService = createRWAMintingService(assetType, wallet);

  // 2. Show processing
  toast.processing('Minting Tokens');

  // 3. Call real contract
  const result = await mintingService.mintRWATokens(address, amount, wallet);

  // 4. Dismiss processing
  toast.dismissProcessing();

  // 5. Show result
  if (result.success) {
    toast.mintSuccess(assetType, amount, result.transactionHash);
    // User now has RWA tokens!
    // These tokens can be staked next
  } else {
    toast.transactionFailed(result.error);
  }
};
```

**Result**: User has RWA tokens in their wallet, ready to stake.

---

### Flow 2: Stake RWA → Get stRWA (⚠️ Needs Vault Whitelisting)

```typescript
/**
 * Step 2: User stakes minted RWA tokens
 * Process: RWA → Vault → stRWA (1:1)
 * Status: ⚠️ REQUIRES vault whitelisting setup
 */

import { createVaultService } from '@/services/contracts/VaultService';
import { createRWAMintingService } from '@/services/contracts/RWAMintingService';
import { getContractAddress } from '@/config/contracts';

const handleStake = async (assetType, amount) => {
  // 1. Get RWA token service
  const rwaService = createRWAMintingService(assetType, wallet);

  // 2. Check RWA balance
  const rwaBalance = await rwaService.getBalance(address);
  const amountBigInt = BigInt(Math.floor(amount * 1e18));

  if (rwaBalance < amountBigInt) {
    toast.insufficientBalance(assetType);
    return;
  }

  // 3. Approve vault to spend RWA
  toast.processing('Approving Vault');

  const vaultAddress = getContractAddress('vault', assetType);
  const approveResult = await rwaService.approve(
    address,
    vaultAddress,
    amountBigInt,
    wallet
  );

  if (!approveResult.success) {
    toast.dismissProcessing();
    toast.error('Approval Failed', approveResult.error);
    return;
  }

  // 4. Stake RWA in vault
  toast.processing('Staking Tokens');

  const vaultService = createVaultService(assetType, vaultAddress, networkPassphrase, rpcUrl, wallet);

  const stakeResult = await vaultService.stake(address, amountBigInt, wallet);

  toast.dismissProcessing();

  if (stakeResult.success) {
    toast.stakeSuccess(assetType, amount);
    // User now has stRWA tokens!
    // These can be used as collateral for loans
  } else {
    toast.transactionFailed(stakeResult.error);
  }
};
```

**Result**: User has stRWA tokens, which are:
- Liquid (can be transferred/traded)
- Earning yield
- Can be used as collateral for loans

---

### Flow 3: Borrow USDC (⚠️ Needs LP Liquidity + Oracle Prices)

```typescript
/**
 * Step 3: User borrows USDC using stRWA as collateral
 * Contract: LendingPool.originate_loan()
 * Status: ⚠️ REQUIRES LP liquidity and oracle prices
 */

import { createLendingPoolService } from '@/services/contracts/LendingPoolService';
import { createStRWAService } from '@/services/contracts/StRWAService';

const handleBorrow = async (collateralAmount, loanAmount, durationMonths) => {
  // 1. Get stRWA service
  const stRWAService = createStRWAService(assetType, strwaAddress, networkPassphrase, rpcUrl, wallet);

  // 2. Check stRWA balance
  const strwaBalance = await stRWAService.balance(address);
  const collateralBigInt = BigInt(Math.floor(collateralAmount * 1e18));

  if (strwaBalance < collateralBigInt) {
    toast.insufficientBalance(`${assetType} stRWA`);
    return;
  }

  // 3. Calculate health factor (collateral value / loan amount)
  const collateralValue = collateralAmount * assetPrice; // Get from oracle
  const healthFactor = (collateralValue / loanAmount) * 100;

  if (healthFactor < 140) {
    toast.healthFactorTooLow(healthFactor, 140);
    return;
  }

  // 4. Approve lending pool to spend stRWA
  toast.processing('Approving Lending Pool');

  const lendingPoolAddress = getContractAddress('lendingPool');
  const approveResult = await stRWAService.approve(
    address,
    lendingPoolAddress,
    collateralBigInt,
    wallet
  );

  if (!approveResult.success) {
    toast.dismissProcessing();
    toast.error('Approval Failed', approveResult.error);
    return;
  }

  // 5. Originate loan
  toast.processing('Creating Loan');

  const lendingService = createLendingPoolService(lendingPoolAddress, networkPassphrase, rpcUrl, wallet);

  const loanAmountBigInt = BigInt(Math.floor(loanAmount * 10_000_000)); // 7 decimals for USDC

  const borrowResult = await lendingService.originate_loan(
    address,
    collateralBigInt,
    loanAmountBigInt,
    durationMonths,
    wallet
  );

  toast.dismissProcessing();

  if (borrowResult.success) {
    toast.borrowSuccess(loanAmount, healthFactor);
    // User now has USDC loan!
    // Collateral locked in lending pool
  } else {
    toast.transactionFailed(borrowResult.error);
  }
};
```

**Result**: User has USDC loan, collateral locked, starts accruing interest.

---

### Flow 4: Repay Loan

```typescript
/**
 * Step 4: User repays loan
 * Contract: LendingPool.repay_loan()
 * Process: Auto-repay from yield first, then user USDC
 */

const handleRepay = async (repayAmount) => {
  const lendingService = createLendingPoolService(lendingPoolAddress, networkPassphrase, rpcUrl, wallet);

  // 1. Update loan interest first
  await lendingService.update_loan_interest(address);

  // 2. Get current loan details
  const loan = await lendingService.get_loan(address);

  if (!loan) {
    toast.error('No Active Loan', 'You don\'t have an active loan.');
    return;
  }

  const repayAmountBigInt = BigInt(Math.floor(repayAmount * 10_000_000));

  if (repayAmountBigInt > loan.outstanding_debt) {
    toast.warning('Amount Too Large', `Maximum repayment: $${(Number(loan.outstanding_debt) / 10_000_000).toFixed(2)}`);
    return;
  }

  // 3. Check if yield can cover (auto-repay)
  const vault = create VaultService(assetType, vaultAddress, networkPassphrase, rpcUrl, wallet);
  const claimableYield = await vault.claimable_yield(address);

  const yieldCoverageAmount = claimableYield < repayAmountBigInt ? claimableYield : repayAmountBigInt;
  const userPayAmount = repayAmountBigInt - yieldCoverageAmount;

  // 4. If user needs to pay, approve USDC
  if (userPayAmount > 0n) {
    toast.processing('Approving USDC');

    const usdcService = createUSDCService(usdcAddress, networkPassphrase, rpcUrl, wallet);
    const approveResult = await usdcService.approve(
      address,
      lendingPoolAddress,
      userPayAmount,
      wallet
    );

    if (!approveResult.success) {
      toast.dismissProcessing();
      toast.error('Approval Failed', approveResult.error);
      return;
    }
  }

  // 5. Repay loan
  toast.processing('Repaying Loan');

  const repayResult = await lendingService.repay_loan(
    address,
    repayAmountBigInt,
    wallet
  );

  toast.dismissProcessing();

  if (repayResult.success) {
    // Get updated loan
    const updatedLoan = await lendingService.get_loan(address);
    const remainingDebt = Number(updatedLoan.outstanding_debt) / 10_000_000;

    toast.repaySuccess(repayAmount, remainingDebt);

    if (remainingDebt === 0) {
      toast.success('Loan Fully Repaid!', 'Your collateral is now available.');
    }
  } else {
    toast.transactionFailed(repayResult.error);
  }
};
```

**Result**: Loan repaid (partially or fully), interest updated, health factor improved.

---

### Flow 5: Claim Yield

```typescript
/**
 * Step 5: User claims accumulated yield
 * Contract: Vault.claim_yield()
 */

const handleClaimYield = async (assetType) => {
  const vaultAddress = getContractAddress('vault', assetType);
  const vaultService = createVaultService(assetType, vaultAddress, networkPassphrase, rpcUrl, wallet);

  // 1. Check claimable yield
  const claimable = await vaultService.claimable_yield(address);

  if (claimable === 0n) {
    toast.info('No Yield Available', 'Your yield is still accumulating.');
    return;
  }

  // 2. Claim yield
  toast.processing('Claiming Yield');

  const claimResult = await vaultService.claim_yield(address, wallet);

  toast.dismissProcessing();

  if (claimResult.success && claimResult.result) {
    const claimedAmount = Number(claimResult.result) / 10_000_000; // 7 decimals
    toast.claimYieldSuccess(claimedAmount);
  } else {
    toast.transactionFailed(claimResult.error);
  }
};
```

**Result**: USDC transferred to user, yield resets.

---

### Flow 6: Unstake

```typescript
/**
 * Step 6: User unstakes to get RWA back
 * Contract: Vault.unstake()
 * Restrictions: Lockup period and foreclosure fee for borrowers
 */

const handleUnstake = async (assetType, amount) => {
  const vaultAddress = getContractAddress('vault', assetType);
  const vaultService = createVaultService(assetType, vaultAddress, networkPassphrase, rpcUrl, wallet);

  // 1. Check stRWA balance
  const stRWAService = createStRWAService(assetType, strwaAddress, networkPassphrase, rpcUrl, wallet);
  const strwaBalance = await stRWAService.balance(address);
  const amountBigInt = BigInt(Math.floor(amount * 1e18));

  if (strwaBalance < amountBigInt) {
    toast.insufficientBalance(`${assetType} stRWA`);
    return;
  }

  // 2. Check if user has active loan
  const lendingService = createLendingPoolService(lendingPoolAddress, networkPassphrase, rpcUrl, wallet);
  const loan = await lendingService.get_loan(address);

  if (loan && loan.outstanding_debt > 0n) {
    // Check lockup period
    const currentTime = Date.now() / 1000;
    const loanDuration = loan.end_time - loan.start_time;
    const lockupPeriod = loanDuration * 0.2; // First 20%

    if (currentTime - loan.start_time < lockupPeriod) {
      toast.error(
        'Lockup Period Active',
        'Cannot unstake during first 20% of loan period. Consider repaying loan first.'
      );
      return;
    }

    // Warn about foreclosure fee
    const feeAmount = amount * 0.05;
    toast.warning(
      '5% Foreclosure Fee',
      `You have an active loan. Unstaking will charge a ${feeAmount.toFixed(2)} ${assetType} RWA fee.`
    );

    // Wait for user confirmation (implement confirmation modal)
  }

  // 3. Unstake
  toast.processing('Unstaking Tokens');

  const unstakeResult = await vaultService.unstake(address, amountBigInt, wallet);

  toast.dismissProcessing();

  if (unstakeResult.success) {
    const actualAmount = loan && loan.outstanding_debt > 0n ? amount * 0.95 : amount;
    toast.unstakeSuccess(assetType, actualAmount);
  } else {
    toast.transactionFailed(unstakeResult.error);
  }
};
```

**Result**: stRWA burned, RWA returned (minus fee if borrower).

---

## 📝 Service Layer Files To Create/Update

### 1. Create Complete Lending Pool Service

**File**: `src/services/contracts/LendingPoolService.ts`

```typescript
import { ContractService, TransactionResult, StellarWalletProvider } from './ContractService';

export interface Loan {
  borrower: string;
  collateral_amount: bigint;
  principal: bigint;
  outstanding_debt: bigint;
  interest_rate: number; // basis points
  start_time: number;
  end_time: number;
  warnings_issued: number;
}

export class LendingPoolService extends ContractService {
  // LP Functions
  async lp_deposit(depositor: string, amount: bigint, wallet): Promise<TransactionResult>;
  async lp_withdraw(depositor: string, amount: bigint, wallet): Promise<TransactionResult>;
  async get_lp_deposit(depositor: string): Promise<LPDeposit>;

  // Loan Functions
  async originate_loan(borrower: string, collateral_amount: bigint, loan_amount: bigint, duration_months: number, wallet): Promise<TransactionResult>;
  async repay_loan(borrower: string, amount: bigint, wallet): Promise<TransactionResult>;
  async close_loan_early(borrower: string, wallet): Promise<TransactionResult>;
  async get_loan(borrower: string): Promise<Loan | null>;
  async update_loan_interest(borrower: string): Promise<void>;

  // Helper methods
  calculateHealthFactor(collateral_value: number, debt: number): number;
  usdcToContractUnits(amount: number): bigint;
  usdcFromContractUnits(units: bigint): number;
}
```

### 2. Create stRWA Token Service

**File**: `src/services/contracts/StRWAService.ts`

```typescript
export class StRWAService extends ContractService {
  async balance(account: string): Promise<bigint>;
  async transfer(from: string, to: string, amount: bigint, wallet): Promise<TransactionResult>;
  async approve(owner: string, spender: string, amount: bigint, wallet): Promise<TransactionResult>;
  async allowance(owner: string, spender: string): Promise<bigint>;
  async total_supply(): Promise<bigint>;
}
```

### 3. Create USDC Service

**File**: `src/services/contracts/USDCService.ts`

```typescript
export class USDCService extends ContractService {
  async balance(account: string): Promise<bigint>;
  async transfer(from: string, to: string, amount: bigint, wallet): Promise<TransactionResult>;
  async approve(owner: string, spender: string, amount: bigint, wallet): Promise<TransactionResult>;
  async allowance(owner: string, spender: string): Promise<bigint>;
}
```

---

## 🎨 Dashboard Component Updates

### Update StakeSection

**File**: `src/components/dashboard/StakeSection.tsx`

Key changes:
- Import `createRWAMintingService` for balance checks
- Import `createVaultService` for staking
- Show minted RWA balance prominently
- "Approve Vault" button before staking
- Use real contract calls when setup complete
- Fall back to localStorage simulation if not setup

### Update BorrowSection

**File**: `src/components/dashboard/BorrowSection.tsx`

Key changes:
- Import `createStRWAService` for collateral balance
- Import `createLendingPoolService` for borrowing
- Show stRWA balance as available collateral
- Calculate health factor in real-time
- "Approve Lending Pool" button before borrowing
- Display 140% collateral requirement clearly

### Update ProfileSection

**File**: Already created as `ProfileSectionNew.tsx` ✅

---

## 🚀 Deployment Checklist

### Before Features Work (Contract Setup)

```bash
# 1. Whitelist vaults on RWA tokens
stellar contract invoke \
  --id CBFKZAVQ57... \
  --source testnet-deployer \
  --network testnet \
  -- \
  allow_user \
  --user CCYADH4LWF... \
  --operator GAADPNKZXJEJ...

# Repeat for all 3 vaults on all 3 RWA tokens

# 2. Add LP liquidity
stellar contract invoke \
  --id CCW2TFZ7DW... \
  --source testnet-deployer \
  --network testnet \
  -- \
  lp_deposit \
  --depositor GAADPNKZXJEJ... \
  --amount 10000000000  # 10,000 USDC

# 3. Set oracle prices
stellar contract invoke \
  --id CD5XYT6WXO... \
  --source testnet-deployer \
  --network testnet \
  -- \
  set_price \
  --asset CDHGP3XMH2... \
  --price 1050000000000000000 \
  --bot_address GAADPNKZXJEJ...

# Repeat for all 3 stRWA tokens

# 4. Admin fund yield pools (optional, for testing)
stellar contract invoke \
  --id CCYADH4LWF... \
  --source testnet-deployer \
  --network testnet \
  -- \
  admin_fund_yield \
  --amount 1000000000  # 1,000 USDC

# Repeat for all 3 vaults
```

---

## ✅ Testing Checklist

### Manual Testing Flow

1. **Mint RWA Tokens** ✅ (WORKING NOW)
   - [ ] Click "Get RWA Tokens"
   - [ ] Select Invoices, amount 1000
   - [ ] Confirm transaction in wallet
   - [ ] See success toast with TX hash
   - [ ] Verify balance updates

2. **Stake RWA Tokens** (After vault whitelisting)
   - [ ] See minted RWA balance
   - [ ] Click "Approve Vault"
   - [ ] Confirm approval
   - [ ] Click "Stake"
   - [ ] Confirm staking
   - [ ] See stRWA balance increase 1:1

3. **Borrow USDC** (After LP liquidity + oracle)
   - [ ] See stRWA balance as collateral
   - [ ] Enter loan amount
   - [ ] See health factor calculation
   - [ ] Click "Approve Lending Pool"
   - [ ] Click "Borrow"
   - [ ] See USDC balance increase
   - [ ] See loan details in profile

4. **Repay Loan**
   - [ ] See outstanding debt
   - [ ] Enter repayment amount
   - [ ] See yield auto-repay if available
   - [ ] Confirm repayment
   - [ ] See debt decrease

5. **Claim Yield**
   - [ ] See claimable yield amount
   - [ ] Click "Claim Yield"
   - [ ] See USDC balance increase
   - [ ] See yield reset to 0

6. **Unstake**
   - [ ] Click "Unstake"
   - [ ] If borrower: see foreclosure fee warning
   - [ ] Confirm unstaking
   - [ ] See RWA balance increase
   - [ ] See stRWA balance decrease

---

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Contract Mapping | ✅ Complete | All functions documented |
| localStorage Simulation | ✅ Complete | Full feature simulation |
| Contract Config | ✅ Complete | All addresses configured |
| RWA Minting Service | ✅ Complete | WORKING on testnet |
| Toast System | ✅ Complete | Professional UX |
| Profile Dashboard | ✅ Complete | Shows all data |
| Vault Service | 🔄 Update Needed | Add asset type tracking |
| Lending Pool Service | ⏳ Create Needed | All borrow/repay functions |
| stRWA Service | ⏳ Create Needed | Token operations |
| USDC Service | ⏳ Create Needed | Payment operations |
| StakeSection Update | ⏳ Needed | Connect to services |
| BorrowSection Update | ⏳ Needed | Connect to services |

---

## 🎯 Next Actions

1. **Immediate** (Code Changes)
   - [ ] Create LendingPoolService
   - [ ] Create StRWAService
   - [ ] Create USDCService
   - [ ] Update VaultService
   - [ ] Update StakeSection component
   - [ ] Update BorrowSection component

2. **Contract Setup** (Testnet)
   - [ ] Whitelist vaults on RWA tokens
   - [ ] Add LP liquidity
   - [ ] Set oracle prices
   - [ ] Fund yield pools

3. **Testing** (End-to-End)
   - [ ] Test Mint → Stake flow
   - [ ] Test Stake → Borrow flow
   - [ ] Test Repay flow
   - [ ] Test Claim yield flow
   - [ ] Test Unstake flow

---

*Generated: November 10, 2025*
*Status: Complete Integration Specification* ✅
