# 🔧 Admin Panel Guide

## Overview

The Orion Admin Panel is a comprehensive administrative interface for managing the multi-asset RWA platform. Access it at `/admin` (no button in UI - direct URL access only).

**Route:** `/admin`
**Access:** Direct URL navigation only (upcoming feature)

---

## Features

### 1. System Overview (Dashboard)

**Purpose:** Monitor overall platform health and status

**Features:**
- **System Statistics:**
  - Total Contracts: 12 (9 deployed + 3 shared)
  - Active Users: Whitelisted addresses count
  - TVL: Total Value Locked across all vaults
  - System Health: Overall operational status

- **Deployment Status:**
  - Real-time contract deployment tracking
  - Address display for deployed contracts
  - Pending deployment indicators

- **Bot Status:**
  - Live status of all 3 bots (Oracle, Liquidation, Auto-Repay)
  - Last update timestamps
  - Quick action buttons (Restart, View Logs)

---

### 2. Contract Deployment

**Purpose:** Deploy the 9 multi-asset contracts

**Contracts to Deploy:**

**RWA Tokens (3):**
1. Invoice RWA Token (`rwa_token.wasm`)
2. T-Bills RWA Token (`rwa_token.wasm`)
3. Real Estate RWA Token (`rwa_token.wasm`)

**stRWA Tokens (3):**
4. Invoice stRWA Token (`strwa_token.wasm`)
5. T-Bills stRWA Token (`strwa_token.wasm`)
6. Real Estate stRWA Token (`strwa_token.wasm`)

**Vaults (3):**
7. Invoice Vault (`vault.wasm`)
8. T-Bills Vault (`vault.wasm`)
9. Real Estate Vault (`vault.wasm`)

**Workflow:**
1. Deploy all RWA tokens first
2. Deploy corresponding stRWA tokens
3. Deploy Vault contracts
4. Copy and save all contract addresses

**UI Features:**
- Individual "Deploy" button per contract
- "Deploy All" button for bulk deployment
- Progress bar showing deployment status (X/9 contracts)
- Automatic address display after deployment
- Copy-to-clipboard functionality for addresses
- Deployment instructions panel

---

### 3. Contract Initialization

**Purpose:** Initialize vaults with token pairs and configuration

**Initialization Parameters:**
- **Admin Address:** Wallet with administrative privileges
- **RWA Token:** Associated RWA token contract
- **stRWA Token:** Associated platform staking token
- **USDC Token:** Shared USDC contract
- **Lending Pool:** Shared lending pool contract

**Workflow:**
1. Ensure RWA + stRWA tokens are deployed
2. Ensure Vault contract is deployed
3. Click "Initialize" on each vault
4. System automatically configures token pairs

**UI Features:**
- Visual status indicators (Awaiting/Ready/Initialized)
- Progress bar (X/3 vaults initialized)
- Configuration details display
- Prerequisites checklist

---

### 4. Funding Management

**Purpose:** Fund lending pool and vaults with USDC

**Two Funding Types:**

#### A. Fund Lending Pool
- **Purpose:** Add liquidity for loan origination
- **Target:** Lending Pool contract
- **Current Balance:** Displayed
- **Required Balance:** Target shown
- **Input:** Amount in USDC

#### B. Fund Vault Yield
- **Purpose:** Add USDC for staking rewards
- **Vault Selection:** Dropdown (Invoice/T-Bills/Real Estate)
- **Input:** Yield amount in USDC
- **Distribution:** Auto-distributed to stakers

**UI Features:**
- Funding overview cards showing progress bars
- Current vs Target balance displays
- Transaction history log
- Quick-select vault dropdown

**Workflow:**
1. Select funding target (pool or vault)
2. Enter USDC amount
3. Click "Fund" button
4. Transaction confirmation

---

### 5. Oracle Management

**Purpose:** Set and monitor RWA asset prices

**Price Management:**
- **Assets Monitored:** 3 asset types
  - Invoice RWA ($1.05)
  - T-Bills Vault ($1.02)
  - Real Estate ($1.08)

