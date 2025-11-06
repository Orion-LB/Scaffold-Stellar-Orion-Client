import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  DollarSign, 
  RefreshCw, 
  ExternalLink,
  Zap,
  Activity,
  Target,
  Clock
} from "lucide-react";

const ProfileSection = () => {
  const [autoRepayStates, setAutoRepayStates] = useState<Record<string, boolean>>({
    loan1: true,
    loan2: false
  });
  const [showAutoRepayModal, setShowAutoRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'enable' | 'disable'>('enable');

  // Mock data
  const portfolioData = [
    { name: 'Staked RWA', value: 42500, color: '#774be5' },
    { name: 'Available Balance', value: 8500, color: '#323d68' },
    { name: 'Borrowed Assets', value: 15000, color: '#d8dfe5' }
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
    { asset: 'alexRWA', balance: '1,250.00', value: '$62,500', change: '+2.4%' },
    { asset: 'OrionAlexRWA', balance: '850.50', value: '$42,525', change: '+5.1%' },
    { asset: 'USDC', balance: '15,000.00', value: '$15,000', change: '0.0%' },
    { asset: 'XLM', balance: '2,500.00', value: '$350', change: '-1.2%' }
  ];

  const activeLoans = [
    {
      id: 'loan1',
      asset: 'USDC',
      borrowed: '10,000.00',
      collateral: '450.25 OrionAlexRWA',
      interestOwed: '125.50',
      healthFactor: 2.45,
      autoRepay: true,
      loanDate: '2024-01-15'
    },
    {
      id: 'loan2',
      asset: 'XLM',
      borrowed: '5,000.00',
      collateral: '200.75 OrionAlexRWA',
      interestOwed: '45.25',
      healthFactor: 1.85,
      autoRepay: false,
      loanDate: '2024-02-01'
    }
  ];

  const transactions = [
    { id: 1, type: 'Stake', asset: 'alexRWA', amount: '500.00', status: 'Completed', date: '2024-03-15', hash: 'abc123...' },
    { id: 2, type: 'Borrow', asset: 'USDC', amount: '5,000.00', status: 'Completed', date: '2024-03-14', hash: 'def456...' },
    { id: 3, type: 'Auto-Repay', asset: 'USDC', amount: '25.50', status: 'Completed', date: '2024-03-13', hash: 'ghi789...' },
    { id: 4, type: 'Unstake', asset: 'OrionAlexRWA', amount: '100.00', status: 'Pending', date: '2024-03-12', hash: 'jkl012...' }
  ];

  const handleAutoRepayToggle = (loanId: string, enabled: boolean) => {
    setSelectedLoan(loanId);
    setModalAction(enabled ? 'enable' : 'disable');
    setShowAutoRepayModal(true);
  };

  const confirmAutoRepayChange = () => {
    if (selectedLoan) {
      setAutoRepayStates({
        ...autoRepayStates,
        [selectedLoan]: modalAction === 'enable'
      });
    }
    setShowAutoRepayModal(false);
  };

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 2) return "text-green-600";
    if (hf >= 1.5) return "text-yellow-600";
    if (hf >= 1.1) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthFactorBg = (hf: number) => {
    if (hf >= 2) return "bg-green-100";
    if (hf >= 1.5) return "bg-yellow-100";
    if (hf >= 1.1) return "bg-orange-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-antic text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Portfolio Dashboard
        </h1>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Monitor your staked assets, active loans, and portfolio performance
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="lg:col-span-1">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
            <div className="text-center mb-4">
              <div className="font-inter text-sm text-muted-foreground mb-2">Total Portfolio Value</div>
              <div className="font-antic text-3xl font-semibold text-foreground">$66,000</div>
              <div className="font-inter text-sm text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8.2% this month
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {portfolioData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="font-inter text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-inter font-medium text-foreground">${entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yield Earnings & Risk Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Yield Earnings Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-antic text-xl font-semibold text-foreground">Yield Earnings</h3>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="font-inter text-sm text-muted-foreground mb-1">Total Earned</div>
                <div className="font-antic text-2xl font-semibold text-foreground">$3,425</div>
              </div>
              <div className="text-center">
                <div className="font-inter text-sm text-muted-foreground mb-1">Claimable Now</div>
                <div className="font-antic text-2xl font-semibold text-primary">$425.50</div>
              </div>
              <div className="text-center">
                <div className="font-inter text-sm text-muted-foreground mb-1">Auto-Repay Used</div>
                <div className="font-antic text-2xl font-semibold text-blue-600">$2,150</div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldHistory}>
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => [`$${value}`, 'Yield']} />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#774be5" 
                    strokeWidth={3}
                    dot={{ fill: '#774be5', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button className="w-full mt-4 btn-gradient text-white font-inter font-medium py-3 rounded-[12px]">
              <DollarSign className="w-4 h-4 mr-2" />
              Claim Available Yield
            </Button>
          </div>

          {/* Risk Management */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
            <h3 className="font-antic text-xl font-semibold text-foreground mb-6">Risk Management</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-inter font-medium text-foreground">Overall LTV</span>
                  <span className="font-inter font-semibold text-foreground">65.2%</span>
                </div>
                <Progress value={65.2} className="h-3 mb-4" />
                <div className="text-xs text-muted-foreground">Max recommended: 70%</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="font-inter font-medium text-foreground">Risk Level</div>
                  <div className="font-inter text-sm text-green-600">Low Risk</div>
                  <div className="font-inter text-xs text-muted-foreground">All positions healthy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Balances & Active Loans */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet Balances */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
          <h3 className="font-antic text-xl font-semibold text-foreground mb-6">Wallet Balances</h3>
          <div className="space-y-4">
            {walletBalances.map((balance, index) => (
              <div key={balance.asset} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-inter font-medium text-foreground">{balance.asset}</div>
                    <div className="font-inter text-sm text-muted-foreground">{balance.balance}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-inter font-semibold text-foreground">{balance.value}</div>
                  <div className={`font-inter text-sm ${
                    balance.change.startsWith('+') ? 'text-green-600' : 
                    balance.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {balance.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
          <h3 className="font-antic text-xl font-semibold text-foreground mb-6">Active Loans</h3>
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="p-4 border border-border/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-inter font-medium text-foreground flex items-center gap-2">
                      {loan.asset} Loan
                      <Badge className={getHealthFactorBg(loan.healthFactor)}>
                        HF: {loan.healthFactor.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="font-inter text-sm text-muted-foreground">
                      Borrowed: {loan.borrowed} • Interest: ${loan.interestOwed}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-inter text-xs text-muted-foreground">Auto-Repay</span>
                    <Switch
                      checked={autoRepayStates[loan.id]}
                      onCheckedChange={(checked) => handleAutoRepayToggle(loan.id, checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Collateral: {loan.collateral}
                </div>
                {loan.healthFactor < 1.5 && (
                  <div className="flex items-center gap-2 mt-2 text-orange-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Monitor health factor closely</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-primary/5 rounded-xl">
            <div className="font-inter text-sm text-foreground mb-1">Total Debt</div>
            <div className="font-antic text-xl font-semibold text-foreground">$15,170.75</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-antic text-xl font-semibold text-foreground">Transaction History</h3>
          <Button variant="outline" className="font-inter font-medium">
            Export History
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
            <TabsTrigger value="repay">Repay</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border border-border/30 rounded-xl hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'Stake' ? 'bg-green-100' :
                      tx.type === 'Borrow' ? 'bg-blue-100' :
                      tx.type === 'Auto-Repay' ? 'bg-purple-100' :
                      'bg-orange-100'
                    }`}>
                      {tx.type === 'Stake' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {tx.type === 'Borrow' && <DollarSign className="w-5 h-5 text-blue-600" />}
                      {tx.type === 'Auto-Repay' && <Zap className="w-5 h-5 text-purple-600" />}
                      {tx.type === 'Unstake' && <RefreshCw className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <div className="font-inter font-medium text-foreground">
                        {tx.type} {tx.asset}
                      </div>
                      <div className="font-inter text-sm text-muted-foreground">
                        {tx.date} • {tx.amount}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }>
                      {tx.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Auto-Repay Modal */}
      <Dialog open={showAutoRepayModal} onOpenChange={setShowAutoRepayModal}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-md border-white/50">
          <DialogHeader>
            <DialogTitle className="font-antic text-xl font-semibold text-foreground flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              {modalAction === 'enable' ? 'Enable' : 'Disable'} Auto-Repay
            </DialogTitle>
            <DialogDescription className="font-inter text-muted-foreground">
              {modalAction === 'enable' 
                ? 'Configure automatic yield-based loan repayment'
                : 'Disable automatic repayment for this loan'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {modalAction === 'enable' ? (
              <>
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="font-inter font-medium text-foreground mb-2">Auto-Repay Benefits:</div>
                  <ul className="space-y-1 font-inter text-sm text-muted-foreground">
                    <li>• Reduces interest accumulation</li>
                    <li>• Improves loan health factor</li>
                    <li>• Decreases liquidation risk</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="font-inter text-sm text-green-700">Available Yield</div>
                    <div className="font-inter text-lg font-semibold text-green-800">$425.50</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="font-inter text-sm text-blue-700">Monthly Interest</div>
                    <div className="font-inter text-lg font-semibold text-blue-800">$125.50</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="font-inter font-medium text-orange-800 mb-2">Summary:</div>
                <div className="space-y-1 font-inter text-sm text-orange-700">
                  <div>Total yield used: $2,150.00</div>
                  <div>Interest saved: $486.25</div>
                  <div>Remaining loan balance: $9,874.50</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAutoRepayModal(false)}
              className="flex-1 font-inter font-medium"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAutoRepayChange}
              className="flex-1 btn-gradient text-white font-inter font-medium"
            >
              {modalAction === 'enable' ? 'Enable' : 'Disable'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSection;