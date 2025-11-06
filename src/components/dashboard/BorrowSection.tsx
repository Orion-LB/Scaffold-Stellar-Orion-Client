import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, TrendingUp, Shield, DollarSign, RefreshCw, Zap, Info } from "lucide-react";
import cloudImage from "@/assets/cloud.png";

const BorrowSection = () => {
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [selectedCollateral, setSelectedCollateral] = useState<string[]>(["OrionAlexRWA"]);
  const [collateralAmounts, setCollateralAmounts] = useState<Record<string, string>>({});
  const [showAutoRepayModal, setShowAutoRepayModal] = useState(false);
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const borrowAssets = [
    { id: "USDC", name: "USD Coin", symbol: "USDC", rate: "5.2%", available: "50,000" },
    { id: "XLM", name: "Stellar Lumens", symbol: "XLM", rate: "4.8%", available: "100,000" }
  ];

  const collateralAssets = [
    { id: "OrionAlexRWA", name: "Orion Alex RWA", balance: "850.50", value: "$42,525", ltv: "80%" },
    { id: "OrionEthRWA", name: "Orion Eth RWA", balance: "120.25", value: "$6,012", ltv: "75%" },
  ];

  const calculateHealthFactor = () => {
    const totalCollateralValue = Object.values(collateralAmounts).reduce((sum, amount) => sum + parseFloat(amount || "0"), 0) * 50; // Mock price
    const borrowValue = parseFloat(borrowAmount || "0");
    if (borrowValue === 0) return 999;
    return (totalCollateralValue * 0.8) / borrowValue; // 80% LTV
  };

  const calculateLTV = () => {
    const totalCollateralValue = Object.values(collateralAmounts).reduce((sum, amount) => sum + parseFloat(amount || "0"), 0) * 50;
    const borrowValue = parseFloat(borrowAmount || "0");
    if (totalCollateralValue === 0) return 0;
    return (borrowValue / totalCollateralValue) * 100;
  };

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 2) return "text-green-600";
    if (hf >= 1.5) return "text-yellow-600";
    if (hf >= 1.1) return "text-orange-600";
    return "text-red-600";
  };

  const handleBorrow = () => {
    setShowAutoRepayModal(true);
  };

  const handleConfirmBorrow = async () => {
    setLoading(true);
    // Mock borrowing logic
    setTimeout(() => {
      setLoading(false);
      setShowAutoRepayModal(false);
      setBorrowAmount("");
      setCollateralAmounts({});
    }, 2000);
  };

  const healthFactor = calculateHealthFactor();
  const ltv = calculateLTV();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-antic text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Borrow Assets
        </h1>
        <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
          Use your staked RWA tokens as collateral to borrow digital assets
        </p>
      </div>

      {/* Borrow Card */}
      <div className="max-w-4xl mx-auto">
        <div 
          className="bg-[#d8dfe5] rounded-[20px] p-8 md:p-12 card-shadow relative overflow-hidden"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Subtle cloud background */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <img 
              src={cloudImage} 
              alt=""
              className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 w-[600px] max-w-none mix-blend-soft-light"
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8">
            {/* Left Column - Borrow Details */}
            <div className="space-y-6">
              <h3 className="font-antic text-xl font-semibold text-[#0e1c29]">
                Borrow Details
              </h3>

              {/* Asset Selection */}
              <div className="space-y-3">
                <label className="font-inter font-medium text-[#0e1c29] text-sm">
                  Asset to Borrow
                </label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-white/50 rounded-[12px] h-14 font-inter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-white/50">
                    {borrowAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id} className="font-inter">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{asset.name} ({asset.symbol})</div>
                            <div className="text-sm text-muted-foreground">Rate: {asset.rate} • Available: {asset.available}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Borrow Amount */}
              <div className="space-y-3">
                <label className="font-inter font-medium text-[#0e1c29] text-sm">
                  Borrow Amount
                </label>
                <div className="relative">
                  <Input
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/80 backdrop-blur-sm border-white/50 rounded-[12px] h-14 font-inter text-lg pr-24"
                    type="number"
                  />
                  <Button
                    onClick={() => setBorrowAmount("10000")} // Mock max safe amount
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary hover:bg-primary/20 border-0 text-sm font-medium px-3 py-1 h-8"
                    variant="outline"
                  >
                    MAX SAFE
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground font-inter">
                  ≈ ${parseFloat(borrowAmount || "0").toLocaleString()} USD
                </div>
              </div>

              {/* Interest Rate Display */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-inter text-sm text-muted-foreground mb-1">
                      Interest Rate
                    </div>
                    <div className="font-inter text-xl font-semibold text-foreground">
                      5.2% APR
                    </div>
                  </div>
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Right Column - Collateral & Health */}
            <div className="space-y-6">
              <h3 className="font-antic text-xl font-semibold text-[#0e1c29]">
                Collateral & Health
              </h3>

              {/* Collateral Selection */}
              <div className="space-y-4">
                <label className="font-inter font-medium text-[#0e1c29] text-sm">
                  Collateral Assets
                </label>
                {collateralAssets.map((asset) => (
                  <div key={asset.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedCollateral.includes(asset.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCollateral([...selectedCollateral, asset.id]);
                            } else {
                              setSelectedCollateral(selectedCollateral.filter(id => id !== asset.id));
                              const newAmounts = { ...collateralAmounts };
                              delete newAmounts[asset.id];
                              setCollateralAmounts(newAmounts);
                            }
                          }}
                        />
                        <div>
                          <div className="font-inter font-medium text-foreground">{asset.name}</div>
                          <div className="font-inter text-sm text-muted-foreground">
                            Balance: {asset.balance} • Value: {asset.value} • LTV: {asset.ltv}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedCollateral.includes(asset.id) && (
                      <Input
                        value={collateralAmounts[asset.id] || ""}
                        onChange={(e) => setCollateralAmounts({
                          ...collateralAmounts,
                          [asset.id]: e.target.value
                        })}
                        placeholder="Amount to use as collateral"
                        className="bg-white/80 backdrop-blur-sm border-white/50 rounded-[8px] h-10 font-inter"
                        type="number"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Health Metrics */}
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter font-medium text-[#0e1c29]">LTV Ratio</span>
                    <span className="font-inter font-semibold text-foreground">{ltv.toFixed(1)}%</span>
                  </div>
                  <Progress value={ltv} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">Max: 80%</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter font-medium text-[#0e1c29]">Health Factor</span>
                    <span className={`font-inter font-semibold ${getHealthFactorColor(healthFactor)}`}>
                      {healthFactor > 999 ? "∞" : healthFactor.toFixed(2)}
                    </span>
                  </div>
                  {healthFactor < 1.2 && healthFactor !== 999 && (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Low health factor - risk of liquidation</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Borrow Button */}
          <div className="mt-8">
            <Button
              onClick={handleBorrow}
              disabled={!borrowAmount || Object.keys(collateralAmounts).length === 0}
              className="w-full btn-gradient text-white font-inter font-medium py-6 text-lg rounded-[12px] flex items-center justify-center gap-3"
            >
              <DollarSign className="w-5 h-5" />
              Borrow {selectedAsset}
            </Button>
          </div>
        </div>
      </div>

      {/* Auto-Repay Modal */}
      <Dialog open={showAutoRepayModal} onOpenChange={setShowAutoRepayModal}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border-white/50">
          <DialogHeader>
            <DialogTitle className="font-antic text-2xl font-semibold text-foreground flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              Enable Auto-Repay?
            </DialogTitle>
            <DialogDescription className="font-inter text-muted-foreground">
              Let your staked yield automatically repay your loan interest
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Explanation */}
            <div className="bg-primary/5 rounded-2xl p-6">
              <h4 className="font-inter font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                How Auto-Repay Works
              </h4>
              <ul className="space-y-2 font-inter text-sm text-muted-foreground">
                <li>• Your staked RWA assets earn yield continuously</li>
                <li>• Earned yield automatically pays your loan interest</li>
                <li>• Reduces your interest burden and liquidation risk</li>
                <li>• You can disable this feature at any time</li>
              </ul>
            </div>

            {/* Visual Calculation */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="font-inter text-sm text-green-700 mb-1">Estimated Monthly Yield</div>
                <div className="font-inter text-xl font-semibold text-green-800">$425.50</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="font-inter text-sm text-blue-700 mb-1">Monthly Interest</div>
                <div className="font-inter text-xl font-semibold text-blue-800">$210.25</div>
              </div>
            </div>

            {/* Auto-Repay Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <div>
                <div className="font-inter font-medium text-foreground">Enable Auto-Repay</div>
                <div className="font-inter text-sm text-muted-foreground">Automatically use yield to repay interest</div>
              </div>
              <Switch
                checked={autoRepayEnabled}
                onCheckedChange={setAutoRepayEnabled}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <div className="font-inter text-sm text-muted-foreground">
                I understand the auto-repay mechanism and agree to the terms and conditions
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setAutoRepayEnabled(false);
                  handleConfirmBorrow();
                }}
                disabled={!termsAccepted || loading}
                variant="outline"
                className="flex-1 py-3 font-inter font-medium border-2"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleConfirmBorrow}
                disabled={!termsAccepted || loading}
                className="flex-1 btn-gradient text-white py-3 font-inter font-medium"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {autoRepayEnabled ? "Enable & Borrow" : "Borrow"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BorrowSection;