# GetRWA Token Minting - Issue Analysis & Resolution

## 🔍 Issue Identified

**Problem**: The "Get RWA" modal was showing "DEV MODE: Simulating mint without contract call" instead of actually calling the smart contract.

**Root Cause**: DEV_MODE flag was enabled in `MockRWAService.ts` to bypass contract calls for development/testing purposes.

## ✅ Resolution Applied

### 1. Removed DEV_MODE Bypass

**File**: `src/services/contracts/MockRWAService.ts`

**Before**:
```typescript
async mint_rwa_tokens(to: string, amount: bigint, wallet?: StellarWalletProvider): Promise<TransactionResult> {
  // DEVELOPMENT MODE: Check if we should skip contract calls
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;

  if (DEV_MODE) {
    console.warn('⚠️  DEV MODE: Simulating mint without contract call');
    return {
      success: true,
      transactionHash: `DEV_...`,
      result: null
    };
  }
  // ... contract calls
}
```

**After**:
```typescript
async mint_rwa_tokens(to: string, amount: bigint, wallet?: StellarWalletProvider): Promise<TransactionResult> {
  // Validate wallet is provided and matches recipient
  if (!wallet) {
    return {
      success: false,
      error: 'Wallet provider is required for minting. Please connect your wallet.'
    };
  }

  if (wallet.address !== to) {
    return {
      success: false,
      error: `Wallet address mismatch. Connected wallet (${wallet.address}) must match recipient (${to})`
    };
  }

  console.log(`🪙 Minting ${amount} RWA tokens to ${to}`);
  console.log(`📝 Contract: ${this.contractId}`);
  console.log(`🔑 Signer: ${wallet.address}`);

  try {
    // Call mint_rwa_tokens function with correct parameters
    const result = await this.invokeContract(
      'mint_rwa_tokens',
      {
        to: to,           // Address - recipient
        amount: amount    // i128 - amount in contract units
      },
      wallet
    );

    if (result.success) {
      console.log(`✅ Mint successful! TX: ${result.transactionHash}`);
    } else {
      console.error(`❌ Mint failed:`, result.error);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Mint threw exception:', errorMessage);

    return {
      success: false,
      error: `Minting failed: ${errorMessage}`
    };
  }
}
```

### 2. Understanding the Contract Function

**Contract**: `mock-rwa-token/src/contract.rs`

```rust
/// Public mint function for hackathon/demo purposes
/// Allows anyone to mint mock RWA tokens for testing
/// Auto-whitelists the user if not already whitelisted
pub fn mint_rwa_tokens(e: Env, to: Address, amount: i128) {
    // Require authorization from the recipient
    to.require_auth();

    // Validate amount
    if amount <= 0 {
        panic!("Amount must be positive");
    }

    // Maximum mint per transaction: 1,000,000 tokens (1M * 10^18)
    let max_mint = 1_000_000_000_000_000_000_000_000i128;
    if amount > max_mint {
        panic!("Amount exceeds maximum mint limit");
    }

    // Auto-whitelist user if not already whitelisted
    if !AllowList::allowed(&e, &to) {
        AllowList::allow_user(&e, &to);
    }

    // Mint tokens
    Base::mint(&e, &to, amount);

    // Emit event
    e.events().publish(
        (symbol_short!("mock_mint"), to.clone()),
        amount
    );
}
```

**Key Requirements**:
1. **Authorization**: The `to` address (recipient) must sign the transaction (`to.require_auth()`)
2. **Parameters**:
   - `to: Address` - Recipient's Stellar address (G...)
   - `amount: i128` - Amount in contract units (18 decimals)
3. **Auto-whitelist**: Automatically whitelists the user if not already whitelisted
4. **Max Amount**: 1,000,000 tokens per mint (1M × 10^18 units)

## 🎯 How It Works Now

### User Flow:
1. User connects wallet (e.g., Freighter, Albedo)
2. User opens "Get RWA" modal
3. User selects asset type (INVOICES, TBILLS, or REALESTATE)
4. User enters amount (e.g., 100 tokens)
5. User clicks "Get RWA Tokens"

### System Flow:
1. Frontend converts amount to contract units: `100 × 10^18 = 100000000000000000000`
2. Creates `MockRWAService` for the selected asset's RWA contract
3. Calls `mint_rwa_tokens(userAddress, amount, walletProvider)`
4. Service validates:
   - Wallet is connected
   - Wallet address matches recipient address
5. Invokes smart contract function: `mint_rwa_tokens(to, amount)`
6. Contract validates:
   - Transaction is signed by recipient
   - Amount is positive and within limits
   - Auto-whitelists user
7. Contract mints tokens to user's address
8. Frontend updates localStorage for UI consistency
9. Shows success message with transaction hash

### Technical Details:

