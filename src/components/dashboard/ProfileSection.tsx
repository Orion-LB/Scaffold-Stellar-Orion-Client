import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Activity,
  Zap,
  ChevronRight
} from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

const ProfileSection = () => {
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(true);
  const [showAutoRepayModal, setShowAutoRepayModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Mock data
  const portfolioData = [
    { name: 'Staked', value: 42500, color: '#774be5' },
    { name: 'Available', value: 8500, color: '#10b981' },
    { name: 'Borrowed', value: 15000, color: '#f59e0b' }
  ];

  const yieldHistory = [
    { month: 'Jan', yield: 420 },
    { month: 'Feb', yield: 485 },
    { month: 'Mar', yield: 520 },
    { month: 'Apr', yield: 615 },
    { month: 'May', yield: 580 },
    { month: 'Jun', yield: 650 }
  ];

  const walletBalances = [
    { asset: "OrionAlexRWA", balance: "850.50", value: "$42,525", color: "#774be5" },
    { asset: "USDC", balance: "15,000.00", value: "$15,000", color: "#10b981" },
    { asset: "XLM", balance: "2,500.00", value: "$350", color: "#f59e0b" }
  ];

  const recentTransactions = [
    { type: "Stake", asset: "alexRWA", amount: "500.00", date: "Mar 15", status: "Completed" },
    { type: "Borrow", asset: "USDC", amount: "5,000.00", date: "Mar 14", status: "Completed" },
    { type: "Auto-Repay", asset: "USDC", amount: "25.50", date: "Mar 13", status: "Completed" },
    { type: "Unstake", asset: "OrionAlexRWA", amount: "100.00", date: "Mar 12", status: "Pending" },
    { type: "Claim", asset: "Yield", amount: "45.25", date: "Mar 11", status: "Completed" }
  ];

  const handleAutoRepayToggle = () => {
    setShowAutoRepayModal(true);
  };

  const confirmAutoRepayChange = () => {
    setAutoRepayEnabled(!autoRepayEnabled);
    setShowAutoRepayModal(false);
  };

  return (
    <>
      <div className="h-full relative overflow-hidden">
        <div className="relative z-50 p-6 h-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-antic text-xl font-semibold text-foreground mb-1">
              Portfolio Overview
            </h1>
            <p className="font-plus-jakarta text-sm text-muted-foreground">
              Monitor your investments and earnings
            </p>
          </div>

          {/* Static Grid - 4 Cards */}
          <div className="grid grid-cols-2 gap-6 h-[calc(100%-120px)]">
            
            {/* Card 1: Portfolio Value - Clickable */}
            <div 
              onClick={() => setShowPortfolioModal(true)}
              className="relative overflow-hidden rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300"
              style={{
                background: `
                  radial-gradient(circle at 85% 85%, rgba(216, 223, 229, 0.4) 0%, rgba(216, 223, 229, 0.15) 30%, transparent 70%),
                  radial-gradient(circle at 20% 20%, rgba(216, 223, 229, 0.1) 0%, transparent 50%),
                  white
                `
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-semibold text-foreground">Portfolio</h3>
                    <p className="text-xs text-muted-foreground">Total value</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <div className="font-antic text-3xl font-bold text-foreground">$66,000</div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-plus-jakarta text-sm">+8.2% this month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  3 assets • Click for details
                </div>
              </div>
            </div>

            {/* Card 2: Yield Earnings - Clickable */}
            <div 
              onClick={() => setShowYieldModal(true)}
              className="relative overflow-hidden rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-300"
              style={{
                background: `
                  radial-gradient(ellipse at 90% 80%, rgba(216, 223, 229, 0.5) 0%, rgba(216, 223, 229, 0.2) 25%, transparent 65%),
                  radial-gradient(circle at 15% 30%, rgba(216, 223, 229, 0.08) 0%, transparent 40%),
                  white
                `
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-semibold text-foreground">Yield</h3>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-2">
                <div className="font-antic text-3xl font-bold text-foreground">$425.50</div>
                <div className="text-sm text-muted-foreground">Available to claim</div>
                <div className="text-xs text-muted-foreground mt-3">
                  Total earned: $3,425 • Click for chart
                </div>
              </div>
            </div>

            {/* Card 3: Risk & Loans */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-plus-jakarta font-semibold text-foreground">Risk & Loans</h3>
                  <p className="text-xs text-muted-foreground">Health status</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-antic text-lg font-bold text-green-600">2.45</div>
                    <div className="text-xs text-green-700">Health Factor</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-antic text-lg font-bold text-foreground">$15,170</div>
                    <div className="text-xs text-orange-700">Total Debt</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="font-plus-jakarta text-sm font-medium text-foreground">Auto-Repay</div>
                    <div className="text-xs text-muted-foreground">Use yield for repayment</div>
                  </div>
                  <Switch
                    checked={autoRepayEnabled}
                    onCheckedChange={handleAutoRepayToggle}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Recent Activity - Clickable */}
            <div 
              onClick={() => setShowActivityModal(true)}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-semibold text-foreground">Activity</h3>
                    <p className="text-xs text-muted-foreground">Recent transactions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {recentTransactions.slice(0, 2).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-plus-jakarta text-sm font-medium text-foreground">{tx.type}</div>
                      <div className="text-xs text-muted-foreground">{tx.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-plus-jakarta font-semibold text-foreground">{tx.amount}</div>
                      <Badge className="bg-green-100 text-green-700 text-xs">{tx.status}</Badge>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{recentTransactions.length - 2} more • Click to view all
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Portfolio Details Modal */}
        <Dialog open={showPortfolioModal} onOpenChange={setShowPortfolioModal}>
          <DialogContent className="max-w-lg bg-white rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="font-antic text-xl font-semibold text-foreground text-center">
                Portfolio Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Portfolio Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Portfolio Breakdown */}
              <div className="space-y-3">
                {portfolioData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="font-plus-jakarta font-medium text-foreground">{entry.name}</span>
                    </div>
                    <span className="font-antic font-bold text-foreground">${entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Wallet Assets */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-plus-jakarta font-semibold text-foreground mb-3">Wallet Assets</h4>
                <div className="space-y-2">
                  {walletBalances.map((balance) => (
                    <div key={balance.asset} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: balance.color }}></div>
                        <span className="text-sm font-plus-jakarta text-foreground">{balance.asset}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-plus-jakarta font-semibold text-foreground">{balance.value}</div>
                        <div className="text-xs text-muted-foreground">{balance.balance}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Yield Details Modal */}
        <Dialog open={showYieldModal} onOpenChange={setShowYieldModal}>
          <DialogContent className="max-w-lg bg-white rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="font-antic text-xl font-semibold text-foreground text-center">
                Yield Earnings
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Yield Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="font-antic text-2xl font-bold text-green-600">$425.50</div>
                  <div className="text-sm text-green-700">Claimable Now</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="font-antic text-2xl font-bold text-blue-600">$3,425</div>
                  <div className="text-sm text-blue-700">Total Earned</div>
                </div>
              </div>

              {/* Yield Chart */}
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldHistory}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Area 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#yieldGradient)"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-plus-jakarta">
                Claim Available Yield
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Activity Details Modal */}
        <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
          <DialogContent className="max-w-lg bg-white rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="font-antic text-xl font-semibold text-foreground text-center">
                Transaction History
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-plus-jakarta font-medium text-foreground">{tx.type}</div>
                    <Badge className={tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{tx.asset}</div>
                      <div className="text-sm text-muted-foreground">{tx.date}</div>
                    </div>
                    <div className="text-lg font-plus-jakarta font-bold text-foreground">{tx.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Auto-Repay Modal */}
        <Dialog open={showAutoRepayModal} onOpenChange={setShowAutoRepayModal}>
          <DialogContent className="max-w-md bg-white rounded-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="font-antic text-lg font-semibold text-foreground text-center flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                {autoRepayEnabled ? 'Disable' : 'Enable'} Auto-Repay
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <div className="font-plus-jakarta text-sm text-muted-foreground mb-2">
                  {autoRepayEnabled 
                    ? 'Auto-repay will be disabled for all loans'
                    : 'Enable automatic repayment using yield earnings'
                  }
                </div>
                <div className="font-antic text-lg font-semibold text-foreground">
                  Available Yield: $425.50
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAutoRepayModal(false)}
                className="flex-1 font-plus-jakarta text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmAutoRepayChange}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-plus-jakarta text-sm"
              >
                {autoRepayEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ProfileSection;