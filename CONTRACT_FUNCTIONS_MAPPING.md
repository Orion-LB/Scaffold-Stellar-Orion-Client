# Contract Functions Mapping - Complete Guide

**Date**: November 10, 2025
**Purpose**: Map all deployed contract functions to frontend features

---

## 📋 Contract Functions Inventory

### 1. MockRWAToken Contract

**Contract**: `mock-rwa-token`
**Purpose**: RWA tokens with whitelist (Invoices, T-Bills, Real Estate)

#### Public Functions:
```rust
// ✅ WORKING - Public minting for demo
mint_rwa_tokens(to: Address, amount: i128)
  - Auto-whitelists user
  - Max 1M tokens per transaction
  - Emits: mock_mint event
  - Frontend: "Get RWA Tokens" button

// Standard ERC20
balance(account: Address) -> i128
transfer(from: Address, to: Address, amount: i128)
approve(owner: Address, spender: Address, amount: i128, live_until_ledger: u32)
allowance(owner: Address, spender: Address) -> i128
total_supply() -> i128

// Whitelist (Manager role required)
allowed(account: Address) -> bool
allow_user(user: Address, operator: Address)  // Manager only
disallow_user(user: Address, operator: Address)  // Manager only

// Burnable
burn(from: Address, amount: i128)
```

**Frontend Usage**:
- Mint button → `mint_rwa_tokens()` ✅ WORKING
- Check balance → `balance()` ✅ WORKING
- Approve vault before staking → `approve()`
- Check whitelist → `allowed()`

---

### 2. RWA Vault Contract

**Contract**: `rwa-vault` (3 vaults, one per asset)
**Purpose**: Stake RWA → receive stRWA, earn yield

#### Public Functions:
```rust
// Staking Operations
stake(user: Address, amount: i128)
  - Requires: RWA approval first
  - Transfers RWA from user to vault
  - Mints stRWA 1:1 to user
  - Emits: stake event
  - Frontend: "Stake" button

unstake(user: Address, amount: i128)
  - Burns stRWA from user
  - Returns RWA to user
  - If borrower with active loan: 5% foreclosure fee
  - If borrower: Cannot unstake during first 20% of loan period
  - Emits: unstake, forclose events
  - Frontend: "Unstake" button

// Yield Management
claimable_yield(user: Address) -> i128
  - Formula: (total_yield_pool × user_strwa_balance) / total_strwa_supply
  - Returns USDC amount (7 decimals)
  - Frontend: Display claimable yield

claim_yield(user: Address) -> i128
  - Transfers USDC from vault to user
  - Reduces yield pool
  - Emits: claim event
  - Frontend: "Claim Yield" button

// Admin Functions
admin_fund_yield(amount: i128)
  - Admin deposits USDC to yield pool
  - Requires: USDC approval first
  - Emits: yieldfund event

set_usdc_address(usdc: Address)
  - One-time setup
  - Admin only

set_lending_pool(lending_pool: Address)
  - One-time setup
  - Admin only

// Called by Lending Pool (not directly by users)
mark_as_borrower(user: Address, borrowed_amount: i128, loan_period: u64)
  - Sets is_borrower flag
  - Tracks borrowed amount
  - Enables foreclosure fee on unstake

pull_yield_for_repay(user: Address, amount: i128) -> i128
  - Auto-repay: Pull yield for loan repayment
  - Returns amount pulled
  - Called by lending pool

update_borrowed_amount(user: Address, new_amount: i128)
  - Updates borrowed amount tracking
  - If 0, clears is_borrower flag

set_lp_liquidity_used(lp: Address, amount_used: i128)
  - Tracks LP's liquidity used in loans
```

**Frontend Usage**:
- Approve vault → `RWAToken.approve(vault_address, amount)`
- Stake RWA → `stake()` (Get stRWA 1:1)
- Check yield → `claimable_yield()` (Display in UI)
- Claim yield → `claim_yield()` (Get USDC)
- Unstake → `unstake()` (Get RWA back)

---

### 3. Lending Pool Contract

**Contract**: `lending-pool`
**Purpose**: Borrow USDC against stRWA collateral

