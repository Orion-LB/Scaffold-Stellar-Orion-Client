# Comprehensive Project Brief for AI Development

## Project Overview
You are building a DeFi lending and staking platform on Soroban (Stellar blockchain) that enables users to stake Real World Assets (RWA), use the staked tokens as collateral for borrowing, and automatically repay loans using earned yield. The platform features automated keeper bots for price updates, auto-repayment, and liquidations.

---

## Phase 1: Design System Analysis & Extraction

### Task 1.1: Analyze Existing Landing Page
**Objective:** Thoroughly examine the existing landing page to extract and document its complete design system.

**What to Extract:**
1. **Color Palette**
   - Primary, secondary, and accent colors (hex values)
   - Background colors and gradients
   - Text colors (headings, body, muted)
   - Border and divider colors
   - Hover and active states

2. **Typography System**
   - Font families used
   - Heading hierarchy (H1-H6 sizes, weights, line heights)
   - Body text specifications
   - Button text styling
   - Special text treatments (gradients, shadows)

3. **Spacing & Layout**
   - Padding and margin patterns
   - Grid system and breakpoints
   - Container widths and max-widths
   - Component spacing consistency

4. **Visual Effects & Atmosphere**
   - Card shadows and depth layers
   - Border radius patterns
   - Glassmorphism or backdrop blur effects
   - Gradient applications
   - Animation styles (hover effects, transitions)
   - Loading states and micro-interactions

5. **Component Patterns**
   - Button styles (primary, secondary, ghost)
   - Input field designs
   - Card/modal aesthetics
   - Navigation elements
   - Icon usage and style

6. **Professional Polish Elements**
   - Visual hierarchy techniques
   - White space usage
   - Consistency patterns
   - Accessibility considerations

**Deliverable:** Create a comprehensive design tokens document that captures every visual element for consistent application across the dashboard.

---

## Phase 2: Dashboard Architecture Planning

### Task 2.1: Create Dashboard Design Plan
**Objective:** Design a cohesive dashboard that seamlessly extends the landing page's visual language.

**Dashboard Structure:**

**Layout Requirements:**
1. **Sidebar Navigation** (Fixed/Collapsible)
   - Navigation items: Stake, Borrow, Profile
   - Active state indicators
   - Responsive behavior for mobile
   - Consistent with landing page aesthetics

2. **Main Content Area**
   - Dynamic content switching based on sidebar selection
   - Consistent padding and spacing
   - Smooth transitions between sections

3. **Top Header** (if applicable)
   - Wallet connection status
   - User address display (truncated)
   - Network indicator
   - Theme consistency with landing page

**Design Considerations:**
- Apply extracted color palette throughout
- Maintain typography hierarchy from landing page
- Use same shadow/elevation system for cards
- Preserve animation and interaction patterns
- Ensure mobile responsiveness matches landing page quality

---

## Phase 3: Feature Implementation Specifications

### Section 3.1: Stake Interface

**Visual Design:**
- Static rectangular modal/card (Uniswap-style)
- Should feel like a natural extension of landing page cards
- Same border-radius, shadows, and glassmorphism effects

**Component Structure:**
```
StakeCard Component:
├── Header Section
│   └── "Stake RWA Assets" title
├── Vault Selection Dropdown
│   ├── Display: Available vaults (alexVault, ethVault, etc.)
│   └── Dynamic loading from contracts
├── Deposit Amount Input
│   ├── Label: "Amount to Stake"
│   ├── Input field for alexRWA amount
│   ├── Max button (stake all available)
│   └── Balance display
├── Receive Preview Section
│   ├── Label: "You Will Receive"
│   └── Auto-calculated OrionalexRWA amount
├── Action Buttons Row
│   ├── "Get Mock RWA" button (top-right corner)
│   └── "Stake" button (primary CTA)
└── Unstake Toggle/Tab
    ├── Input for OrionalexRWA to burn
    ├── Preview of alexRWA to receive
    └── "Unstake" button
```

**Functional Requirements:**
- Real-time balance fetching from wallet
- Input validation (sufficient balance, positive numbers)
- Dynamic preview calculation
- Wallet transaction prompts
- Success/error toast notifications
- Loading states during transactions

**Contract Interactions:**
- Fetch available vaults from `RWA_Vault_A`
- Check user balance of `MockRWA_A`
- Calculate exchange rate for `stRWA_A`
- Execute stake transaction
- Execute unstake transaction (burn `stRWA_A`)
- Mint mock RWA for testing

---

### Section 3.2: Borrow Interface