**Features:**
- **Individual Price Update:**
  - Manual price input per asset
  - "Update Price" button per asset
  - Expected yield display

- **Bulk Update:**
  - "Update All Prices" button
  - Updates all 3 assets sequentially

- **Oracle Status Dashboard:**
  - Oracle Active indicator
  - Update interval (60 seconds)
  - Total updates count

- **Price History:**
  - Recent price updates log
  - Price change percentages
  - Timestamp display

**Bot Integration:**
- Manual updates override bot for 5 minutes
- Automatic bot updates resume after override expires
- Bot configuration display

---

### 6. User Management

**Purpose:** Whitelist users and manage access

**Features:**

#### Whitelist New User
- **Input:** Stellar address (GCDNZ...)
- **Action:** Add user to whitelist
- **Effect:** User can mint RWA tokens and stake

#### Whitelisted Users Table
- **Columns:**
  - Address (with user icon)
  - Added Date
  - Total Staked (USDC value)
  - Active Loans count
  - Action (Remove button)

- **Search:** Filter by address
- **Remove:** Revoke user access

#### Statistics Dashboard
- Total Users count
- Active Users count
- Total Staked across all users
- Active Loans count

**Workflow:**
1. Enter Stellar address in input field
2. Click "Whitelist User"
3. User appears in table immediately
4. User can now mint RWA tokens

---

### 7. Bot Monitoring

**Purpose:** Monitor and control automated platform bots

**Three Bots:**

#### A. Oracle Price Bot
- **Icon:** 📈 TrendingUp (Blue)
- **Function:** Updates RWA asset prices every 60 seconds
- **Config:**
  - Interval: 60 seconds
  - Assets: 3 assets monitored
  - Last Price: Current price display

#### B. Liquidation Bot
- **Icon:** 🛡️ Shield (Red)
- **Function:** Monitors loan health and triggers liquidations
- **Config:**
  - Interval: 30 seconds
  - Threshold: Health < 1.10
  - Monitored: Active loans count

#### C. Auto-Repay Bot
- **Icon:** ⚡ Zap (Green)
- **Function:** Automatically repays loans using vault yields
- **Config:**
  - Interval: 120 seconds
  - Vaults: 3 vaults monitored
  - Repayments: Daily count

**Bot Controls:**
- **Start/Stop:** Toggle bot status
- **Restart:** Restart individual bot
- **Restart All:** Restart all bots at once

**Monitoring:**
- **Uptime:** Time since last restart
- **Last Update:** Seconds since last action
- **Total Updates:** Lifetime update count
- **Status Indicator:** Green pulse for running, gray for stopped

**Activity Log:**
- Real-time bot activity feed
- Timestamped actions
- Color-coded by bot type
- Scrollable log viewer

**Environment Info:**
- Network: Stellar Testnet
- Node Version: v18.17.0
- Server: AWS EC2 (us-east-1)
- Log Path: /var/log/orion-bots/

---

## Design System

### Colors
- **Primary:** #774be5 (Purple)
- **Success:** #10b981 (Green)
- **Warning:** #f59e0b (Amber)
- **Danger:** #ef4444 (Red)
- **Info:** #3b82f6 (Blue)
- **Text:** #111827 (Dark)
- **Borders:** #e5e7eb (Fade black)

### Typography
- **Body Font:** Plus Jakarta Sans
- **Number Font:** Antic
- **Mono Font:** Monospace (for addresses)

### Components
- **Buttons:** Rounded-lg, shadow-sm
- **Cards:** Border-gray-200, rounded-xl
- **Inputs:** Focus ring primary
- **Status Badges:** Rounded pills with icons

---

## Navigation

**Sidebar Menu:**
1. Overview (Default)
2. Deploy Contracts
3. Initialize
4. Funding
5. Oracle
6. Users
7. Bots

**Quick Stats Panel:**
- Contracts: 9/9
- Bots: 3/3
- Oracle: Active

---

## Recommended Workflow

### Initial Platform Setup

1. **Deploy Contracts** (Section 2)
   - Deploy all 9 contracts
   - Save all addresses