#### Public Functions:
```rust
// LP Functions
lp_deposit(depositor: Address, amount: i128)
  - LP deposits USDC to earn interest
  - Requires: USDC approval first
  - Emits: lp_depo event
  - Frontend: Admin panel

lp_withdraw(depositor: Address, amount: i128)
  - LP withdraws available (not locked) USDC
  - Emits: lp_withd event
  - Frontend: Admin panel

get_lp_deposit(depositor: Address) -> LPDeposit
  - Returns LP deposit info
  - Shows: total_deposited, locked_amount, available_amount, interest_earned

// Loan Operations
originate_loan(
  borrower: Address,
  collateral_amount: i128,    // stRWA amount
  loan_amount: i128,           // USDC to borrow
  duration_months: u32         // 3-24 months
)
  - Requires: stRWA approval first
  - Checks: 140% collateral ratio
  - Checks: Sufficient pool liquidity
  - Transfers stRWA to lending pool
  - Transfers USDC to borrower
  - Calls vault.mark_as_borrower()
  - Interest rate: 7% or 14% (auto-calculated based on risk)
  - Emits: loan_orig event
  - Frontend: "Borrow" button

repay_loan(borrower: Address, amount: i128)
  - Updates interest first
  - Pulls yield from vault first (auto-repay)
  - User pays remaining with USDC
  - LP gets yield_share_percent (10% or 20%)
  - Resets warnings if significant payment
  - If debt reaches 0: loan fully repaid
  - Emits: loan_repay event
  - Frontend: "Repay" button

update_loan_interest(borrower: Address)
  - Calculates compound interest
  - Updates outstanding_debt
  - Emits: int_upd event
  - Frontend: Called before displaying loan info

get_loan(borrower: Address) -> Loan
  - Returns loan details
  - Fields: collateral_amount, principal, outstanding_debt,
    interest_rate, start_time, end_time, warnings_issued, penalties

close_loan_early(borrower: Address)
  - Repay full debt + 5% early closure fee
  - Returns collateral
  - Emits: loan_close event
  - Frontend: "Close Loan Early" button

// Liquidation (Bot/Admin)
liquidate_loan(borrower: Address)
  - Called by liquidation bot
  - When health factor < 1.1
  - Burns collateral stRWA
  - Marks loan as liquidated
  - Emits: liquidate event

issue_warning(borrower: Address)
  - Called by liquidation bot
  - Increments warnings_issued
  - Sets last_warning_time
  - Emits: warning event

// Admin Functions
set_liquidation_bot(caller: Address, bot_address: Address)
  - Admin only
  - Sets bot authorized to liquidate

update_token_risk_profile(
  caller: Address,
  rwa_token_address: Address,
  token_yield_apr: i128,
  token_expiry: u64
)
  - Admin only
  - Sets risk parameters for interest calculation
```

**Frontend Usage**:
- Approve lending pool → `stRWAToken.approve(lending_pool, collateral_amount)`
- Borrow USDC → `originate_loan()` (Get USDC loan)
- Check loan → `get_loan()` (Display loan details)
- Calculate health factor → (collateral_value × 100) / outstanding_debt
- Repay → `repay_loan()` (Pay down debt)
- Close early → `close_loan_early()` (5% fee)

---

### 4. stRWA Token Contract

**Contract**: `strwa-token` (3 tokens, one per asset)
**Purpose**: Liquid staked tokens, received 1:1 when staking RWA

#### Public Functions:
```rust
// Standard ERC20
balance(account: Address) -> i128
transfer(from: Address, to: Address, amount: i128)
approve(owner: Address, spender: Address, amount: i128, live_until_ledger: u32)
allowance(owner: Address, spender: Address) -> i128
total_supply() -> i128

// Vault-only Functions (not called directly by users)
mint(to: Address, amount: i128)
  - Vault calls this when user stakes
  - Creates stRWA 1:1 with staked RWA

burn(from: Address, amount: i128)
  - Vault calls this when user unstakes
  - Burns stRWA

set_vault_address(vault: Address)
  - One-time setup
  - Admin only
```

**Frontend Usage**:
- Check balance → `balance()` ✅
- Approve lending pool → `approve()` (Before borrowing)
- Transfer → `transfer()` (stRWA is liquid, can be traded)

---

### 5. USDC Mock Contract

**Contract**: `usdc-mock`
**Purpose**: Mock USDC for testing (7 decimals)

#### Public Functions:
```rust
// Standard ERC20
balance(account: Address) -> i128
transfer(from: Address, to: Address, amount: i128)
approve(owner: Address, spender: Address, amount: i128, live_until_ledger: u32)
allowance(owner: Address, spender: Address) -> i128
total_supply() -> i128

// Minting (for testing)
mint(to: Address, amount: i128)
  - Admin can mint USDC for testing
  - Frontend: Admin panel
```

---

### 6. Mock Oracle Contract

**Contract**: `mock-oracle`
**Purpose**: Price feed for stRWA tokens

#### Public Functions:
```rust
set_price(asset: Address, price: i128, bot_address: Address)
  - Bot sets price for asset
  - Price has 18 decimals
  - Frontend: Oracle bot

get_price(asset: Address) -> (i128, u64)
  - Returns (price, timestamp)
  - Used by lending pool for collateral valuation
  - Frontend: Display stRWA prices
```

---

## 🔄 Complete User Flow Mapping

### Flow 1: Mint → Stake → Earn Yield

```
1. User clicks "Get RWA Tokens"
   → Frontend calls: RWAToken.mint_rwa_tokens(user, amount)
   → ✅ WORKING on testnet
   → User receives RWA tokens

2. User clicks "Approve for Staking"
   → Frontend calls: RWAToken.approve(vault_address, amount, expiry)
   → Vault authorized to spend RWA

3. User clicks "Stake"
   → Frontend calls: Vault.stake(user, amount)
   → User's RWA transferred to vault
   → User receives stRWA 1:1
   → ⚠️ REQUIRES: Vault whitelisting on RWA token

4. Yield accumulates automatically
   → Frontend queries: Vault.claimable_yield(user)
   → Display in UI

5. User clicks "Claim Yield"
   → Frontend calls: Vault.claim_yield(user)
   → User receives USDC
   → ⚠️ REQUIRES: Yield funding by admin
```