**Visual Design:**
- Similar card structure to Stake interface
- Consistent spacing and styling
- Clear visual hierarchy for complex information

**Component Structure:**
```
BorrowCard Component:
├── Header Section
│   └── "Borrow Assets" title
├── Borrow Asset Selection
│   ├── Dropdown: USDC, XLM
│   └── Asset icons and labels
├── Borrow Amount Input
│   ├── Input field
│   ├── Max safe borrow button
│   └── USD equivalent display
├── Collateral Selection Section
│   ├── Available collateral display
│   ├── Multi-select collateral tokens
│   ├── Amount allocation per collateral
│   └── Total collateral value
├── Loan Health Metrics
│   ├── LTV (Loan-to-Value) percentage
│   ├── Health Factor (color-coded)
│   ├── Liquidation threshold warning
│   └── Interest rate display
└── "Borrow" Button (primary CTA)
    └── Triggers Auto-Repay Modal
```

**Auto-Repay Modal (Triggered on Borrow Click):**
```
AutoRepayModal Component:
├── Modal Header
│   └── "Enable Auto-Repay?" title
├── Explanation Section
│   ├── How yield automatically repays interest
│   ├── Calculation methodology
│   └── Visual diagram/illustration
├── Toggle Switch
│   ├── "Enable Auto-Repay" label
│   └── Default: OFF
├── Action Buttons
│   ├── "Skip for Now" (proceed without auto-repay)
│   └── "Enable & Borrow" (confirm both actions)
└── Terms acknowledgment checkbox
```

**Functional Requirements:**
- Fetch user's collateral token balances
- Calculate maximum safe borrow amount (based on LTV)
- Real-time health factor calculation
- Dynamic interest rate display
- Multi-collateral selection logic
- Price feed integration from `MockOracle`
- Auto-repay preference storage
- Transaction execution for borrow + optional auto-repay setup

**Contract Interactions:**
- Fetch collateral balance (`stRWA_A` holdings)
- Get asset prices from `MockOracle`
- Calculate borrowing power
- Execute `supply_collateral()` on `LendingPool`
- Execute `borrow()` on `LendingPool`
- Enable/disable auto-repay flag

---

### Section 3.3: Profile Interface

**Visual Design:**
- Dashboard-style layout with multiple information cards
- Data visualization for portfolio overview
- Transaction history table

**Component Structure:**
```
ProfileSection Component:
├── Portfolio Overview Card
│   ├── Total Portfolio Value (USD)
│   ├── Asset Breakdown (pie/bar chart)
│   └── Net APY display
├── Wallet Balances Card
│   ├── alexRWA balance
│   ├── OrionalexRWA balance
│   ├── Borrowed assets (USDC, XLM)
│   └── Native balance (XLM)
├── Active Loans Card
│   ├── List of active loans
│   ├── Per-loan details:
│   │   ├── Borrowed amount
│   │   ├── Collateral locked
│   │   ├── Interest owed
│   │   ├── Health Factor (with risk meter)
│   │   └── Auto-Repay status toggle
│   └── Total debt summary
├── Yield Earnings Card
│   ├── Total yield earned
│   ├── Current claimable yield
│   ├── Yield used for auto-repay
│   └── Historical yield chart
├── Risk Management Card
│   ├── Overall LTV percentage
│   ├── Risk meter (visual gauge)
│   ├── Liquidation warnings (if applicable)
│   └── Recommended actions
└── Transaction History Table
    ├── Filterable by type (Stake/Unstake/Borrow/Repay)
    ├── Date, Action, Amount, Status
    └── Transaction hash links
```

**Auto-Repay Toggle Behavior (Per Loan):**

**When Turning ON:**
```
EnableAutoRepayModal:
├── Explanation of mechanism
├── Current loan details
├── Available yield for repayment
├── Projected repayment timeline
├── Confirmation button
└── Wallet signature prompt
```

**When Turning OFF:**
```
DisableAutoRepayModal:
├── Summary of auto-repay activity
│   ├── Total yield earned
│   ├── Amount used for repayment
│   ├── Remaining loan balance
│   └── Interest saved
├── Confirmation warning
└── Disable button
```

**Functional Requirements:**
- Real-time data fetching for all user positions
- Dynamic health factor updates (from Oracle price changes)
- Transaction history pagination
- Per-loan auto-repay management
- Data refresh mechanisms
- Export transaction history option

**Contract Interactions:**
- Fetch all user balances (multiple tokens)
- Query active loans from `LendingPool`
- Get `claimable_yield()` from `RWA_Vault_A`
- Fetch `interest_owed` for each loan
- Calculate health factors with live prices
- Toggle auto-repay settings
- Query transaction events from contracts