2. **Initialize Vaults** (Section 3)
   - Initialize all 3 vaults with token pairs
   - Verify configuration

3. **Fund System** (Section 4)
   - Fund Lending Pool with USDC
   - Fund each vault with yield USDC

4. **Configure Oracle** (Section 5)
   - Set initial prices for all assets
   - Verify bot is running

5. **Whitelist Users** (Section 6)
   - Add initial user addresses
   - Verify whitelist status

6. **Monitor Bots** (Section 7)
   - Ensure all bots are running
   - Check activity logs

### Daily Operations

1. **Check System Overview**
   - Verify all systems operational
   - Check TVL and user count

2. **Monitor Oracle Prices**
   - Review price updates
   - Adjust if needed

3. **Review User Activity**
   - Check new staking activity
   - Monitor loan health

4. **Bot Health Check**
   - Verify all bots running
   - Review activity logs
   - Restart if needed

---

## Backend Integration

### Contract Methods Required

**RWA Token:**
```rust
mint_rwa_tokens(to: Address, amount: i128)
allow_user(user: Address)
```

**Vault:**
```rust
initialize(admin, rwa_token, strwa_token, usdc, lending_pool)
fund_yield(amount: i128)
```

**Lending Pool:**
```rust
// Fund pool (transfer USDC)
```

**Oracle:**
```rust
set_price(asset: Address, price: i128, timestamp: u64)
```

### Bot APIs

**Oracle Bot:**
- Status endpoint: `GET /status`
- Restart: `POST /restart`

**Liquidation Bot:**
- Status endpoint: `GET /status`
- Restart: `POST /restart`

**Auto-Repay Bot:**
- Status endpoint: `GET /status`
- Restart: `POST /restart`

---

## Security Considerations

### Admin Access
- No authentication currently (upcoming feature)
- Direct URL access only
- Consider adding:
  - Wallet-based authentication
  - Admin role verification
  - Action logging

### Transaction Safety
- All contract calls require signature
- Confirm before bulk operations
- Display transaction previews

### User Management
- Review user activity before whitelisting
- Monitor for suspicious patterns
- Have removal capability ready

---

## Troubleshooting

### Deployment Issues
- **Error:** "Deployment failed"
- **Solution:** Check XLM balance for fees, verify WASM file

### Initialization Issues
- **Error:** "Cannot initialize vault"
- **Solution:** Ensure RWA + stRWA deployed first

### Funding Issues
- **Error:** "Insufficient balance"
- **Solution:** Check admin USDC balance

### Oracle Issues
- **Error:** "Price update failed"
- **Solution:** Verify oracle contract address, check bot status

### Bot Issues
- **Error:** "Bot not responding"
- **Solution:** Check server status, review logs, restart bot

---

## Future Enhancements

### Planned Features
- [ ] Admin authentication (wallet-based)
- [ ] Role-based access control
- [ ] Contract upgrade management
- [ ] Advanced analytics dashboard
- [ ] Transaction history export
- [ ] Email notifications for alerts
- [ ] Multi-signature operations
- [ ] Automated deployment scripts

### UI Improvements
- [ ] Dark mode support
- [ ] Mobile responsive design
- [ ] Real-time WebSocket updates
- [ ] Chart visualizations
- [ ] Advanced filtering/sorting

---

## Testing Checklist

### Before Production

- [ ] Deploy all 9 contracts successfully
- [ ] Initialize all 3 vaults
- [ ] Fund lending pool with test USDC
- [ ] Fund vaults with yield USDC
- [ ] Set oracle prices for all assets
- [ ] Whitelist test users
- [ ] Verify all bots running
- [ ] Test complete user flow (mint → stake → borrow)
- [ ] Verify liquidation bot triggers correctly
- [ ] Confirm auto-repay works

---

## Support

For admin panel issues:
- Check browser console for errors
- Verify wallet connection
- Review transaction signatures
- Check Stellar explorer for contract status
- Review bot logs for automation issues

---

**Status:** Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-01-10
