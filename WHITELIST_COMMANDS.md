# 🔐 Whitelist Commands - FIX STAKING ISSUE

## 🔴 ROOT CAUSE IDENTIFIED

The staking is failing because:
1. ✅ **Approval Step (Step 1)** - Appears to succeed but is actually **FAILING** on-chain
2. ❌ **Stake Step (Step 2)** - Fails with `UnreachableCodeReached` because vault has NO approval

**Why?** The user `GC4Z67Y6JUVZFNQMZ5RDMD55FSAAL4B4SEE5LRR27IBXB6ZIF77OWFER` is **NOT WHITELISTED** on the RWA token contract.

---

## ✅ SOLUTION: Run These Commands

You need to whitelist **TWO** addresses on the RWA token contract:

### 1️⃣ Whitelist the USER

This allows the user to approve and transfer their tokens.

```bash
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user GC4Z67Y6JUVZFNQMZ5RDMD55FSAAL4B4SEE5LRR27IBXB6ZIF77OWFER \
  --operator <YOUR_ADMIN_ADDRESS>
```

### 2️⃣ Whitelist the VAULT

This allows the vault to receive tokens when staking.

```bash
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user CCM7IV5TRRDLBBSAMFGJE7JWKX2K2NXHXWZT5WOPHGTCPLP2DMLQFCWP \
  --operator <YOUR_ADMIN_ADDRESS>
```

---

## 📋 Contract Details

| Contract | Address | Purpose |
|----------|---------|---------|
| **RWA Token (Invoices)** | `CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP` | The token being staked |
| **Vault (Invoices)** | `CCM7IV5TRRDLBBSAMFGJE7JWKX2K2NXHXWZT5WOPHGTCPLP2DMLQFCWP` | Staking pool contract |
| **User** | `GC4Z67Y6JUVZFNQMZ5RDMD55FSAAL4B4SEE5LRR27IBXB6ZIF77OWFER` | The wallet trying to stake |

---

## 🔍 What Was Happening

### Before (Current Behavior)

```
User clicks "Stake"
    ↓
Step 1: Approve vault to spend tokens
    ↓
❌ Approval fails (user not whitelisted)
    ↓
⚠️  Frontend shows "success" (was simulating)
    ↓
Step 2: Vault tries to stake
    ↓
❌ Vault can't transfer tokens (NO real approval exists)
    ↓
🔴 Contract panics: UnreachableCodeReached
```

### After Running Commands

```
User clicks "Stake"
    ↓
Step 1: Approve vault to spend tokens
    ↓
✅ Approval succeeds ON-CHAIN (user is whitelisted)
    ↓
Step 2: Vault stakes tokens
    ↓
✅ Vault transfers RWA from user (vault is whitelisted)
    ↓
✅ Vault mints stRWA to user 1:1
    ↓
🎉 SUCCESS!
```

---

## 🧪 How to Test

1. **Run both whitelist commands above** (replace `<YOUR_ADMIN_ADDRESS>` with admin address)

2. **Refresh the frontend** and try staking again

3. **Check browser console** - you should see:
   ```
   📅 Current ledger: 1519998, expiration: 1619998
   🔐 Attempting to approve 20000000000000000000 tokens for CCM7IV5T...
      From: GC4Z67Y6J...
      Spender: CCM7IV5T...
      Expiration ledger: 1619998
   ✅ Approval succeeded on blockchain!
      Transaction: <actual TX hash>
   📦 Attempting to stake 20000000000000000000 tokens for GC4Z67Y6J...
      Contract: CCM7IV5T...
   ✅ Stake succeeded!
   ```

4. **Expected result**: Both Step 1 and Step 2 will complete successfully!

---

## ⚠️ Important Notes

### For Other Assets

If staking **T-Bills** or **Real Estate**, use these addresses:

#### T-Bills
```bash
# Whitelist user
stellar contract invoke \
  --id CD3ZKDA3VG4PQAPXCPJV6VZJ65ACA2N7ISPUF4FN73ITMCNHKCEGMZAW \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user GC4Z67Y6JUVZFNQMZ5RDMD55FSAAL4B4SEE5LRR27IBXB6ZIF77OWFER \
  --operator <ADMIN_ADDRESS>

# Whitelist vault
stellar contract invoke \
  --id CD3ZKDA3VG4PQAPXCPJV6VZJ65ACA2N7ISPUF4FN73ITMCNHKCEGMZAW \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user CDSIVX2OSB3KHD7STXYYM6TFMJ2XJNEGOXPJ4INOXUWX7T2QZYLNHA4G \
  --operator <ADMIN_ADDRESS>
```

#### Real Estate
```bash
# Whitelist user
stellar contract invoke \
  --id CCSCN4NNINMSENMRRFYHW7M6D3NBMK33NE3BA5XCCT26CSCJT5ZKYF46 \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user GC4Z67Y6JUVZFNQMZ5RDMD55FSAAL4B4SEE5LRR27IBXB6ZIF77OWFER \
  --operator <ADMIN_ADDRESS>

# Whitelist vault
stellar contract invoke \
  --id CCSCN4NNINMSENMRRFYHW7M6D3NBMK33NE3BA5XCCT26CSCJT5ZKYF46 \
  --source-account testnet-deployer \
  --network testnet \
  -- allow_user \
  --user CDHOKA4CLTVTSGHYWGG76LULXBCQK5YHOJCHMOFX4LHLWSG5FZZTDE54 \
  --operator <ADMIN_ADDRESS>
```

---

## 🔧 Code Changes Made

### 1. MockRWAService.ts - Removed Simulation

**Before**: Approval would simulate success when whitelist check failed
**After**: Approval now **throws an error** with exact commands to run

This ensures the user sees the real problem instead of getting a false success.

### 2. StakeSection.tsx - Better Error Handling

Now shows a clear toast message when whitelisting is required, directing users to check the console for commands.

---

## 📚 References

- See `stake.md` for the complete staking integration guide
- See `STAKE_FIX_SUMMARY.md` for previous fixes (expiration ledger calculation)
- Contract addresses: `src/services/contracts/index.ts`

---

**Status**: 🔴 **ACTION REQUIRED** - Admin must run whitelist commands before staking will work.