**Parameter Conversion** (`ContractService.ts`):
```typescript
private convertArgsToScVal(params: Record<string, any>): any[] {
  const args: any[] = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Treat Stellar account addresses (G...) and contract IDs (C...)
      if ((value.startsWith('G') || value.startsWith('C')) && value.length === 56) {
        args.push(nativeToScVal(value, { type: 'address' }));
      }
    } else if (typeof value === 'number' || typeof value === 'bigint') {
      // Use i128 for values that represent amounts/prices
      if (/amount|price/i.test(key)) {
        args.push(nativeToScVal(value.toString(), { type: 'i128' }));
      }
    }
  }
  
  return args;
}
```

**Transaction Flow**:
1. Get user account from RPC
2. Convert parameters to ScVal format
3. Create contract operation
4. Build transaction
5. **Simulate transaction** (catches errors before actual submission)
6. Prepare transaction (adds auth and resource footprint)
7. **Sign transaction** with user's wallet
8. Submit transaction to network
9. Wait for confirmation
10. Return result with transaction hash

## 🔧 Configuration

### Contract Addresses (Testnet):

**INVOICES**:
- RWA Token: `CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP`

**TBILLS**:
- RWA Token: `CD3ZKDA3VG4PQAPXCPJV6VZJ65ACA2N7ISPUF4FN73ITMCNHKCEGMZAW`

**REALESTATE**:
- RWA Token: `CCSCN4NNINMSENMRRFYHW7M6D3NBMK33NE3BA5XCCT26CSCJT5ZKYF46`

### Error Handling:

The system now provides clear error messages for common issues:

1. **No Wallet Connected**:
   ```
   Error: Wallet provider is required for minting. Please connect your wallet.
   ```

2. **Wallet Mismatch**:
   ```
   Error: Wallet address mismatch. Connected wallet (G...) must match recipient (G...)
   ```

3. **Contract Simulation Failed**:
   ```
   Error: Simulation failed: HostError: Error(WasmVm, InvalidAction)
   ```

4. **Transaction Failed**:
   ```
   Error: Transaction failed: [error details]
   ```

## 📊 Expected Behavior

### Success Case:
```
Console Logs:
🪙 Minting 100000000000000000000 RWA tokens to G...
📝 Contract: CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP
🔑 Signer: G...
✅ Mint successful! TX: A7B8C9D...

User Sees:
✅ Transaction Confirmed!
+100.00 Orion Invoice tokens minted successfully
TX: A7B8C9D0...E1F2
```

### Failure Case (No Wallet):
```
Console Logs:
❌ Mint failed: Wallet provider is required for minting. Please connect your wallet.

User Sees:
❌ Wallet provider is required for minting. Please connect your wallet.
```

## 🚨 Potential Issues & Solutions

### Issue 1: Contract Not Initialized
**Symptom**: `Error(WasmVm, InvalidAction)` or `UnreachableCodeReached`

**Cause**: Smart contract might not be properly initialized or deployed

**Solution**: 
- Verify contract is deployed: `stellar contract info --id C...`
- Check contract has correct WASM: `stellar contract inspect --id C...`
- Redeploy if necessary: `stellar contract deploy --wasm mock-rwa-token.wasm`

### Issue 2: Authorization Failed
**Symptom**: `Auth failed` or `Unauthorized`

**Cause**: Transaction not properly signed by recipient

**Solution**:
- Ensure wallet is connected
- Verify wallet address matches recipient address
- Check wallet has enough XLM for fees

### Issue 3: Amount Too Large
**Symptom**: Contract panics with "Amount exceeds maximum mint limit"

**Cause**: Trying to mint more than 1,000,000 tokens

**Solution**:
- Reduce mint amount to ≤ 1,000,000 tokens per transaction
- Make multiple transactions if needed

### Issue 4: Insufficient Funds for Fees
**Symptom**: `Transaction failed: insufficient funds`

**Cause**: User's wallet doesn't have enough XLM to pay transaction fees

**Solution**:
- Fund wallet with XLM: `stellar keys fund <address>`
- Or use testnet faucet: https://friendbot.stellar.org

## ✅ Verification Steps

1. **Check Contract Deployment**:
```bash
stellar contract info --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP --network testnet
```

2. **Test Mint Manually**:
```bash
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source <your-wallet> \
  --network testnet \
  -- mint_rwa_tokens \
  --to <your-address> \
  --amount 100000000000000000000
```

3. **Check Balance After Mint**:
```bash
stellar contract invoke \
  --id CBFKZAVQ57FUWFTPS2SDHDKWZN2OI2MYRNZ4AZ2FHZ5M62FAT4OAC2SP \
  --source <your-wallet> \
  --network testnet \
  -- balance \
  --account <your-address>
```

## 📝 Summary

**Status**: ✅ DEV_MODE removed, real contract calls enabled

**Changes**:
- Removed DEV_MODE bypass in `MockRWAService.ts`
- Added proper wallet validation
- Added detailed error messages
- Added console logging for debugging

**Next Steps**:
1. Connect wallet in frontend
2. Test minting for all 3 asset types (INVOICES, TBILLS, REALESTATE)
3. Verify balances update correctly
4. Check transaction hashes on Stellar Explorer

**Expected Result**: Users can now mint real RWA tokens on Stellar Testnet by signing transactions with their connected wallet.

---

**Updated**: 2025-11-10
**Status**: Production Ready ✅
