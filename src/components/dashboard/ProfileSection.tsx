import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  TrendingUp,
  Shield,
  DollarSign,
  Wallet,
  Download,
  AlertTriangle,
  FileText,
  Vault
} from "lucide-react";
import { useContractServices } from "@/hooks/useContractServices";
import { SimulationService } from "@/services/localStorage/SimulationService";
import toast from "@/lib/toast";
import { AssetType, getAllAssetTypes, getAssetConfig, createMockRWAServiceFromAddress, createStRWAServiceFromAddress, createVaultServiceFromAddress } from "@/services/contracts";
import { getProfile, simulateClaimYield, toggleAutoRepay, simulateAutoRepay } from "@/lib/localStorage";
import { ASSET_NAMES } from "@/config/contracts";

// Type for vault loan information
interface VaultLoanInfo {
  borrowedAmount: number;
  hasLoan: boolean;
}

const ProfileSection = () => {
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(true);

  // Auto-repay state per vault
  const [vaultAutoRepay, setVaultAutoRepay] = useState<Record<AssetType, boolean>>({
    'invoices': false,
    'tbills': false,
    'realestate': false,
  });

  // Multi-asset balances with mock data
  const [assetBalances, setAssetBalances] = useState<Record<AssetType, {
    rwaBalance: bigint;
    stRwaBalance: bigint;
    claimableYield: bigint;
    price: number; // USD price
  }>>({
    'invoices': {
      rwaBalance: 5000n * BigInt(10**18),
      stRwaBalance: 25000n * BigInt(10**18),
      claimableYield: 450n * BigInt(10**7),
      price: 1.05
    },
    'tbills': {
      rwaBalance: 3000n * BigInt(10**18),
      stRwaBalance: 15000n * BigInt(10**18),
      claimableYield: 280n * BigInt(10**7),
      price: 1.02
    },
    'realestate': {
      rwaBalance: 2000n * BigInt(10**18),
      stRwaBalance: 10000n * BigInt(10**18),
      claimableYield: 320n * BigInt(10**7),
      price: 1.08
    },
  });

  // Mock vault-specific loan data
  const [vaultLoans, setVaultLoans] = useState<Record<AssetType, VaultLoanInfo>>({
    'invoices': { borrowedAmount: 12000, hasLoan: true },
    'tbills': { borrowedAmount: 7500, hasLoan: true },
    'realestate': { borrowedAmount: 0, hasLoan: false },
  });

  const [usdcBalance, setUsdcBalance] = useState<bigint>(8500n * BigInt(10**7));
  const [activeLoan, setActiveLoan] = useState<any>(null);

  const {
    isConnected,
    address,
    wallet,
    usdcService,
    lendingPoolService,
  } = useContractServices();

  // Load data from localStorage AND contracts
  useEffect(() => {
    if (!isConnected || !address) return;

    // First load from localStorage for immediate UI update
    const profile = getProfile(address);
    setAssetBalances(profile.assetBalances);
    setVaultLoans(profile.vaultLoans);
    setUsdcBalance(profile.usdcBalance);
    setActiveLoan(profile.activeLoan);
    setVaultAutoRepay(profile.vaultAutoRepay);

    // Then load from contracts to get fresh data
    const loadContractData = async () => {
      try {
        // Create wallet provider for read operations
        const walletProvider = wallet.isConnected ? {
          address: wallet.address!,
          networkPassphrase: wallet.networkPassphrase,
          signTransaction: wallet.signTransaction,
        } : undefined;

        // Load USDC balance from contract
        const usdc = await usdcService.balance(address).catch(() => profile.usdcBalance);
        setUsdcBalance(usdc);

        // Load loan data from contract
        const loan = await lendingPoolService.get_loan(address).catch(() => null);
        if (loan) {
          setActiveLoan(loan);
        }

        // Load balances for each asset type from contracts
        for (const assetType of getAllAssetTypes()) {
          const config = getAssetConfig(assetType);

          const rwaService = createMockRWAServiceFromAddress(config.rwa, walletProvider);
          const stRwaService = createStRWAServiceFromAddress(config.stRwa, walletProvider);
          const vaultService = createVaultServiceFromAddress(config.vault, walletProvider);

          const [rwa, stRwa, yield_amount] = await Promise.all([
            rwaService.balance(address).catch(() => profile.assetBalances[assetType].rwaBalance),
            stRwaService.balance(address).catch(() => profile.assetBalances[assetType].stRwaBalance),
            vaultService.claimable_yield(address).catch(() => profile.assetBalances[assetType].claimableYield),
          ]);

          setAssetBalances(prev => ({
            ...prev,
            [assetType]: {
              ...prev[assetType],
              rwaBalance: rwa,
              stRwaBalance: stRwa,
              claimableYield: yield_amount,
            }
          }));
        }
      } catch (error) {
        console.error("Failed to load profile data from contracts:", error);
        // On error, continue using localStorage data
      }
    };

    // Load contract data immediately
    loadContractData();

    // Refresh contract data every 15 seconds
    const interval = setInterval(loadContractData, 15000);

    // Run auto-repay simulation periodically (if enabled)
    const autoRepayInterval = setInterval(() => {
      try {
        simulateAutoRepay(address);
        // Refresh local view after auto repay run
        const profileAfter = getProfile(address);
        setAssetBalances(profileAfter.assetBalances);
        setVaultLoans(profileAfter.vaultLoans);
        setUsdcBalance(profileAfter.usdcBalance);
        setVaultAutoRepay(profileAfter.vaultAutoRepay);
      } catch (err) {
        // ignore
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(autoRepayInterval);
    };
  }, [isConnected, address, wallet, usdcService, lendingPoolService]);

  // Helper functions
  const formatBalance = (balance: bigint, decimals: number = 18) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
  };

  const formatUSD = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate portfolio values
  const calculatePortfolioValues = () => {
    let totalStaked = 0;
    let totalAvailable = 0;

    getAllAssetTypes().forEach(assetType => {
      const data = assetBalances[assetType];
      const stRwaAmount = parseFloat(formatBalance(data.stRwaBalance));
      const rwaAmount = parseFloat(formatBalance(data.rwaBalance));

      totalStaked += stRwaAmount * data.price;
      totalAvailable += rwaAmount; // RWA at $1
    });

    const usdcValue = parseFloat(formatBalance(usdcBalance, 7));
    const totalValue = totalStaked + totalAvailable + usdcValue;

    return { totalStaked, totalAvailable, usdcValue, totalValue };
  };

  const { totalStaked, totalAvailable, usdcValue, totalValue } = calculatePortfolioValues();

  // Portfolio pie chart data
  const portfolioData = [
    { name: 'Staked (stRWA)', value: parseFloat(totalStaked.toFixed(2)), color: '#774be5' },
    { name: 'Available (RWA)', value: parseFloat(totalAvailable.toFixed(2)), color: '#10b981' },
    { name: 'Liquidity (USDC)', value: parseFloat(usdcValue.toFixed(2)), color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Calculate health factor
  const calculateHealthFactor = () => {
    if (!activeLoan || !activeLoan.collaterals || activeLoan.collaterals.length === 0) return 0;

    let totalCollateralValue = 0;

    activeLoan.collaterals.forEach((col: any) => {
      // Find which asset this collateral belongs to
      const assetType = getAllAssetTypes().find(type => {
        const config = getAssetConfig(type);
        return config.stRwa === col.token_address;
      });

      if (assetType) {
        const data = assetBalances[assetType];
        const collateralAmount = parseFloat(formatBalance(col.amount));
        totalCollateralValue += collateralAmount * data.price;
      }
    });

    const debtValue = parseFloat(formatBalance(activeLoan.outstanding_debt || 0n, 7));
    if (debtValue === 0) return 0;

    return totalCollateralValue / debtValue;
  };

  const healthFactor = calculateHealthFactor();
  const totalDebt = activeLoan ? parseFloat(formatBalance(activeLoan.outstanding_debt || 0n, 7)) : 0;

  // Performance graph data (mock for now)
  const performanceData = [
    { month: 'Jan', value: totalValue * 0.85 },
    { month: 'Feb', value: totalValue * 0.90 },
    { month: 'Mar', value: totalValue * 0.93 },
    { month: 'Apr', value: totalValue * 0.97 },
    { month: 'May', value: totalValue * 0.99 },
    { month: 'Jun', value: totalValue }
  ];

  // Claim yield for specific vault
  const handleClaimYield = async (assetType: AssetType) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    const data = assetBalances[assetType];
    if (data.claimableYield <= 0n) {
      toast.error("No yield available to claim");
      return;
    }

    try {
      const config = getAssetConfig(assetType);

      // Create wallet provider for contract call
      const walletProvider = wallet.isConnected ? {
        address: wallet.address!,
        networkPassphrase: wallet.networkPassphrase,
        signTransaction: wallet.signTransaction,
      } : undefined;

      if (!walletProvider) {
        throw new Error("Wallet not connected");
      }

      toast.info("Claiming yield...");

      // ✅ REAL CONTRACT CALL: claim_yield(user)
      const vaultService = createVaultServiceFromAddress(config.vault, walletProvider);
      const claimResult = await vaultService.claim_yield(address, walletProvider);

      if (!claimResult.success) {
        throw new Error(claimResult.error || "Claim failed");
      }

      // ✅ ALSO UPDATE LOCALSTORAGE (for UI consistency)
      const claimedAmount = simulateClaimYield(address, assetType);

      // Refresh balances from contracts
      const [yield_amount, usdc] = await Promise.all([
        vaultService.claimable_yield(address).catch(() => 0n),
        usdcService.balance(address).catch(() => data.claimableYield),
      ]);

      setAssetBalances(prev => ({
        ...prev,
        [assetType]: { ...prev[assetType], claimableYield: yield_amount }
      }));
      setUsdcBalance(usdc);

      const claimedUSD = (Number(claimedAmount) / 1e7).toFixed(2);
      toast.success(`✅ Claimed $${claimedUSD} from ${config.displayName} vault!`);
    } catch (error: any) {
      console.error("Claim failed:", error);
      toast.error(error.message || "Claim failed");
    }
  };

  // Claim all yields
  const handleClaimAllYields = async () => {
    let claimedCount = 0;

    for (const assetType of getAllAssetTypes()) {
      const data = assetBalances[assetType];
      if (data.claimableYield > 0n) {
        try {
          await handleClaimYield(assetType);
          claimedCount++;
        } catch (error) {
          console.error(`Failed to claim ${assetType}:`, error);
        }
      }
    }

    if (claimedCount > 0) {
      toast.success(`Claimed yield from ${claimedCount} vault(s)!`);
    } else {
      toast.info("No yields available to claim");
    }
  };

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center ">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const totalYield = getAllAssetTypes().reduce((sum, type) => {
    return sum + parseFloat(formatBalance(assetBalances[type].claimableYield, 7));
  }, 0);

  return (
    <div className="h-full overflow-auto bg-[#d8dfe5] rounded-[24px] flex flex-col m-4 p-4">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-antic text-lg font-semibold text-gray-900">
              Portfolio Overview
            </h1>
            <p className="font-plus-jakarta text-xs text-gray-600">
              Your financial snapshot at a glance
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Connected</div>
            <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </code>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Single Column Layout */}
      <div className="px-4 py-3 space-y-3 flex-1 overflow-auto">

        {/* Portfolio Performance Graph - Compact */}
        <div className="bg-transparent border border-gray-200 rounded-xl p-4 shadow-sm">
          {/* Header with Total Value */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-plus-jakarta text-sm font-semibold text-gray-900">Portfolio Performance</h3>
                <p className="text-xs text-gray-600">30-day trend</p>
              </div>
            </div>

            {/* Total Portfolio Value - Top Right */}
            <div className="text-right">
              <div className="text-xs text-gray-600 font-plus-jakarta">Total Value</div>
              <div className="font-antic text-2xl font-bold text-gray-900">
                {formatUSD(totalValue)}
              </div>
              <div className="flex items-center justify-end gap-1 text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span className="font-plus-jakarta text-xs">+2.5% this month</span>
              </div>
            </div>
          </div>

          {/* Area Chart - Reduced Height */}
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#774be5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#774be5" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatUSD(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#774be5"
                  strokeWidth={3}
                  fill="url(#performanceGradient)"
                  dot={{ fill: '#774be5', strokeWidth: 2, r: 5, stroke: 'white' }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Distribution Legend - Compact */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3">
              {portfolioData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <div>
                    <div className="text-xs font-plus-jakarta text-gray-600">{entry.name}</div>
                    <div className="text-xs font-plus-jakarta font-semibold text-gray-900">
                      {formatUSD(entry.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Three Cards in a Row - Risk & Loans, Yield Earnings, Quick Actions - Compact */}
        <div className="grid grid-cols-2 gap-2">

          {/* Card 1: Risk & Loans */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-plus-jakarta text-sm font-semibold text-gray-900">Risk & Loans</h3>
                <p className="text-xs text-gray-600">Health status</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className={`text-center p-2 rounded-lg border-2 ${
                healthFactor === 0
                  ? 'border-gray-200 bg-gray-50'
                  : healthFactor >= 1.5
                  ? 'border-green-200 bg-green-50'
                  : healthFactor >= 1.2
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className={`font-antic text-xl font-bold ${
                  healthFactor === 0
                    ? 'text-gray-600'
                    : healthFactor >= 1.5
                    ? 'text-green-600'
                    : healthFactor >= 1.2
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {healthFactor === 0 ? 'N/A' : healthFactor.toFixed(2)}
                </div>
                <div className="text-xs text-gray-700 font-plus-jakarta">Health Factor</div>
              </div>

              <div className={`text-center p-2 rounded-lg border-2 ${
                totalDebt === 0 ? 'border-gray-200 bg-gray-50' : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="font-antic text-xl font-bold text-gray-900">
                  {totalDebt === 0 ? 'None' : formatUSD(totalDebt)}
                </div>
                <div className="text-xs text-gray-700 font-plus-jakarta">Total Debt</div>
              </div>
            </div>

            {healthFactor > 0 && healthFactor < 1.5 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <div className="font-semibold mb-1">Health Factor Low</div>
                  <div>Liquidation occurs at 1.10. Consider adding collateral or repaying debt.</div>
                </div>
              </div>
            )}

            {totalDebt > 0 && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${
                    healthFactor >= 1.5 ? 'text-green-600' : healthFactor >= 1.2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {healthFactor >= 1.5 ? '🟢 Safe' : healthFactor >= 1.2 ? '🟡 Warning' : '🔴 At Risk'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidation at:</span>
                  <span className="font-semibold text-gray-900">1.10</span>
                </div>
              </div>
            )}
          </div>

          {/* Yield Earnings */}
          

          {/* Quick Actions */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-plus-jakarta text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>

            <div className="space-y-2">
               <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">
                <FileText className="w-4 h-4 mr-2" />
                View Asset Breakdown
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-plus-jakarta text-xl font-semibold">Asset Breakdown</DialogTitle>
              </DialogHeader>

              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Asset Type</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">Balance</div>
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">Value</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {getAllAssetTypes().map(assetType => {
                    const config = getAssetConfig(assetType);
                    const data = assetBalances[assetType];
                    const stRwaAmount = parseFloat(formatBalance(data.stRwaBalance));
                    const value = stRwaAmount * data.price;

                    if (stRwaAmount === 0) return null;

                    return (
                      <div key={assetType} className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.emoji}</span>
                          <span className="text-sm font-plus-jakarta text-gray-900">{config.shortName}</span>
                        </div>
                        <div className="text-sm font-plus-jakarta text-gray-900 text-right">{stRwaAmount.toFixed(2)}</div>
                        <div className="text-sm font-plus-jakarta font-semibold text-gray-900 text-right">{formatUSD(value)}</div>
                      </div>
                    );
                  })}

                  {/* USDC Row */}
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-plus-jakarta text-gray-900">USDC</span>
                    </div>
                    <div className="text-sm font-plus-jakarta text-gray-900 text-right">{formatBalance(usdcBalance, 7)}</div>
                    <div className="text-sm font-plus-jakarta font-semibold text-gray-900 text-right">{formatUSD(usdcValue)}</div>
                  </div>

                  {/* Total Row */}
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 font-semibold">
                    <div className="text-sm font-plus-jakarta text-gray-900">Total</div>
                    <div></div>
                    <div className="text-sm font-plus-jakarta text-gray-900 text-right">{formatUSD(totalValue)}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

              <button className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="text-xs font-plus-jakarta font-medium text-gray-900">Export Portfolio</div>
                  <div className="text-xs text-gray-600">Download CSV or PDF</div>
                </div>
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

        </div>

        {/* My Vaults Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Vault className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">My Vaults</h3>
                <p className="text-sm text-gray-600">Active stakes with yield and loan details</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">Total Staked</div>
              <div className="font-antic text-xl font-bold text-purple-600">
                {formatUSD(totalStaked)}
              </div>
            </div>
          </div>

          {/* Vault Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {getAllAssetTypes().map(assetType => {
              const config = getAssetConfig(assetType);
              const data = assetBalances[assetType];
              const loanInfo = vaultLoans[assetType];
              const stRwaAmount = parseFloat(formatBalance(data.stRwaBalance));
              const yieldAmount = parseFloat(formatBalance(data.claimableYield, 7));
              const stakedValue = stRwaAmount * data.price;

              // Only show vaults where user has staked
              if (stRwaAmount === 0) return null;

              return (
                <div
                  key={assetType}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all bg-gradient-to-br from-white to-gray-50"
                >
                  {/* Vault Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
                        {config.emoji}
                      </div>
                      <div>
                        <h4 className="font-plus-jakarta text-lg font-bold text-gray-900">
                          {config.displayName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {config.shortName} Vault
                        </p>
                      </div>
                    </div>

                    {loanInfo.hasLoan && (
                      <div className="px-3 py-1 bg-orange-100 border border-orange-300 rounded-full">
                        <span className="text-xs font-semibold text-orange-700">Loan Active</span>
                      </div>
                    )}
                  </div>

                  {/* Vault Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Staked Amount */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1 font-plus-jakarta">Staked Amount</div>
                      <div className="font-antic text-lg font-bold text-gray-900">
                        {stRwaAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">
                        {formatUSD(stakedValue)}
                      </div>
                    </div>

                    {/* Available Yield */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1 font-plus-jakarta">Available Yield</div>
                      <div className="font-antic text-lg font-bold text-green-700">
                        {formatUSD(yieldAmount)}
                      </div>
                      <div className="text-xs text-green-600 font-semibold">
                        Ready to claim
                      </div>
                    </div>

                    {/* Loan/Borrowed Amount */}
                    <div className={`border rounded-lg p-3 ${
                      loanInfo.hasLoan
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-xs text-gray-600 mb-1 font-plus-jakarta">Borrowed</div>
                      <div className={`font-antic text-lg font-bold ${
                        loanInfo.hasLoan ? 'text-orange-700' : 'text-gray-500'
                      }`}>
                        {loanInfo.hasLoan ? formatUSD(loanInfo.borrowedAmount) : 'No Loan'}
                      </div>
                      <div className={`text-xs font-semibold ${
                        loanInfo.hasLoan ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        {loanInfo.hasLoan ? 'Against collateral' : 'Available'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    {/* Claim Yield Button */}
                    <Button
                      onClick={() => handleClaimYield(assetType)}
                      disabled={yieldAmount === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-plus-jakarta"
                      size="sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Claim Yield ({formatUSD(yieldAmount)})
                    </Button>

                    {/* Auto-Repay Toggle */}
                    {loanInfo.hasLoan && (
                      <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                        <div className="text-sm font-plus-jakarta">
                          <div className="font-semibold text-gray-900">Auto-Repay</div>
                          <div className="text-xs text-gray-600">Use yield for loan</div>
                        </div>
                        <Switch
                          checked={vaultAutoRepay[assetType]}
                          onCheckedChange={(checked) => {
                            if (!address) return;

                            // Update localStorage
                            toggleAutoRepay(address, assetType, checked);

                            // Update UI state
                            setVaultAutoRepay(prev => ({
                              ...prev,
                              [assetType]: checked
                            }));

                            toast.success(
                              checked
                                ? `Auto-repay enabled for ${config.displayName}`
                                : `Auto-repay disabled for ${config.displayName}`
                            );
                          }}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Auto-Repay Info */}
                  {loanInfo.hasLoan && vaultAutoRepay[assetType] && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-800">
                          <span className="font-semibold">Auto-Repay Active:</span> Your yield will automatically be used to pay down your {formatUSD(loanInfo.borrowedAmount)} loan on this vault.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-plus-jakarta">Total Claimable Yield Across All Vaults</div>
                <div className="font-antic text-2xl font-bold text-green-600 mt-1">
                  {formatUSD(totalYield)}
                </div>
              </div>
              <Button
                onClick={handleClaimAllYields}
                disabled={totalYield === 0}
                className="bg-primary hover:bg-primary/90 font-plus-jakarta"
              >
                <Download className="w-4 h-4 mr-2" />
                Claim All Yields
              </Button>
            </div>
          </div>
        </div>

        {/* Asset Breakdown - Open Modal Button */}
       

      </div>
    </div>
  );
};

export default ProfileSection;