---

## Phase 4: Smart Contract Integration Architecture

### Task 4.1: Service Layer Structure

**Critical Requirement:** All smart contract interactions MUST be centralized in a dedicated service layer. UI components should NEVER directly call contract functions.

**Directory Structure:**
```
src/
├── services/
│   ├── contracts/
│   │   ├── ContractService.ts          # Base contract interaction class
│   │   ├── MockRWAService.ts           # MockRWA_A interactions
│   │   ├── StakedRWAService.ts         # stRWA_A interactions
│   │   ├── VaultService.ts             # RWA_Vault_A interactions
│   │   ├── OracleService.ts            # MockOracle interactions
│   │   ├── LendingPoolService.ts       # LendingPool interactions
│   │   └── index.ts                    # Exports all services
│   ├── wallet/
│   │   └── WalletService.ts            # Wallet connection logic
│   └── utils/
│       ├── formatters.ts               # Number/address formatting
│       └── calculations.ts             # Health factor, LTV calculations
├── components/
│   ├── Stake/
│   ├── Borrow/
│   ├── Profile/
│   └── shared/
└── hooks/
    ├── useWallet.ts
    ├── useStaking.ts
    ├── useBorrowing.ts
    └── useProfile.ts
```

---

### Task 4.2: Contract Service Implementation Specifications

**Base Contract Service Pattern:**
```typescript
// ContractService.ts
export abstract class ContractService {
  protected contractAddress: string;
  protected contract: Contract;
  
  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
    // Initialize contract instance
  }
  
  protected async invokeContract(
    method: string,
    params: any[],
    wallet: WalletProvider
  ): Promise<TransactionResult> {
    // Common transaction invocation logic
    // Error handling
    // Loading states
    // Transaction simulation
  }
  
  protected async queryContract(
    method: string,
    params: any[]
  ): Promise<any> {
    // Common read-only query logic
  }
}
```

**Required Service Methods:**

**VaultService.ts:**
```typescript
class VaultService extends ContractService {
  // Queries (Read-Only)
  async getAvailableVaults(): Promise<Vault[]>
  async getUserStakedBalance(userAddress: string): Promise<bigint>
  async getClaimableYield(userAddress: string): Promise<bigint>
  async getExchangeRate(): Promise<number>
  async getTotalStaked(): Promise<bigint>
  
  // Transactions (Write)
  async stake(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  async unstake(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  
  // Admin (for demo/testing)
  async fundYield(amount: bigint, wallet: WalletProvider): Promise<TxResult>
}
```

**LendingPoolService.ts:**
```typescript
class LendingPoolService extends ContractService {
  // Queries
  async getUserCollateral(userAddress: string): Promise<bigint>
  async getUserBorrowBalance(userAddress: string): Promise<bigint>
  async getUserInterestOwed(userAddress: string): Promise<bigint>
  async getHealthFactor(userAddress: string): Promise<number>
  async getInterestRate(): Promise<number>
  async getAvailableLiquidity(asset: string): Promise<bigint>
  
  // Transactions
  async supplyCollateral(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  async withdrawCollateral(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  async borrow(userAddress: string, asset: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  async repay(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  
  // Auto-repay management
  async enableAutoRepay(userAddress: string, wallet: WalletProvider): Promise<TxResult>
  async disableAutoRepay(userAddress: string, wallet: WalletProvider): Promise<TxResult>
  
  // Public keeper functions (for demonstration/manual trigger)
  async triggerAutoRepay(userAddress: string, wallet: WalletProvider): Promise<TxResult>
  async triggerLiquidation(userAddress: string, wallet: WalletProvider): Promise<TxResult>
}
```

**OracleService.ts:**
```typescript
class OracleService extends ContractService {
  // Queries
  async getPrice(assetAddress: string): Promise<bigint>
  async getLastUpdateTime(assetAddress: string): Promise<Date>
  
  // Transactions (bot-only, but exposed for admin testing)
  async submitPrice(assetAddress: string, price: bigint, wallet: WalletProvider): Promise<TxResult>
}
```

**MockRWAService.ts:**
```typescript
class MockRWAService extends ContractService {
  // Queries
  async getUserBalance(userAddress: string): Promise<bigint>
  async isWhitelisted(userAddress: string): Promise<boolean>
  async getTotalSupply(): Promise<bigint>
  
  // Transactions
  async transfer(to: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  async approve(spender: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  
  // Testing/Demo
  async mintMockRWA(userAddress: string, amount: bigint, wallet: WalletProvider): Promise<TxResult>
  
  // Admin
  async addToWhitelist(address: string, wallet: WalletProvider): Promise<TxResult>
}
```

