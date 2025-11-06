# Frontend Integration with Soroban Smart Contracts

This comprehensive guide explains how frontend applications interact with Soroban (Stellar) smart contracts, including the differences from traditional EVM-based contract interactions.

## Table of Contents

1. [Key Differences from EVM/Solidity](#key-differences-from-evmsolidity)
2. [Contract Architecture](#contract-architecture)
3. [Frontend Integration Components](#frontend-integration-components)
4. [Wallet Connection](#wallet-connection)
5. [Contract Client Generation](#contract-client-generation)
6. [Contract Function Calls](#contract-function-calls)
7. [Transaction Flow](#transaction-flow)
8. [Required Dependencies](#required-dependencies)
9. [Best Practices](#best-practices)
10. [Example Implementation](#example-implementation)

---

## Key Differences from EVM/Solidity

Unlike EVM-based blockchains where you need contract address + ABI, Soroban contracts require:

### EVM/Solidity Approach:
```javascript
// EVM - Simple approach
const contract = new ethers.Contract(contractAddress, abi, signer);
const result = await contract.myFunction(param1, param2);
```

### Soroban Approach:
```typescript
// Soroban - More complex but more type-safe
import { Client } from "./generated-client"; // Generated from contract
const client = new Client({
  contractId: "CONTRACT_ID",
  networkPassphrase: Networks.TESTNET,
  rpcUrl: "https://soroban-testnet.stellar.org"
});

// Transaction building and simulation required
const transaction = await client.myFunction({
  param1: "value1",
  param2: "value2"
}, {
  fee: "100000",
  timeoutInSeconds: 30
});

// Sign and submit
const signedTx = await wallet.signTransaction(transaction.toXDR());
const result = await client.submit(signedTx);
```

---

## Contract Architecture

### Rust Contract Structure

Soroban contracts are written in Rust with specific attributes:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    /// Initialize contract (constructor)
    pub fn __constructor(env: &Env, admin: Address) {
        admin.require_auth();
        // Contract initialization logic
    }

    /// Public function callable from frontend
    pub fn my_function(env: &Env, param1: u64, user: Address) -> bool {
        user.require_auth(); // Requires user signature
        // Contract logic
        true
    }

    /// Read-only function (doesn't modify state)
    pub fn get_value(env: &Env) -> u64 {
        // Read from storage
        env.storage().instance().get(&Symbol::new(env, "value")).unwrap_or(0)
    }
}
```

### Contract Metadata

Soroban contracts automatically generate:
- **Contract Specification (WASM)**: Contains function signatures and types
- **JSON Schema**: Used for frontend form generation
- **Type Definitions**: TypeScript types for frontend integration

---

## Frontend Integration Components

### 1. Core Dependencies

```json
{
  "dependencies": {
    "@stellar/stellar-sdk": "^14.2.0",
    "@creit.tech/stellar-wallets-kit": "^1.9.5",
    "@stellar/stellar-xdr-json": "^23.0.0"
  }
}
```

### 2. Network Configuration

```typescript
// src/contracts/util.ts
export const stellarNetwork = "TESTNET"; // or "MAINNET", "FUTURENET", "LOCAL"
export const networkPassphrase = Networks.TESTNET;
export const rpcUrl = "https://soroban-testnet.stellar.org";
export const horizonUrl = "https://horizon-testnet.stellar.org";

export const network = {
  id: "testnet",
  label: "testnet",
  passphrase: networkPassphrase,
  rpcUrl: rpcUrl,
  horizonUrl: horizonUrl,
};
```

---

## Wallet Connection

### Wallet Provider Setup

```typescript
// src/providers/WalletProvider.tsx
import { StellarWalletsKit, WalletNetwork } from "@creit.tech/stellar-wallets-kit";

const kit = new StellarWalletsKit({
  network: networkPassphrase as WalletNetwork,
  modules: sep43Modules(), // Standard wallet modules
});

export const connectWallet = async () => {
  await kit.openModal({
    modalTitle: "Connect to your wallet",
    onWalletSelected: (option) => {
      kit.setWallet(option.id);
      // Handle wallet connection
    },
  });
};
```

### Wallet Context

```typescript
export interface WalletContextType {
  address?: string;
  network?: string;
  networkPassphrase?: string;
  isPending: boolean;
  signTransaction?: (xdr: string, options: SignOptions) => Promise<SignedTransaction>;
}
```

---

## Contract Client Generation

### Manual Client Creation

Unlike EVM where ABIs are JSON files, Soroban uses generated TypeScript clients:

```typescript
// Generated client structure
export class Client {
  constructor(options: {
    contractId: string;
    networkPassphrase: string;
    rpcUrl: string;
    wallet?: Wallet;
  }) {
    this.options = options;
    this.spec = new ContractSpec([
      // Contract specification entries
    ]);
  }

  async myFunction(
    { param1, param2 }: { param1: string; param2: u64 },
    options?: {
      fee?: string;
      timeoutInSeconds?: number;
    }
  ): Promise<AssembledTransaction<boolean>> {
    // Implementation
  }
}
```

### Contract Loading Hook

```typescript
// src/debug/hooks/useContracts.ts
const contractModules = import.meta.glob("../../contracts/*.ts");

type ContractModule = {
  default: Client;
  metadata?: ContractMetadata;
};

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const loadedContracts: Record<string, ContractModule> = {};
      
      for (const [path, importFn] of Object.entries(contractModules)) {
        const filename = path.split("/").pop()?.replace(".ts", "") || "";
        const module = (await importFn()) as ContractModule;
        const metadata = await loadContractMetadata(module.default.options.contractId);
        loadedContracts[filename] = { ...module, metadata };
      }
      
      return { loadedContracts };
    },
    staleTime: Infinity,
  });
}
```

---

## Contract Function Calls

### Transaction Building Process

Soroban requires explicit transaction building:

```typescript
// 1. Build Transaction Parameters
const txnParams: TransactionBuildParams = {
  source_account: userAddress,
  fee: BASE_FEE,
  seq_num: sequenceNumber,
  cond: {
    time: { min_time: "0", max_time: "0" }
  },
  memo: {}
};

// 2. Create Soroban Operation
const sorobanOperation = {
  operation_type: "invoke_contract_function",
  params: {
    contract_id: "CONTRACT_ID",
    function_name: "my_function",
    args: convertedArgs // ScVal format
  }
};

// 3. Convert Arguments to ScVal
const convertedArgs = getScValsFromArgs({
  param1: { value: "test", type: "string" },
  param2: { value: "123", type: "u64" }
});
```

### Argument Conversion

Soroban requires converting JavaScript values to ScVal format:

```typescript
// Primitive types
const stringArg = nativeToScVal("hello", { type: "string" });
const numberArg = nativeToScVal("123", { type: "u64" });
const boolArg = nativeToScVal(true, { type: "bool" });
const addressArg = nativeToScVal("GXXXXXX...", { type: "address" });

// Complex types
const objectArg = nativeToScVal({
  field1: "value1",
  field2: "value2"
}, {
  type: {
    field1: ["symbol", "string"],
    field2: ["symbol", "string"]
  }
});

// Arrays
const arrayArg = nativeToScVal(["item1", "item2"], { type: "string" });
```

---

## Transaction Flow

### Complete Transaction Lifecycle

```typescript
// 1. Simulate Transaction
const simulateResult = await rpcServer.simulateTransaction(transaction);

if (simulateResult.error) {
  throw new Error(`Simulation failed: ${simulateResult.error}`);
}

// 2. Prepare Transaction (add auth and footprint)
const preparedTx = await rpcServer.prepareTransaction(
  transaction,
  networkPassphrase
);

// 3. Sign Transaction
const signedTxXdr = await wallet.signTransaction(preparedTx.toXDR(), {
  address: userAddress,
  networkPassphrase: networkPassphrase
});

// 4. Submit Transaction
const submitResult = await rpcServer.sendTransaction(signedTxXdr);

// 5. Wait for Confirmation
if (submitResult.status === "PENDING") {
  const confirmedTx = await rpcServer.getTransaction(submitResult.hash);
  // Handle result
}
```

### Read vs Write Operations

```typescript
// Read-only operations (don't change state)
const readResult = await client.getValue(); // No signing required
const simulatedResult = await client.simulate.getValue();

// Write operations (change state)
const writeTx = await client.setValue({ newValue: "123" });
const signedTx = await wallet.signTransaction(writeTx.toXDR());
const result = await client.submit(signedTx);
```

---

## Required Dependencies

### Core Stellar SDK

```typescript
import {
  Address,
  Contract,
  Operation,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Server as RpcServer
} from "@stellar/stellar-sdk";
```

### Wallet Integration

```typescript
import {
  StellarWalletsKit,
  WalletNetwork,
  sep43Modules
} from "@creit.tech/stellar-wallets-kit";
```

### XDR Handling

```typescript
import { xdr } from "@stellar/stellar-sdk";
import "@stellar/stellar-xdr-json"; // For XDR to JSON conversion
```

---

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await contractClient.myFunction(params);
  
  if (result.isSuccess()) {
    // Handle success
    const returnValue = result.result;
  } else {
    // Handle contract execution failure
    console.error("Contract execution failed:", result.error);
  }
} catch (simulationError) {
  // Handle simulation/network errors
  console.error("Transaction simulation failed:", simulationError);
} catch (signingError) {
  // Handle wallet signing errors
  console.error("Transaction signing failed:", signingError);
}
```

### 2. Gas and Fee Management

```typescript
// Always set appropriate fees
const transaction = await client.myFunction(params, {
  fee: "1000000", // 0.1 XLM in stroops
  timeoutInSeconds: 30
});

// Check simulation cost
const simulation = await rpcServer.simulateTransaction(transaction);
const estimatedFee = simulation.minResourceFee;
```

### 3. State Management

```typescript
// Use React Query for contract state
const { data: contractValue, refetch } = useQuery({
  queryKey: ['contract', 'getValue', contractId],
  queryFn: () => contractClient.getValue(),
  refetchInterval: 5000 // Refresh every 5 seconds
});

// Invalidate cache after mutations
const mutation = useMutation({
  mutationFn: (newValue) => contractClient.setValue({ value: newValue }),
  onSuccess: () => {
    queryClient.invalidateQueries(['contract', 'getValue']);
  }
});
```

### 4. Type Safety

```typescript
// Use generated types
import type { u64, Address } from "./generated-types";

interface ContractParams {
  amount: u64;
  recipient: Address;
}

const callContract = async (params: ContractParams) => {
  // TypeScript ensures correct parameter types
  return await contractClient.transfer(params);
};
```

---

## Example Implementation

### Complete Contract Interaction

```typescript
// ContractInteraction.tsx
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';

const ContractInteraction: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const { contractClient } = useContract('guess-the-number');
  const [guess, setGuess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGuess = async () => {
    if (!contractClient || !address || !signTransaction) return;

    setIsLoading(true);
    try {
      // 1. Build transaction
      const transaction = await contractClient.guess({
        a_number: parseInt(guess),
        guesser: address
      }, {
        fee: "1000000",
        timeoutInSeconds: 30
      });

      // 2. Simulate to check if it will succeed
      const simulation = await transaction.simulate();
      
      if (!simulation.isSuccess()) {
        throw new Error(`Simulation failed: ${simulation.error}`);
      }

      // 3. Sign transaction
      const signedTx = await signTransaction(transaction.toXDR(), {
        address,
        networkPassphrase: Networks.TESTNET
      });

      // 4. Submit transaction
      const result = await transaction.submit(signedTx);
      
      if (result.isSuccess()) {
        const guessedCorrectly = result.result;
        alert(guessedCorrectly ? 'Correct! You won!' : 'Wrong guess!');
      }

    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Guess the Number</h2>
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess (1-10)"
        min="1"
        max="10"
      />
      <button 
        onClick={handleGuess}
        disabled={!address || isLoading || !guess}
      >
        {isLoading ? 'Processing...' : 'Submit Guess'}
      </button>
    </div>
  );
};

export default ContractInteraction;
```

---

## Contract Development Workflow

### 1. Write Rust Contract

```rust
// contracts/my-contract/src/lib.rs
#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn my_function(env: &Env, param: u64) -> bool {
        // Contract logic
        true
    }
}
```

### 2. Build and Deploy

```bash
# Build contract
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/my_contract.wasm \
  --source SXXXXX \
  --network testnet
```

### 3. Generate TypeScript Client

```bash
# Generate client bindings
stellar contract bindings typescript \
  --contract-id CXXXXX \
  --output-dir ./src/contracts \
  --network testnet
```

### 4. Integrate in Frontend

```typescript
// Import generated client
import Client from './src/contracts/my-contract';

// Use in React component
const client = new Client({
  contractId: 'CXXXXX',
  networkPassphrase: Networks.TESTNET,
  rpcUrl: 'https://soroban-testnet.stellar.org'
});
```

---

This documentation provides a comprehensive guide to integrating Soroban smart contracts with frontend applications, highlighting the key differences from EVM-based development and providing practical examples for implementation.