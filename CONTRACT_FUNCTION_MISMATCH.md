# Critical Issue: Contract Function Mismatch

## 🚨 Problem

The deployed RWA contract at `CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP` **does not have the `mint_rwa_tokens()` function**.

**Error:**
```
Error(WasmVm, MissingValue)
"trying to invoke non-existent contract function", mint_rwa_tokens
```

## 🔍 Root Cause

The deployed contract is **NOT** from the source code in `contracts/contracts/mock-rwa-token/src/contract.rs`.

The source code has:
```rust
pub fn mint_rwa_tokens(e: Env, to: Address, amount: i128) {
    to.require_auth();
    // ...mint logic
}
```

But the deployed contract **doesn't have this function**.

## ✅ Solutions

### Solution 1: Redeploy the Contract (RECOMMENDED)

This is the proper fix - deploy the correct contract with the `mint_rwa_tokens` function.

**Steps:**

1. **Build the contract:**
```bash
cd /Users/kaushalchaudhari/Desktop/web3/projects/orion/orion/contracts/contracts/mock-rwa-token
stellar contract build
```

2. **Deploy for INVOICES:**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mock_rwa_token.wasm \
  --source <deployer-wallet> \
  --network testnet
```

3. **Initialize the contract:**
```bash
stellar contract invoke \
  --id <NEW_CONTRACT_ID> \
  --source <deployer-wallet> \
  --network testnet \
  -- __constructor \
  --admin <ADMIN_ADDRESS> \
  --manager <MANAGER_ADDRESS> \
  --initial_supply 0
```

4. **Update contract address in code:**
```typescript
// src/services/contracts/index.ts
export const CONTRACT_ADDRESSES = {
  RWA_INVOICES: '<NEW_CONTRACT_ID>',  // Update this
  // ...rest
};
```

5. **Repeat for TBILLS and REALESTATE**

### Solution 2: Use Existing Contract with Different Function (TEMPORARY)

If the deployed contract is a standard fungible token, it might have a `mint()` function that requires admin authorization.

**I've already updated the code to try both functions:**
- First tries: `mint_rwa_tokens(to, amount)`
- Falls back to: `mint(to, amount)`

**This will work IF the deployed contract has a `mint()` function.**

### Solution 3: Check What Functions ARE Available

Let's see what the deployed contract actually has:

```bash
# Try to call a standard function to see what's available
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source <your-wallet> \
  --network testnet \
  -- name

# Or check balance function
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source <your-wallet> \
  --network testnet \
  -- balance \
  --account <ADDRESS>
```

## 🔧 Quick Fix Applied

I've updated `MockRWAService.ts` to try multiple function names:

```typescript
const attemptConfigs = [
  {
    name: 'mint_rwa_tokens',
    params: { to, amount },
    description: 'Custom public mint function'
  },
  {
    name: 'mint',
    params: { to, amount },
    description: 'Standard fungible token mint'
  }
];
```

This will automatically try the fallback if `mint_rwa_tokens` doesn't exist.

## 📋 What to Do Now

**Option A - Proper Fix (Recommended):**
1. Redeploy all 3 RWA contracts with the correct source code
2. Update `CONTRACT_ADDRESSES` in the frontend
3. Test minting with `mint_rwa_tokens()` function

**Option B - Quick Test:**
1. Try the current code - it will attempt `mint()` as fallback
2. If that fails too, the deployed contract might not support public minting
3. You might need to use an admin wallet to mint tokens

**Option C - Check Deployed Contract:**
1. Use Stellar CLI to inspect what functions the deployed contract has
2. Update the frontend code to use the correct function name

## 🎯 Recommended Action

**Redeploy the contracts** because:
- The source code has the correct `mint_rwa_tokens()` function
- It allows public minting with auto-whitelist
- It's designed for hackathon/demo purposes
- Current deployed contracts seem to be from a different version

**Deployment Script:**
```bash
#!/bin/bash

# Deploy and initialize all 3 RWA tokens

ADMIN="<YOUR_ADMIN_WALLET>"
MANAGER="<YOUR_MANAGER_WALLET>"

echo "Building RWA token contract..."
cd contracts/contracts/mock-rwa-token
stellar contract build

echo "Deploying INVOICES RWA token..."
RWA_INVOICES=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mock_rwa_token.wasm \
  --source $ADMIN \
  --network testnet)

echo "Initializing INVOICES..."
stellar contract invoke \
  --id $RWA_INVOICES \
  --source $ADMIN \
  --network testnet \
  -- __constructor \
  --admin $ADMIN \
  --manager $MANAGER \
  --initial_supply 0

echo "Deploying TBILLS RWA token..."
RWA_TBILLS=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mock_rwa_token.wasm \
  --source $ADMIN \
  --network testnet)

echo "Initializing TBILLS..."
stellar contract invoke \
  --id $RWA_TBILLS \
  --source $ADMIN \
  --network testnet \
  -- __constructor \
  --admin $ADMIN \
  --manager $MANAGER \
  --initial_supply 0

echo "Deploying REALESTATE RWA token..."
RWA_REALESTATE=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mock_rwa_token.wasm \
  --source $ADMIN \
  --network testnet)

echo "Initializing REALESTATE..."
stellar contract invoke \
  --id $RWA_REALESTATE \
  --source $ADMIN \
  --network testnet \
  -- __constructor \
  --admin $ADMIN \
  --manager $MANAGER \
  --initial_supply 0

echo "✅ Deployment complete!"
echo "RWA_INVOICES: $RWA_INVOICES"
echo "RWA_TBILLS: $RWA_TBILLS"
echo "RWA_REALESTATE: $RWA_REALESTATE"
```

---

**Status**: Awaiting contract redeployment
**Temporary Fix**: Code updated to try fallback functions
**Permanent Fix**: Redeploy contracts with correct source code