### Flow 2: Stake → Borrow → Repay

```
1. User has stRWA (from staking)
   → Query: stRWAToken.balance(user)

2. User clicks "Approve for Borrowing"
   → Frontend calls: stRWAToken.approve(lending_pool, collateral_amount, expiry)
   → Lending pool authorized to spend stRWA

3. User clicks "Borrow"
   → Frontend calls: LendingPool.originate_loan(
       user,
       collateral_amount,  // stRWA
       loan_amount,        // USDC to receive
       duration_months     // 3-24 months
     )
   → Checks 140% collateral ratio
   → User's stRWA transferred to lending pool
   → User receives USDC loan
   → Vault.mark_as_borrower() called automatically
   → ⚠️ REQUIRES: LP liquidity, oracle prices

4. Interest accrues
   → Frontend calls: LendingPool.update_loan_interest(user)
   → Then: LendingPool.get_loan(user)
   → Display updated debt

5. User repays
   → Option A: Auto-repay from yield
     → LendingPool.repay_loan(user, amount)
     → Vault yield used first, user pays rest
   → Option B: Manual repay with USDC
     → User approves: USDC.approve(lending_pool, amount, expiry)
     → LendingPool.repay_loan(user, amount)

6. Loan fully repaid
   → Outstanding_debt reaches 0
   → User can unstake anytime (no foreclosure fee)
```

### Flow 3: Unstaking (With/Without Loan)

```
Scenario A: No Loan
1. User clicks "Unstake"
   → Frontend calls: Vault.unstake(user, amount)
   → User's stRWA burned
   → User receives RWA back

Scenario B: Active Loan
1. Lockup period check (first 20% of loan duration)
   → If still in lockup: Cannot unstake (panic)

2. After lockup, user clicks "Unstake"
   → Frontend calls: Vault.unstake(user, amount)
   → 5% foreclosure fee charged (burned from stRWA)
   → User's remaining stRWA burned
   → User receives RWA back
   → Vault.forclose event emitted

3. Full loan repayment first (recommended)
   → User repays full debt
   → Loan closed
   → is_borrower flag cleared
   → Then unstake with no fee
```

---

## 🎯 Frontend Integration Checklist

### ✅ Currently Working (Real Contracts)
- [x] RWA token minting (`mint_rwa_tokens`)
- [x] Balance queries (RWA, stRWA, USDC)
- [x] Whitelist status checks

### ⚠️ Requires Setup (Then Will Work)
- [ ] Staking (needs vault whitelisting on RWA tokens)
- [ ] Unstaking (needs active stakes)
- [ ] Yield claiming (needs admin yield funding)
- [ ] Borrowing (needs LP liquidity + oracle prices)
- [ ] Repaying (needs active loans)

### 🔄 Needs Service Layer Integration
- [ ] Complete VaultService with all functions
- [ ] Complete LendingPoolService with all functions
- [ ] StRWAService for approvals
- [ ] USDCService for repayments
- [ ] OracleService for price display

---

## 📊 Contract Addresses (from deployed-addresses.json)

```typescript
// Single-asset deployment (original)
usdc_mock: "CAXHQJ6IHN..."
mock_rwa_token: "CCHUQ75NY5..."
strwa_token: "CCCTL6UHRP..."
rwa_vault: "CB3I43AX6V..."
mock_oracle: "CD5XYT6WXO..."
lending_pool: "CBJM554JCH..."

// Multi-asset deployment (from Backend_ready.md)
RWA Tokens:
  invoices: "CBFKZAVQ57..."
  tbills: "CD3ZKDA3VG..."
  real_estate: "CCSCN4NNIN..."

stRWA Tokens:
  invoices: "CDHGP3XMH2..."
  tbills: "CDGL6V3VT6..."
  real_estate: "CD5WDVFPWB..."

Vaults:
  invoices: "CCYADH4LWF..."
  tbills: "CAFQWK3D3Q..."
  real_estate: "CAGUJJGFK7..."
```

---

## 🚀 Next Steps

1. **Create Complete Service Layer**
   - VaultService with all stake/unstake/claim functions
   - LendingPoolService with all borrow/repay functions
   - Update existing services

2. **Update Dashboard Components**
   - StakeSection: Use real vault service
   - BorrowSection: Use real lending pool service
   - ProfileSection: Query real balances

3. **Contract Setup (for features to work)**
   - Grant manager role to vaults on RWA tokens
   - Add LP liquidity to lending pool
   - Set oracle prices for stRWA tokens
   - Admin fund yield pools

4. **Testing Flow**
   - Mint RWA → Approve → Stake → Get stRWA
   - Approve stRWA → Borrow USDC → Check loan
   - Repay → Close loan → Unstake

---

*Generated: November 10, 2025*
*Status: Complete Contract Mapping* ✅