---

### Task 4.3: Component Integration Patterns

**Best Practice Requirements:**

1. **Custom Hooks Layer:**
   - Components should use custom hooks
   - Hooks call service layer methods
   - Hooks manage loading/error states
   - Hooks cache and refresh data

2. **Example Hook Pattern:**
```typescript
// useStaking.ts
export function useStaking() {
  const [stakedBalance, setStakedBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { wallet, address } = useWallet();
  
  const vaultService = new VaultService(VAULT_CONTRACT_ADDRESS);
  
  const fetchStakedBalance = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const balance = await vaultService.getUserStakedBalance(address);
      setStakedBalance(balance);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [address]);
  
  const stake = useCallback(async (amount: bigint) => {
    if (!wallet || !address) throw new Error("Wallet not connected");
    return await vaultService.stake(address, amount, wallet);
  }, [wallet, address]);
  
  return { stakedBalance, loading, error, stake, fetchStakedBalance };
}
```

3. **Component Usage Example:**
```typescript
// StakeCard.tsx
export function StakeCard() {
  const { stakedBalance, stake, loading } = useStaking();
  const [amount, setAmount] = useState("");
  
  const handleStake = async () => {
    try {
      await stake(parseUnits(amount));
      toast.success("Staked successfully!");
    } catch (error) {
      toast.error("Stake failed");
    }
  };
  
  return (
    <Card>
      {/* UI elements using state and handlers */}
    </Card>
  );
}
```

---

## Phase 5: Automated Bot Integration (Frontend Considerations)

### Task 5.1: Real-Time Data Updates

**Requirements:**
- Implement polling or WebSocket listeners for contract events
- Update UI when keeper bots execute actions
- Display live price updates from Oracle bot

**Price Oracle Updates:**
- Fetch price every 10-15 seconds from `MockOracle`
- Update health factors in real-time across all components
- Show price change indicators (↑↓)

**Auto-Repay Notifications:**
- Listen for `YieldFunded` events
- Show toast notification when auto-repay executes
- Update interest owed balances automatically

**Liquidation Warnings:**
- Monitor health factor continuously
- Display progressive warning alerts:
  - Warning (HF < 1.2): Yellow banner
  - Danger (HF < 1.1): Orange banner with sound
  - Critical (HF < 1.05): Red banner with urgent message
- Show notification when liquidation occurs

---

## Phase 6: Development Best Practices

### Code Quality Requirements:

1. **Modularity:**
   - One component per file
   - One service per contract
   - Reusable UI components in `/shared`
   - Clear separation of concerns

2. **Type Safety:**
   - TypeScript strict mode enabled
   - Proper interfaces for all contract responses
   - Type-safe service method signatures
   - No `any` types except in edge cases

3. **Error Handling:**
   - Try-catch blocks in all service methods
   - User-friendly error messages
   - Proper error logging
   - Graceful degradation

4. **Performance:**
   - Memoization for expensive calculations
   - Debounced input handlers
   - Lazy loading for modals
   - Optimistic UI updates where appropriate

5. **Code Style:**
   - Consistent naming conventions
   - Descriptive variable/function names
   - Comments for complex logic
   - ESLint and Prettier configured

6. **Testing Considerations:**
   - Service methods should be testable
   - Mock contract responses for testing
   - Component unit tests for critical flows

---



## Success Criteria Checklist:

- [ ] Dashboard perfectly matches landing page aesthetic
- [ ] All contract interactions go through service layer
- [ ] No direct contract calls in components
- [ ] Stake flow works with mock RWA minting
- [ ] Borrow flow calculates health factors correctly
- [ ] Auto-repay modal triggers and functions properly
- [ ] Profile shows accurate, live data
- [ ] Real-time price updates reflect in UI
- [ ] Liquidation warnings appear at correct thresholds
- [ ] Code is modular, typed, and follows best practices
- [ ] All wallet transactions have proper loading states
- [ ] Error handling provides useful feedback
- [ ] Mobile responsive across all sections

---

## Final Notes:

This is a hackathon demo, but build it with production-quality architecture. The automated bots running in the background will make this feel like a real, living protocol. The key "wow" factors are:

1. **Live price updates** showing dynamic health factors
2. **Automated yield-based loan repayment** happening without user action
3. **Automatic liquidations** triggered by bots when health drops

Keep the UI clean, professional, and consistent with the landing page. Make every interaction feel smooth and trustworthy. The combination of beautiful design and real automation will make this project stand out.