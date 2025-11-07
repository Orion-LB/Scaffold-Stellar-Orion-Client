import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Wallet, RefreshCw, Plus } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";
import { toast } from "sonner";

const BorrowSection = () => {
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [selectedCollaterals, setSelectedCollaterals] = useState<{[key: string]: {percentage: string, amount: string}}>({});
  const [showCollateralModal, setShowCollateralModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const borrowAssets = [
    { id: "USDC", name: "USD Coin", emoji: "💵", rate: "5.2%" },
    { id: "XLM", name: "Stellar Lumens", emoji: "⭐", rate: "4.8%" }
  ];

  const collateralAssets = [
    { id: "OrionAlexRWA", name: "OrionAlexRWA", emoji: "🏦", balance: "850.50" },
    { id: "OrionEthRWA", name: "OrionEthRWA", emoji: "⚡", balance: "120.25" },
    { id: "OrionBtcRWA", name: "OrionBtcRWA", emoji: "₿", balance: "45.75" }
  ];

  const userBalances = {
    USDC: "0.00",
    XLM: "0.00"
  };

  const handleGetMockAssets = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Mock assets added to your wallet!");
    }, 1500);
  };

  const handleBorrow = async () => {
    if (Object.keys(selectedCollaterals).length === 0) {
      toast.error("Please select collateral first!");
      return;
    }
    
    const totalPercentage = getTotalCollateralPercentage();
    if (totalPercentage !== 100) {
      toast.error(`Total collateral must be 100%. Currently: ${totalPercentage}%`);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBorrowAmount("");
      setSelectedCollaterals({});
      toast.success("Borrow successful!");
    }, 2000);
  };

  const handleSelectCollateral = (asset: any, percentage: string) => {
    const amount = (parseFloat(asset.balance) * parseFloat(percentage) / 100).toFixed(2);
    
    setSelectedCollaterals(prev => {
      const newSelected = { ...prev };
      
      if (percentage === "0" || !percentage) {
        delete newSelected[asset.id];
      } else {
        newSelected[asset.id] = { percentage, amount };
      }
      
      return newSelected;
    });
    
    toast.success(`Selected ${percentage}% of ${asset.name}`);
  };
  
  const getTotalCollateralPercentage = () => {
    return Object.values(selectedCollaterals).reduce((total, collateral) => {
      return total + parseFloat(collateral.percentage);
    }, 0);
  };
  
  const getCollateralPercentage = (assetId: string) => {
    return selectedCollaterals[assetId]?.percentage || "0";
  };

  const selectedAssetData = borrowAssets.find(a => a.id === selectedAsset) || borrowAssets[0];
  const totalCollateralPercentage = getTotalCollateralPercentage();
  const hasSelectedCollaterals = Object.keys(selectedCollaterals).length > 0;

  return (
    <>
      <div className="flex items-center justify-center h-full bg-[#antic] relative">
        <div className="w-full max-w-md bg-[#antic] relative z-50">
          
          {/* Get Mock Assets Button */}
          <div className="flex justify-end mb-4 relative z-50">
            <Button
                onClick={() => setShowCollateralModal(true)}
              className="bg-black/75 text-white hover:bg-gray-600 font-antic font-semibold px-4 py-2 text-sm rounded-[10px] tracking-wide relative z-50"
            >                <Plus className="w-4 h-4 text-white-600" />

                  {hasSelectedCollaterals ? "Manage Collateral" : "Select Collateral"}
            </Button>
          </div>

          {/* Minimal Borrow Modal */}
          <div className="bg-[#d8dfe5] rounded-[24px] p-4 border border-gray-200 relative z-50">
            {/* Upper Section - Borrow Input */}
            <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between gap-2">
              {/* Amount Input Area */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <input
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-black text-3xl font-antic font-bold outline-none w-full tracking-tight"
                    type="number"
                  />
                  <div className="text-gray-500 text-sm mt-1 font-antic font-light">$0</div>
                </div>
                
                <div className="flex flex-col items-end">
                  {/* Asset Selector */}
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="bg-white border border-gray-200 text-black rounded-[16px] h-12 w-40 font-inter hover:border-gray-300 relative z-50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedAssetData.emoji}</span>
                        <span className="font-antic font-semibold text-sm">{selectedAssetData.name}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 relative z-[100]">
                      {borrowAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id} className="hover:bg-gray-50">
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-lg">{asset.emoji}</span>
                            <div>
                              <div className="font-antic font-semibold text-sm">{asset.name}</div>
                              <div className="text-xs text-gray-500 font-antic font-light">APR: {asset.rate}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Balance Display */}
              <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                <Wallet className="w-4 h-4" />
                <span className="font-antic font-medium">Balance: {userBalances[selectedAsset as keyof typeof userBalances]} {selectedAsset}</span>
              </div>
            </div>

            {/* Collateral Selection Button */}
            

            {/* Lower Section - Collateral Display */}
            <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between gap-2 mt-4">
              {hasSelectedCollaterals ? (
                <>
                  {/* Selected Collaterals Display */}
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[100px]">
                    {Object.entries(selectedCollaterals).map(([assetId, collateral]) => {
                      const asset = collateralAssets.find(a => a.id === assetId);
                      return (
                        <div key={assetId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{asset?.emoji}</span>
                            <div>
                              <div className="font-antic font-semibold text-sm">{asset?.name}</div>
                              <div className="text-xs text-gray-500">{collateral.amount} tokens</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-antic font-bold text-sm">{collateral.percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Total Percentage Display */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-antic font-medium text-sm text-gray-600">Total Collateral:</span>
                    <div className={`font-antic font-bold text-lg ${
                      totalCollateralPercentage === 100 
                        ? 'text-green-600' 
                        : totalCollateralPercentage > 100 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                    }`}>
                      {totalCollateralPercentage}%
                      {totalCollateralPercentage === 100 && <span className="ml-1 text-green-600">✓</span>}
                    </div>
                  </div>
                </>
              ) : (
                /* No Collateral Selected */
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 text-lg font-antic font-light mb-2">No Collateral Selected</div>
                    <div className="text-gray-500 text-sm font-antic font-light">Click above to select collateral</div>
                  </div>
                </div>
              )}
            </div>

            {/* Borrow Button */}
            <div className="mt-4">
              <Button
                onClick={handleBorrow}
                disabled={!borrowAmount || !hasSelectedCollaterals || totalCollateralPercentage !== 100 || loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-antic font-bold py-4 text-lg rounded-[20px] flex items-center justify-center gap-3 tracking-wide"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Borrow Assets
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collateral Selection Modal */}
      <Dialog open={showCollateralModal} onOpenChange={setShowCollateralModal}>
        <DialogContent className="max-w-md bg-white rounded-2xl border border-gray-200  z-[100]">
          <DialogHeader>
            <DialogTitle className="font-antic text-xl font-semibold text-foreground text-center">
              Select Collateral
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <div className="text-center">
                <div className="font-antic font-semibold text-sm text-blue-700">
                  Total Selected: {totalCollateralPercentage}% / 100%
                </div>
                <div className="font-antic font-light text-xs text-blue-600 mt-1">
                  {totalCollateralPercentage < 100 
                    ? `Need ${100 - totalCollateralPercentage}% more to borrow`
                    : totalCollateralPercentage === 100
                    ? "Perfect! Ready to borrow"
                    : "Too much! Reduce selection"}
                </div>
              </div>
            </div>
            
            {collateralAssets.map((asset) => {
              const currentPercentage = getCollateralPercentage(asset.id);
              return (
                <div key={asset.id} className={`border rounded-xl p-4 transition-colors ${
                  currentPercentage !== "0" ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{asset.emoji}</span>
                    <div className="flex-1">
                      <div className="font-antic font-semibold text-lg">{asset.name}</div>
                      <div className="font-antic font-light text-sm text-gray-500">
                        Available: {asset.balance}
                      </div>
                    </div>
                    {currentPercentage !== "0" && (
                      <div className="bg-primary text-white px-2 py-1 rounded-full">
                        <span className="font-antic font-bold text-xs">{currentPercentage}%</span>
                      </div>
                    )}
                  </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {["0", "25", "50", "75", "100"].map((percentage) => {
                    const currentPercentage = getCollateralPercentage(asset.id);
                    const isSelected = currentPercentage === percentage;
                    const wouldExceed = totalCollateralPercentage - parseFloat(currentPercentage) + parseFloat(percentage) > 100;
                    
                    return (
                      <Button
                        key={percentage}
                        onClick={() => handleSelectCollateral(asset, percentage)}
                        disabled={wouldExceed && !isSelected}
                        className={`font-antic font-semibold text-sm py-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-primary text-white'
                            : wouldExceed
                            ? 'bg-red-50 text-red-300 cursor-not-allowed'
                            : percentage === "0"
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                            : 'bg-gray-100 hover:bg-primary hover:text-white text-gray-700'
                        }`}
                        variant="ghost"
                      >
                        {percentage}%
                      </Button>
                    );
                  })}
                </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BorrowSection;