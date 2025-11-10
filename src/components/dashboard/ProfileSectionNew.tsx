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
import { useWallet } from "@/hooks/useWallet";
import { SimulationService } from "@/services/localStorage/SimulationService";
import toast from "@/lib/toast";
import { ASSET_NAMES, ASSET_DESCRIPTIONS, AssetType } from "@/config/contracts";

const ProfileSectionNew = () => {
  const { isConnected, address } = useWallet();
  const [profile, setProfile] = useState<ReturnType<typeof SimulationService.getProfile> | null>(null);
  const [stakes, setStakes] = useState<ReturnType<typeof SimulationService.getStakes>>([]);
  const [loans, setLoans] = useState<ReturnType<typeof SimulationService.getLoans>>([]);

  // Load data
  useEffect(() => {
    if (!isConnected || !address) return;

    loadUserData();
    const interval = setInterval(loadUserData, 10000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const loadUserData = () => {
    if (!address) return;

    const userProfile = SimulationService.getProfile(address);
    const userStakes = SimulationService.getStakes(address);
    const userLoans = SimulationService.getLoans(address);

    setProfile(userProfile);
    setStakes(userStakes);
    setLoans(userLoans);
  };

  // Helper functions
  const formatUSD = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate portfolio values
  const portfolioValues = profile ? SimulationService.calculatePortfolioValue(address!) : null;

  // Claim yield handler
  const handleClaimYield = async (stakeId: string) => {
    if (!address) return;

    toast.processing('Claiming Yield');

    const result = await SimulationService.simulateClaimYield(address, stakeId);

    toast.dismissProcessing();

    if (result.success && result.amount) {
      toast.claimYieldSuccess(result.amount);
      loadUserData();
    } else {
      toast.error('Claim Failed', result.error);
    }
  };

  // Claim all yields
  const handleClaimAllYields = async () => {
    if (!address) return;

    const claimableStakes = stakes.filter(s => s.accumulatedYield > 0);

    if (claimableStakes.length === 0) {
      toast.info('No Yield Available', 'You don\'t have any claimable yield at the moment.');
      return;
    }

    toast.processing(`Claiming Yield from ${claimableStakes.length} Stake(s)`);

    let successCount = 0;
    let totalClaimed = 0;

    for (const stake of claimableStakes) {
      const result = await SimulationService.simulateClaimYield(address, stake.id);
      if (result.success && result.amount) {
        successCount++;
        totalClaimed += result.amount;
      }
    }

    toast.dismissProcessing();

    if (successCount > 0) {
      toast.success(
        `Claimed from ${successCount} Stake(s)`,
        `Total: ${formatUSD(totalClaimed)} USDC`
      );
      loadUserData();
    }
  };

  // Show connect wallet if not connected
  if (!isConnected || !profile) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  const totalClaimableYield = SimulationService.getTotalClaimableYield(address!);

  // Performance data (mock)
  const totalValue = portfolioValues?.totalValue || 0;
  const performanceData = [
    { month: 'Jan', value: totalValue * 0.85 },
    { month: 'Feb', value: totalValue * 0.90 },
    { month: 'Mar', value: totalValue * 0.93 },
    { month: 'Apr', value: totalValue * 0.97 },
    { month: 'May', value: totalValue * 0.99 },
    { month: 'Jun', value: totalValue }
  ];

  // Portfolio distribution
  const portfolioData = portfolioValues ? [
    { name: 'RWA Tokens', value: portfolioValues.breakdown.rwa, color: '#10b981' },
    { name: 'Staked (stRWA)', value: portfolioValues.breakdown.strwa, color: '#774be5' },
    { name: 'USDC', value: portfolioValues.breakdown.usdc, color: '#f59e0b' }
  ].filter(item => item.value > 0) : [];

  const activeLoan = loans.find(l => l.status === 'active');

  return (
    <div className="h-full overflow-auto bg-[#d8dfe5] rounded-[24px] flex flex-col m-4 p-4">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-antic text-lg font-semibold text-gray-900">Portfolio Overview</h1>
            <p className="font-plus-jakarta text-xs text-gray-600">
              Your financial snapshot at a glance
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Connected</div>
            <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {SimulationService.formatAddress(address!)}
            </code>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-3 space-y-3 flex-1 overflow-auto">

        {/* Portfolio Performance Graph */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-plus-jakarta text-sm font-semibold text-gray-900">
                  Portfolio Performance
                </h3>
                <p className="text-xs text-gray-600">6-month trend</p>
              </div>
            </div>

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
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#e5e7eb" />
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

          {/* Portfolio Distribution */}
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

        {/* Risk & Loans + Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* Risk & Loans */}
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
                profile.healthFactor === 0 ? 'border-gray-200 bg-gray-50' :
                profile.healthFactor >= 150 ? 'border-green-200 bg-green-50' :
                profile.healthFactor >= 125 ? 'border-yellow-200 bg-yellow-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className={`font-antic text-xl font-bold ${
                  profile.healthFactor === 0 ? 'text-gray-600' :
                  profile.healthFactor >= 150 ? 'text-green-600' :
                  profile.healthFactor >= 125 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {profile.healthFactor === 0 ? 'N/A' : `${profile.healthFactor.toFixed(0)}%`}
                </div>
                <div className="text-xs text-gray-700 font-plus-jakarta">Health Factor</div>
              </div>

              <div className={`text-center p-2 rounded-lg border-2 ${
                profile.totalBorrowedValue === 0 ? 'border-gray-200 bg-gray-50' : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="font-antic text-xl font-bold text-gray-900">
                  {profile.totalBorrowedValue === 0 ? 'None' : formatUSD(profile.totalBorrowedValue)}
                </div>
                <div className="text-xs text-gray-700 font-plus-jakarta">Total Debt</div>
              </div>
            </div>

            {profile.healthFactor > 0 && profile.healthFactor < 150 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <div className="font-semibold mb-1">Health Factor Low</div>
                  <div>Liquidation occurs at 110%. Consider adding collateral or repaying debt.</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <h3 className="font-plus-jakarta text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>

            <div className="space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-300">
                    <FileText className="w-4 h-4 mr-2" />
                    View Balances
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-plus-jakarta text-xl font-semibold">
                      Account Balances
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-3 mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">RWA Token Balances</div>
                      <div className="space-y-2">
                        {Object.entries(profile.rwaBalances).map(([asset, balance]) => (
                          <div key={asset} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 capitalize">{asset}:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {SimulationService.formatAmount(balance)} RWA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">stRWA Token Balances (Staked)</div>
                      <div className="space-y-2">
                        {Object.entries(profile.strwaBalances).map(([asset, balance]) => (
                          <div key={asset} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 capitalize">{asset}:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {SimulationService.formatAmount(balance)} stRWA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">USDC Balance:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatUSD(profile.usdcBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <button className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="text-xs font-plus-jakarta font-medium text-gray-900">Export Data</div>
                  <div className="text-xs text-gray-600">Download portfolio</div>
                </div>
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* My Stakes Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Vault className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">My Stakes</h3>
                <p className="text-sm text-gray-600">Active stakes earning yield</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">Total Staked Value</div>
              <div className="font-antic text-xl font-bold text-purple-600">
                {formatUSD(profile.totalStakedValue)}
              </div>
            </div>
          </div>

          {stakes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Vault className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active stakes yet. Visit the Stake section to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stakes.map(stake => (
                <div
                  key={stake.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-plus-jakarta text-lg font-bold text-gray-900 capitalize">
                        {stake.assetType.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Staked {new Date(stake.stakedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                      <span className="text-xs font-semibold text-green-700">{stake.apy}% APY</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Staked Amount</div>
                      <div className="font-antic text-lg font-bold text-gray-900">
                        {SimulationService.formatAmount(stake.rwaAmount)}
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">RWA Tokens</div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Claimable Yield</div>
                      <div className="font-antic text-lg font-bold text-green-700">
                        {formatUSD(stake.accumulatedYield)}
                      </div>
                      <div className="text-xs text-green-600 font-semibold">Ready to claim</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">stRWA Tokens</div>
                      <div className="font-antic text-lg font-bold text-purple-700">
                        {SimulationService.formatAmount(stake.strwaAmount)}
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">1:1 ratio</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleClaimYield(stake.id)}
                      disabled={stake.accumulatedYield === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Claim {formatUSD(stake.accumulatedYield)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stakes.length > 0 && totalClaimableYield > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-plus-jakarta">
                    Total Claimable Yield
                  </div>
                  <div className="font-antic text-2xl font-bold text-green-600 mt-1">
                    {formatUSD(totalClaimableYield)}
                  </div>
                </div>
                <Button
                  onClick={handleClaimAllYields}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Claim All Yields
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSectionNew;
