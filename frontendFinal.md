# Frontend Integration Guide - Orion Protocol Contracts

**Network:** Stellar Testnet
**RPC URL:** https://soroban-testnet.stellar.org
**Network Passphrase:** Test SDF Network ; September 2015
**Deployed:** 2025-11-10T10:24:56Z
**Deployer:** GAADPNKZXJEJ6DDDCSGZH3EIIUB2BUKOMH3RQSNZZEKA5GTXRDZBLO3D

---

## Table of Contents
1. [USDC Mock Token](#1-usdc-mock-token)
2. [RWA Tokens (Invoices, T-Bills, Real Estate)](#2-rwa-tokens)
3. [stRWA Tokens (Staked RWA)](#3-strwa-tokens)
4. [RWA Vaults](#4-rwa-vaults)
5. [Lending Pool](#5-lending-pool)
6. [Mock Oracle](#6-mock-oracle)

---

## 1. USDC Mock Token

### Contract Address
```
CAXHQJ6IHN2TPAJ4NEOXJJLRRAO74BEAWA3RXHD6NSOWRBQCTVZA3ZGS
```

### Description
Mock USDC token for testing. Implements standard fungible token with 7 decimals (Stellar standard).

### Token Details
- **Name:** USD Coin Mock
- **Symbol:** USDC
- **Decimals:** 7

### Functions

#### `mint`
Mint new USDC tokens (admin only).

**Signature:**
```rust
fn mint(e: &Env, admin: Address, to: Address, amount: i128)
```

**Parameters:**
- `admin` (Address) - Admin address that authorizes the mint
- `to` (Address) - Recipient address
- `amount` (i128) - Amount to mint (with 7 decimals, e.g., 1000000 = 0.1 USDC)

**Authorization:** Requires `admin.require_auth()`

**Restrictions:**
- Only admin can mint
- No maximum limit (for testing purposes)

#### Standard Token Functions
Inherits all standard fungible token functions:
- `balance(id: Address) -> i128`
- `transfer(from: Address, to: Address, amount: i128)`
- `approve(from: Address, spender: Address, amount: i128, expiration_ledger: u32)`
- `transfer_from(spender: Address, from: Address, to: Address, amount: i128)`
- `burn(from: Address, amount: i128)`
- `total_supply() -> i128`
- `name() -> String`
- `symbol() -> String`
- `decimals() -> u32`

---

## 2. RWA Tokens

### Contract Addresses

| Asset Type | Contract Address |
|-----------|------------------|
| **Invoices** | `CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP` |
| **T-Bills** | `CD3ZKDA3VG4PQAPXCPJV6VZJ65ACA2N7ISPUF4FN73ITMCNHKCEGMZAW` |
| **Real Estate** | `CCSCN4NNINMSENMRRFYHW7M6D3NBMK33NE3BA5XCCT26CSCJT5ZKYF46` |

### Description
Real World Asset tokens with allowlist (whitelist) restrictions. These tokens represent tokenized real-world assets.

### Token Details
- **Name:** Real World Asset Token
- **Symbol:** RWA
- **Decimals:** 18 (high precision for RWA valuations)
- **Transfer Restriction:** Only whitelisted addresses can hold/transfer

### Functions

#### `mint_rwa_tokens`
Public mint function for hackathon/demo purposes. Allows anyone to mint mock RWA tokens for testing. Auto-whitelists the user.

**Signature:**
```rust
fn mint_rwa_tokens(e: Env, to: Address, amount: i128)
```

**Parameters:**
- `to` (Address) - Recipient address (must sign the transaction)
- `amount` (i128) - Amount to mint (with 18 decimals, e.g., 1000000000000000000 = 1 RWA)

**Authorization:** Requires `to.require_auth()`

**Restrictions:**
- Amount must be positive
- Maximum per transaction: 1,000,000 tokens (1,000,000 × 10^18 = 1000000000000000000000000)
- Auto-whitelists recipient if not already whitelisted

**Events:**
Emits `mock_mint` event with user address and amount

#### `allowed`
Check if an address is whitelisted.

**Signature:**
```rust
fn allowed(e: &Env, account: Address) -> bool
```

**Parameters:**
- `account` (Address) - Address to check

**Returns:** `bool` - true if whitelisted, false otherwise

#### `allow_user`
Add a user to the whitelist (manager only).

**Signature:**
```rust
fn allow_user(e: &Env, user: Address, operator: Address)
```

**Parameters:**
- `user` (Address) - Address to whitelist
- `operator` (Address) - Manager address authorizing the action

**Authorization:** Requires `operator` to have "manager" role

#### `disallow_user`
Remove a user from the whitelist (manager only).

**Signature:**
```rust
fn disallow_user(e: &Env, user: Address, operator: Address)
```

**Parameters:**
- `user` (Address) - Address to remove from whitelist
- `operator` (Address) - Manager address authorizing the action

**Authorization:** Requires `operator` to have "manager" role

#### Standard Token Functions
Inherits all standard fungible token functions (same as USDC), but with allowlist enforcement on transfers.

---

## 3. stRWA Tokens

### Contract Addresses

| Asset Type | Contract Address |
|-----------|------------------|
| **stRWA Invoices** | `CDHGP3XMH2FUQ6FFUHGLDFN5C26W7C6FW5GZ5N743M546KXWKHHK74IL` |
| **stRWA T-Bills** | `CDGL6V3VT6HAIWNDQLYTLWFXF4O7L3TNWYD3OUEE4JNCLX3EXHH2HSEA` |
| **stRWA Real Estate** | `CD5WDVFPWBLERKA3RYQT6L7V5J5NLHL3HP64WYJUVZMNUQLAGPLEYOZR` |

### Description
Staked RWA tokens. Received when users stake RWA tokens in the vault. Represents proof of stake and can be used as collateral for loans.

### Token Details
- **Name:** Staked Real World Asset
- **Symbol:** stRWA
- **Decimals:** 18 (matches RWA decimals for 1:1 parity)
- **Transfer Restriction:** None (freely transferable)

### Functions

#### `mint`
Mint stRWA tokens (vault only).

**Signature:**
```rust
fn mint(e: &Env, to: Address, amount: i128)
```

**Parameters:**
- `to` (Address) - Recipient address
- `amount` (i128) - Amount to mint (1:1 with staked RWA)

**Authorization:** Only callable by the vault contract

**Restrictions:**
- Only the vault contract can call this function
- Vault address must be set first

#### `burn`
Burn stRWA tokens (vault only).

**Signature:**
```rust
fn burn(e: &Env, from: Address, amount: i128)
```

**Parameters:**
- `from` (Address) - Address to burn from
- `amount` (i128) - Amount to burn

**Authorization:** Only callable by the vault contract

**Restrictions:**
- Only the vault contract can call this function

#### `set_vault_address`
Set the vault address (one-time, admin only).

**Signature:**
```rust
fn set_vault_address(e: &Env, vault: Address)
```

**Parameters:**
- `vault` (Address) - Vault contract address

**Authorization:** Requires admin authentication

**Restrictions:**
- Can only be called once
- Must be called by admin

#### Standard Token Functions
Inherits all standard fungible token functions (same as USDC), no transfer restrictions.

---

## 4. RWA Vaults

### Contract Addresses

| Asset Type | Contract Address |
|-----------|------------------|
| **Invoices Vault** | `CCYADH4LWFOIRCZPWCIMGG46M5ZUUQ3WQUA4FF2BJNSFQUHIKTE32N2G` |
| **T-Bills Vault** | `CAFQWK3D3QLMGSW2OL6HE3VTCLCKZKPWNTCTKBM5MFLKKZWIKTA6Z7DP` |
| **Real Estate Vault** | `CAGUJJGFK7N5WC4CEYS3CS6QH7RIAWBPZIMB6ELVHGBJ5KBA3R3WMWLI` |

### Description
Vaults manage staking of RWA tokens and distribution of USDC yield. Users stake RWA to receive stRWA and earn proportional yield.

### Data Structures

#### `StakeInfo`
```rust
{
    amount: i128,              // Amount of RWA staked
    timestamp: u64,            // When they staked
    is_borrower: bool,         // Are they using stRWA as collateral?
    borrowed_amount: i128,     // How much USDC borrowed (if borrower)
    loan_period: u64,          // Total loan duration in seconds
}
```

### Functions

#### `stake`
Stake RWA tokens to receive stRWA and earn yield.

**Signature:**
```rust
fn stake(e: &Env, user: Address, amount: i128)
```

**Parameters:**
- `user` (Address) - User address (must sign)
- `amount` (i128) - Amount of RWA to stake

**Authorization:** Requires `user.require_auth()`

**Restrictions:**
- Amount must be positive
- User must have sufficient RWA balance
- User must approve vault to spend RWA tokens

**Effects:**
- Transfers RWA from user to vault
- Mints equal amount of stRWA to user
- Creates/updates stake record

**Events:** Emits `stake` event

#### `unstake`
Unstake RWA tokens by burning stRWA.

**Signature:**
```rust
fn unstake(e: &Env, user: Address, amount: i128)
```

**Parameters:**
- `user` (Address) - User address (must sign)
- `amount` (i128) - Amount of RWA to unstake

**Authorization:** Requires `user.require_auth()`

**Restrictions:**
- Amount must be positive
- User must have sufficient staked amount
- **Borrowers:** Cannot unstake during lockup period (first 20% of loan duration)
- **Borrowers with active loans:** 5% foreclosure fee applied
- **LPs:** Cannot unstake if liquidity is being used for loans

**Effects:**
- Burns stRWA from user
- Transfers RWA back to user
- Updates stake record
- Applies foreclosure fee if applicable

**Events:** Emits `unstake` event and optionally `forclose` event

#### `claimable_yield`
View function to check claimable USDC yield for a user.

**Signature:**
```rust
fn claimable_yield(e: &Env, user: Address) -> i128
```

**Parameters:**
- `user` (Address) - User address to check

**Returns:** `i128` - Amount of USDC claimable

**Formula:**
```
claimable = (total_yield_pool × user_strwa_balance) / total_strwa_supply
```

**Restrictions:** None (read-only)

#### `claim_yield`
Claim accumulated USDC yield.

**Signature:**
```rust
fn claim_yield(e: &Env, user: Address) -> i128
```

**Parameters:**
- `user` (Address) - User address (must sign)

**Returns:** `i128` - Amount of USDC claimed

**Authorization:** Requires `user.require_auth()`

**Restrictions:**
- Must have claimable yield > 0

**Effects:**
- Transfers USDC yield to user
- Reduces total yield pool

**Events:** Emits `claim` event

#### `admin_fund_yield`
Admin funds the yield pool with USDC (simulates RWA yield).

**Signature:**
```rust
fn admin_fund_yield(e: &Env, amount: i128)
```

**Parameters:**
- `amount` (i128) - Amount of USDC to add to yield pool

**Authorization:** Requires admin authentication

**Restrictions:**
- Amount must be positive
- Admin must have USDC balance and approve vault

**Effects:**
- Transfers USDC from admin to vault
- Increases total yield pool

**Events:** Emits `yieldfund` event

#### `set_usdc_address`
Set USDC token address (one-time, admin only).

**Signature:**
```rust
fn set_usdc_address(e: &Env, usdc: Address)
```

**Parameters:**
- `usdc` (Address) - USDC contract address

**Authorization:** Requires admin authentication

**Restrictions:**
- Can only be called once

#### `set_lending_pool`
Set lending pool address (one-time, admin only).

**Signature:**
```rust
fn set_lending_pool(e: &Env, lending_pool: Address)
```

**Parameters:**
- `lending_pool` (Address) - Lending pool contract address

**Authorization:** Requires admin authentication

**Restrictions:**
- Can only be called once

### Internal Functions (Called by Lending Pool)

#### `mark_as_borrower`
Mark a user as borrower with loan details.

**Authorization:** Only lending pool contract

#### `pull_yield_for_repay`
Pull user's yield for loan repayment.

**Authorization:** Only lending pool contract

#### `update_borrowed_amount`
Update user's borrowed amount.

**Authorization:** Only lending pool contract

#### `set_lp_liquidity_used`
Track LP liquidity locked in loans.

**Authorization:** Only lending pool contract

---

## 5. Lending Pool

### Contract Address
```
CCW2TFZ7DWNMORNW3QVPYI5VYLNITMUMH42OKILXDLPN2J7HZQ545TWJ
```

### Description
Main lending protocol. Enables borrowing USDC against stRWA collateral with risk-adjusted interest rates. Liquidity providers earn interest from borrowers and share of RWA yields.

### Data Structures

#### `Loan`
```rust
{
    borrower: Address,
    collateral_amount: i128,      // stRWA collateral
    principal: i128,               // Original loan amount
    outstanding_debt: i128,        // Current debt (principal + interest + penalties)
    interest_rate: i128,           // Basis points (700 = 7%, 1400 = 14%)
    start_time: u64,
    end_time: u64,
    last_interest_update: u64,
    warnings_issued: u32,          // 0, 1, or 2
    last_warning_time: u64,
    penalties: i128,               // Accumulated penalties
    yield_share_percent: i128,     // Basis points (1000 = 10%, 2000 = 20%)
}
```

#### `LPDeposit`
```rust
{
    depositor: Address,
    total_deposited: i128,         // Total USDC deposited
    locked_amount: i128,           // USDC locked in loans
    available_amount: i128,        // USDC available to withdraw
    total_interest_earned: i128,   // Cumulative interest earned
}
```

#### `TokenRiskProfile`
```rust
{
    rwa_token_address: Address,
    token_yield_apr: i128,         // Basis points (500 = 5%)
    token_expiry: u64,
    last_updated: u64,
}
```

### Risk-Adjusted Interest Rates

| RWA Yield APR | Risk Level | Borrower Interest | LP Yield Share |
|---------------|-----------|-------------------|----------------|
| < 5% | High Risk | 14% APR | 20% |
| ≥ 5% | Low Risk | 7% APR | 10% |

### LP Functions

#### `lp_deposit`
Deposit USDC to earn interest as a liquidity provider.

**Signature:**
```rust
fn lp_deposit(e: Env, depositor: Address, amount: i128)
```

**Parameters:**
- `depositor` (Address) - LP address (must sign)
- `amount` (i128) - Amount of USDC to deposit

**Authorization:** Requires `depositor.require_auth()`

**Restrictions:**
- Amount must be positive
- Depositor must have USDC balance and approve contract

**Effects:**
- Transfers USDC from depositor to contract
- Creates/updates LP deposit record
- Increases total liquidity

**Events:** Emits `lp_depo` event

#### `lp_withdraw`
Withdraw available USDC (not locked in loans).

**Signature:**
```rust
fn lp_withdraw(e: Env, depositor: Address, amount: i128)
```

**Parameters:**
- `depositor` (Address) - LP address (must sign)
- `amount` (i128) - Amount of USDC to withdraw

**Authorization:** Requires `depositor.require_auth()`

**Restrictions:**
- Amount must be positive
- Amount must not exceed available balance (total - locked)
- Cannot withdraw funds locked in active loans

**Effects:**
- Transfers USDC to depositor
- Updates LP deposit record
- Decreases total liquidity

**Events:** Emits `lp_withd` event

#### `get_lp_deposit`
View function to get LP deposit information.

**Signature:**
```rust
fn get_lp_deposit(e: Env, depositor: Address) -> LPDeposit
```

**Parameters:**
- `depositor` (Address) - LP address to query

**Returns:** `LPDeposit` struct with deposit information

**Restrictions:** None (read-only)

### Borrower Functions

#### `originate_loan`
Originate a new loan by providing stRWA collateral.

**Signature:**
```rust
fn originate_loan(
    e: Env,
    borrower: Address,
    collateral_amount: i128,
    loan_amount: i128,
    duration_months: u32,
)
```

**Parameters:**
- `borrower` (Address) - Borrower address (must sign)
- `collateral_amount` (i128) - Amount of stRWA to lock as collateral
- `loan_amount` (i128) - Amount of USDC to borrow
- `duration_months` (u32) - Loan duration in months (3-24)

**Authorization:** Requires `borrower.require_auth()`

**Restrictions:**
- **One loan per user:** Cannot have multiple active loans
- **Duration:** Must be between 3 and 24 months
- **Collateral ratio:** 140% minimum (collateral value ≥ loan amount × 1.4)
- **Oracle freshness:** Price must be < 24 hours old
- **Liquidity:** Pool must have sufficient available liquidity
- **Token risk profile:** Must be set for the RWA token

**Effects:**
- Transfers stRWA collateral from borrower to contract
- Transfers USDC loan amount to borrower
- Creates loan record
- Locks liquidity in pool
- Marks user as borrower in vault
- Auto-calculates interest rate based on RWA risk

**Events:** Emits `loan_orig` event

**Interest Calculation:**
- Compound interest: A = P × (1 + r/12)^months
- Applied monthly

#### `repay_loan`
Make a payment towards your loan.

**Signature:**
```rust
fn repay_loan(e: Env, borrower: Address, amount: i128)
```

**Parameters:**
- `borrower` (Address) - Borrower address (must sign)
- `amount` (i128) - Amount of USDC to repay

**Authorization:** Requires `borrower.require_auth()`

**Restrictions:**
- Amount must be positive
- Must have an active loan

**Payment Flow:**
1. Updates interest first
2. Attempts to pull yield from vault
3. Borrower pays remaining amount
4. LP share (10% or 20%) distributed to LPs
5. Principal payment reduces outstanding debt
6. Warnings reset if payment > 10% of principal

**Effects:**
- Updates loan debt
- Transfers USDC to contract
- Distributes LP share
- Resets warnings if significant payment
- Closes loan if fully repaid

**Events:** Emits `repay` event, `loan_cls` event if closed

#### `close_loan_early`
Close loan early with 5% closure fee.

**Signature:**
```rust
fn close_loan_early(e: Env, borrower: Address)
```

**Parameters:**
- `borrower` (Address) - Borrower address (must sign)

**Authorization:** Requires `borrower.require_auth()`

**Restrictions:**
- Must have an active loan

**Payment Required:**
- Outstanding debt + (5% × outstanding debt)
- Attempts to use yield first

**Effects:**
- Pays full debt + fee
- Returns collateral
- Closes loan
- Fee benefits LPs

**Events:** Emits `early_cl` and `loan_cls` events

#### `update_loan_interest`
Update interest on a loan (can be called by anyone).

**Signature:**
```rust
fn update_loan_interest(e: Env, borrower: Address)
```

**Parameters:**
- `borrower` (Address) - Borrower address

**Authorization:** None required (public)

**Restrictions:**
- Loan must exist
- Only updates if full month has passed

**Effects:**
- Calculates compound interest for months elapsed
- Adds interest to outstanding debt
- Updates last interest update timestamp

**Events:** Emits `int_upd` event

### Warning & Liquidation Functions

#### `check_and_issue_warning`
Check if borrower should receive a warning and issue if needed.

**Signature:**
```rust
fn check_and_issue_warning(e: Env, borrower: Address)
```

**Parameters:**
- `borrower` (Address) - Borrower to check

**Authorization:** None required (public, can be called by anyone)

**Warning Conditions:**
- 2 weeks since last payment/warning
- OR collateral ratio ≥ 110%

**Restrictions:**
- Maximum 2 warnings per loan
- Oracle price must be fresh (< 24 hours)

**Effects:**
- Issues warning (max 2)
- Applies 2% penalty on outstanding debt per warning
- Flags loan for liquidation if 2 warnings or ratio ≥ 110%

**Events:** Emits `warning` event, `liq_flag` event if eligible

#### `liquidate_loan`
Liquidate an undercollateralized loan.

**Signature:**
```rust
fn liquidate_loan(e: Env, caller: Address, borrower: Address)
```

**Parameters:**
- `caller` (Address) - Liquidation bot address (must sign)
- `borrower` (Address) - Borrower to liquidate

**Authorization:** Requires `caller.require_auth()` - Only liquidation bot

**Liquidation Threshold:**
- Total debt ≥ collateral value × 110%

**Restrictions:**
- Only liquidation bot can call
- Threshold must be met
- Oracle price must be fresh

**Effects:**
- Burns stRWA collateral
- Pays 10% reward to bot in USDC
- Repays debt to pool from remaining collateral
- Closes loan
- Removes borrower status

**Events:** Emits `liquidat` event

### Admin Functions

#### `update_token_risk_profile`
Update risk profile for an RWA token (admin only).

**Signature:**
```rust
fn update_token_risk_profile(
    e: Env,
    caller: Address,
    rwa_token_address: Address,
    token_yield_apr: i128,
    token_expiry: u64,
)
```

**Parameters:**
- `caller` (Address) - Admin address
- `rwa_token_address` (Address) - RWA token to configure
- `token_yield_apr` (i128) - Yield APR in basis points (e.g., 500 = 5%)
- `token_expiry` (u64) - Token expiry timestamp

**Authorization:** Requires admin role

**Effects:**
- Creates/updates token risk profile
- Affects interest rates for new loans

#### `set_liquidation_bot`
Set the liquidation bot address (admin only).

**Signature:**
```rust
fn set_liquidation_bot(e: Env, caller: Address, bot_address: Address)
```

**Parameters:**
- `caller` (Address) - Admin address
- `bot_address` (Address) - Bot address authorized to liquidate

**Authorization:** Requires admin role

### View Functions

#### `get_loan`
Get loan information for a borrower.

**Signature:**
```rust
fn get_loan(e: Env, borrower: Address) -> Option<Loan>
```

**Parameters:**
- `borrower` (Address) - Borrower address

**Returns:** `Option<Loan>` - Loan struct or None if no loan

#### `get_token_risk_profile`
Get risk profile for an RWA token.

**Signature:**
```rust
fn get_token_risk_profile(e: Env, rwa_token: Address) -> Option<TokenRiskProfile>
```

**Parameters:**
- `rwa_token` (Address) - RWA token address

**Returns:** `Option<TokenRiskProfile>` - Risk profile or None

#### `get_total_liquidity`
Get total USDC liquidity in pool.

**Signature:**
```rust
fn get_total_liquidity(e: Env) -> i128
```

**Returns:** `i128` - Total USDC liquidity

#### `get_available_liquidity`
Get available USDC liquidity (not locked in loans).

**Signature:**
```rust
fn get_available_liquidity(e: Env) -> i128
```

**Returns:** `i128` - Available USDC liquidity

---

## 6. Mock Oracle

### Contract Address
```
CD5XYT6WXOB567JC3QZGJ7RWHWP4N3C4GJ5LX75WDWUGL7NPXFJJC6AZ
```

### Description
Price oracle for stRWA tokens. Provides price feeds for collateral valuation.

### Data Structures

#### `PriceData`
```rust
{
    price: i128,       // Price in basis points (e.g., 10500 = 105.00 USDC)
    timestamp: u64,    // Unix timestamp of last update
}
```

### Functions

#### `submit_price`
Submit a new price for an asset (bot only).

**Signature:**
```rust
fn submit_price(e: &Env, bot: Address, asset: Address, price: i128)
```

**Parameters:**
- `bot` (Address) - Authorized bot address (must sign)
- `asset` (Address) - Asset address (e.g., stRWA token)
- `price` (i128) - Price in basis points

**Authorization:** Requires `bot.require_auth()` and bot must be authorized

**Restrictions:**
- Only authorized bot can submit prices
- Price must be positive

**Effects:**
- Updates price for asset
- Records current timestamp

**Events:** Emits `price_upd` event

**Example:**
- Price of 10500 = 105.00 USDC per stRWA
- Price of 1000000 = 10,000.00 USDC per stRWA

#### `get_price`
Get the latest price for an asset (public, read-only).

**Signature:**
```rust
fn get_price(e: &Env, asset: Address) -> i128
```

**Parameters:**
- `asset` (Address) - Asset address

**Returns:** `i128` - Latest price in basis points

**Restrictions:** Price must exist for asset

#### `get_price_data`
Get the full price data (price + timestamp).

**Signature:**
```rust
fn get_price_data(e: &Env, asset: Address) -> (i128, u64)
```

**Parameters:**
- `asset` (Address) - Asset address

**Returns:** Tuple of `(price, timestamp)`

**Restrictions:** Price must exist for asset

---

## Common Workflows

### Workflow 1: Mint Mock RWA Tokens

```javascript
// 1. Connect wallet
// 2. Call mint_rwa_tokens on RWA token contract
const rwaInvoices = "CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP";
const amount = 1000000000000000000000; // 1000 RWA tokens (18 decimals)

await contractInvoke({
  contractAddress: rwaInvoices,
  method: "mint_rwa_tokens",
  args: [userAddress, amount],
  signers: [userKeypair]
});
// User is auto-whitelisted
```

### Workflow 2: Stake RWA to Get stRWA

```javascript
// 1. Approve vault to spend RWA
const rwaInvoices = "CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP";
const vaultInvoices = "CCYADH4LWFOIRCZPWCIMGG46M5ZUUQ3WQUA4FF2BJNSFQUHIKTE32N2G";
const stakeAmount = 1000000000000000000000; // 1000 RWA

await contractInvoke({
  contractAddress: rwaInvoices,
  method: "approve",
  args: [userAddress, vaultInvoices, stakeAmount, 0], // 0 = no expiration
  signers: [userKeypair]
});

// 2. Stake RWA
await contractInvoke({
  contractAddress: vaultInvoices,
  method: "stake",
  args: [userAddress, stakeAmount],
  signers: [userKeypair]
});
// Receives 1000 stRWA tokens
```

### Workflow 3: LP Provides Liquidity

```javascript
// 1. Approve lending pool to spend USDC
const usdc = "CAXHQJ6IHN2TPAJ4NEOXJJLRRAO74BEAWA3RXHD6NSOWRBQCTVZA3ZGS";
const lendingPool = "CCW2TFZ7DWNMORNW3QVPYI5VYLNITMUMH42OKILXDLPN2J7HZQ545TWJ";
const depositAmount = 100000000; // 10 USDC (7 decimals)

await contractInvoke({
  contractAddress: usdc,
  method: "approve",
  args: [lpAddress, lendingPool, depositAmount, 0],
  signers: [lpKeypair]
});

// 2. Deposit USDC
await contractInvoke({
  contractAddress: lendingPool,
  method: "lp_deposit",
  args: [lpAddress, depositAmount],
  signers: [lpKeypair]
});
```

### Workflow 4: Borrow Against stRWA Collateral

```javascript
// 1. Approve lending pool to spend stRWA
const strwaInvoices = "CDHGP3XMH2FUQ6FFUHGLDFN5C26W7C6FW5GZ5N743M546KXWKHHK74IL";
const lendingPool = "CCW2TFZ7DWNMORNW3QVPYI5VYLNITMUMH42OKILXDLPN2J7HZQ545TWJ";
const collateralAmount = 1000000000000000000000; // 1000 stRWA
const loanAmount = 50000000; // 5 USDC (7 decimals)
const durationMonths = 12;

await contractInvoke({
  contractAddress: strwaInvoices,
  method: "approve",
  args: [borrowerAddress, lendingPool, collateralAmount, 0],
  signers: [borrowerKeypair]
});

// 2. Originate loan
await contractInvoke({
  contractAddress: lendingPool,
  method: "originate_loan",
  args: [borrowerAddress, collateralAmount, loanAmount, durationMonths],
  signers: [borrowerKeypair]
});
// Receives 5 USDC loan
// Must maintain 140% collateral ratio
```

### Workflow 5: Claim Yield from Vault

```javascript
// 1. Check claimable yield
const vaultInvoices = "CCYADH4LWFOIRCZPWCIMGG46M5ZUUQ3WQUA4FF2BJNSFQUHIKTE32N2G";

const claimable = await contractQuery({
  contractAddress: vaultInvoices,
  method: "claimable_yield",
  args: [userAddress]
});

// 2. Claim if > 0
if (claimable > 0) {
  await contractInvoke({
    contractAddress: vaultInvoices,
    method: "claim_yield",
    args: [userAddress],
    signers: [userKeypair]
  });
}
```

### Workflow 6: Repay Loan

```javascript
// 1. Approve USDC for repayment (if not using yield)
const usdc = "CAXHQJ6IHN2TPAJ4NEOXJJLRRAO74BEAWA3RXHD6NSOWRBQCTVZA3ZGS";
const lendingPool = "CCW2TFZ7DWNMORNW3QVPYI5VYLNITMUMH42OKILXDLPN2J7HZQ545TWJ";
const repayAmount = 10000000; // 1 USDC

await contractInvoke({
  contractAddress: usdc,
  method: "approve",
  args: [borrowerAddress, lendingPool, repayAmount, 0],
  signers: [borrowerKeypair]
});

// 2. Repay loan
await contractInvoke({
  contractAddress: lendingPool,
  method: "repay_loan",
  args: [borrowerAddress, repayAmount],
  signers: [borrowerKeypair]
});
// Yield from vault is used first
// Then USDC from wallet
```

---

## Important Constants

### Decimals
- **USDC:** 7 decimals
- **RWA tokens:** 18 decimals
- **stRWA tokens:** 18 decimals

### Basis Points
- 100 basis points = 1%
- 700 basis points = 7%
- 1400 basis points = 14%
- 10000 basis points = 100%

### Time Constants
- 1 month ≈ 30 days = 2,592,000 seconds
- 2 weeks = 14 days = 1,209,600 seconds
- 24 hours = 86,400 seconds

### Loan Parameters
- **Min duration:** 3 months
- **Max duration:** 24 months
- **Min collateral ratio:** 140%
- **Warning threshold:** 110%
- **Liquidation threshold:** 110%
- **Max warnings:** 2
- **Warning penalty:** 2% per warning
- **Early closure fee:** 5%
- **Foreclosure fee:** 5%
- **Bot liquidation reward:** 10%

### Interest Rates
- **High-risk RWA (yield < 5%):** 14% APR, 20% LP share
- **Low-risk RWA (yield ≥ 5%):** 7% APR, 10% LP share

---

## Error Messages

Common error messages you might encounter:

| Error | Meaning | Solution |
|-------|---------|----------|
| "Amount must be positive" | Amount <= 0 | Use positive values |
| "Amount exceeds maximum mint limit" | Minting too many RWA tokens | Mint <= 1,000,000 tokens per tx |
| "User already has an active loan" | Multiple loans not allowed | Repay existing loan first |
| "Loan duration must be between 3 and 24 months" | Invalid duration | Use 3-24 months |
| "Insufficient collateral (140% ratio required)" | Low collateral | Increase collateral amount |
| "Insufficient pool liquidity" | Not enough USDC in pool | Wait for more LP deposits |
| "Oracle price is stale" | Price > 24 hours old | Bot needs to update price |
| "Insufficient available balance" | LP trying to withdraw locked funds | Only withdraw available amount |
| "Cannot unstake during lockup period" | Borrower in first 20% of loan | Wait until lockup ends |
| "Cannot unstake: liquidity is being used for loans" | LP liquidity locked | Wait for loan repayments |
| "Liquidation threshold not met" | Attempting invalid liquidation | Wait for threshold (110%) |
| "Only liquidation bot can liquidate" | Unauthorized liquidation | Only bot can liquidate |

---

## Events

All contracts emit events for off-chain monitoring:

### USDC Mock
- (none)

### RWA Tokens
- `mock_mint(user: Address, amount: i128)`

### stRWA Tokens
- (none)

### Vaults
- `stake(user: Address, amount: i128)`
- `unstake(user: Address, amount: i128)`
- `forclose(user: Address, fee: i128)`
- `yieldfund(admin: Address, amount: i128)`
- `claim(user: Address, amount: i128)`

### Lending Pool
- `lp_depo(depositor: Address, amount: i128)`
- `lp_withd(depositor: Address, amount: i128)`
- `loan_orig(borrower: Address, amount: i128)`
- `repay(borrower: Address, amount: i128)`
- `early_cl(borrower: Address, total: i128)`
- `loan_cls(borrower: Address)`
- `int_upd(borrower: Address, interest: i128)`
- `warning(borrower: Address, count: u32)`
- `liq_flag(borrower: Address)`
- `liquidat(borrower: Address, debt: i128)`

### Oracle
- `price_upd(asset: Address, price: i128, timestamp: u64)`

---

## Security Considerations

### For Frontend Developers

1. **Always validate user inputs** before sending to contracts
2. **Check allowances** before transfers
3. **Verify contract addresses** before transactions
4. **Display decimals correctly** (USDC: 7, RWA/stRWA: 18)
5. **Handle errors gracefully** with user-friendly messages
6. **Show loading states** during transaction processing
7. **Confirm transaction success** before updating UI
8. **Monitor events** for real-time updates
9. **Check collateral ratios** before displaying loan options
10. **Warn users** about lockup periods and fees

### Transaction Approval Flows

Most transactions require approval before execution:

```
User Action → Approve Token → Execute Action
```

Example for staking:
```
Stake RWA → approve(RWA, vault, amount) → stake(user, amount)
```

Always show users:
- What they're approving
- For which contract
- The amount
- The next action after approval

---

## Testing Tips

### Get Test Tokens

1. **USDC:** Use the admin mint function or ask deployer
2. **RWA:** Call `mint_rwa_tokens` (anyone can mint)
3. **stRWA:** Stake RWA in vault

### Test Scenarios

1. **Happy path:** Mint → Stake → Borrow → Repay → Unstake
2. **Yield claiming:** Stake → Wait for admin funding → Claim
3. **LP flow:** Deposit → Wait for borrowers → Withdraw
4. **Warning system:** Borrow → Wait 2 weeks → Check warnings
5. **Liquidation:** Borrow → Drop collateral value → Liquidate

---

## Support & Questions

For integration support:
- Check the deployed addresses in `deployed-addresses.json`
- Review contract source code in `/contracts` directory
- Test on Stellar Testnet before mainnet
- Verify all addresses match the deployed contracts

---

**Last Updated:** 2025-11-10
**Version:** 1.0
**Network:** Stellar Testnet
