import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowRight, Wallet, TrendingUp, Shield, RefreshCw } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

const StakeSection = () => {
  const [selectedVault, setSelectedVault] = useState("alexVault");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStakeMode, setIsStakeMode] = useState(true);

  // Mock data - will be replaced with real contract data
  const vaults = [
    { id: "alexVault", name: "AlexRWA", emoji: "🏦"},
    { id: "ethVault", name: "EthRWA", emoji: "⚡"},
    { id: "btcVault", name: "BtcRWA", emoji: "₿"}
  ];

  const userBalances = {
    alexRWA: "1,250.00",
    orionAlexRWA: "850.50"
  };

  const handleStake = async () => {
    setLoading(true);
    // Mock staking logic
    setTimeout(() => {
      setLoading(false);
      setStakeAmount("");
    }, 2000);
  };

  const handleUnstake = async () => {
    setLoading(true);
    // Mock unstaking logic
    setTimeout(() => {
      setLoading(false);
      setUnstakeAmount("");
    }, 2000);
  };

  const handleGetMockRWA = async () => {
    setLoading(true);
    // Mock RWA minting
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const calculateReceiveAmount = (amount: string) => {
    const exchangeRate = 0.95; // Mock exchange rate
    return (parseFloat(amount || "0") * exchangeRate).toFixed(2);
  };

  const selectedVaultData = vaults.find(v => v.id === selectedVault) || vaults[0];
  const platformTokenName = `Orion${selectedVaultData.name}`;

  return (<>
      <HeroBackground />
    <div className="flex items-center justify-center h-full bg-[#antic] relative">
    
      <div className="w-full max-w-md bg-[#antic] relative z-50">
        
        {/* Get Mock RWA Button */}
        <div className="flex justify-end mb-4 relative z-50">
          <Button
            onClick={handleGetMockRWA}
            disabled={loading}
            className="bg-black/75 text-white hover:bg-gray-600 font-antic font-semibold px-4 py-2 text-sm rounded-[10px] tracking-wide relative z-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Get Mock RWA
          </Button>
        </div>

        {/* Uniswap-style Modal */}
        <div className="bg-[#d8dfe5] rounded-[24px] p-4  border border-gray-200 relative z-50">
          {isStakeMode ? (
            // STAKE MODE
            <>
              {/* Upper Section - Stake Input */}
              <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between">
                {/* Amount Input Area */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <input
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent text-black text-3xl font-antic font-bold outline-none w-full tracking-tight"
                      type="number"
                    />
                    <div className="text-gray-500 text-sm mt-1 font-antic font-light">$0</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Vault Selector */}
                    <Select value={selectedVault} onValueChange={setSelectedVault}>
                      <SelectTrigger className="bg-white border border-gray-200 text-black rounded-[16px] h-12 w-40 font-inter hover:border-gray-300 relative z-50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{selectedVaultData.emoji}</span>
                          <span className="font-antic font-semibold text-sm">{selectedVaultData.name}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 relative z-[100]">
                        {vaults.map((vault) => (
                          <SelectItem key={vault.id} value={vault.id} className="hover:bg-gray-50">
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg">{vault.emoji}</span>
                              <div>
                                <div className="font-antic font-semibold text-sm">{vault.name}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => setStakeAmount(userBalances.alexRWA.replace(",", ""))}
                      className="bg-primary hover:bg-primary/90 text-white text-xs px-2 py-1 h-6 mt-2 rounded-md font-antic font-bold tracking-wide"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                {/* Balance Display */}
                <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                  <Wallet className="w-4 h-4" />
                  <span className="font-antic font-medium">Balance: {userBalances.alexRWA} alexRWA</span>
                </div>
              </div>

              {/* Toggle Arrow Button */}
              <div className="flex justify-center -my-3 relative z-50">
                <button
                  onClick={() => setIsStakeMode(!isStakeMode)}
                  className="bg-white border-4 border-white rounded-full p-2 hover:bg-gray-50 transition-colors shadow-md cursor-pointer relative z-50"
                >
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Lower Section - Receive */}
              <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between">
                {/* Reward Display Area */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-black text-3xl font-antic font-bold tracking-tight">
                      {calculateReceiveAmount(stakeAmount)} {platformTokenName}
                    </div>
                    <div className="text-gray-500 text-sm mt-1 font-antic font-light">You Will Receive</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Platform Token Display (locked) */}
                    <div className="bg-white border border-gray-200 rounded-[16px] h-12 w-40 flex items-center justify-center px-3">
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-lg">⭐</span>
                        <span className="font-antic font-semibold text-sm">{platformTokenName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Platform Token Balance */}
                <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                  <span className="font-antic font-medium">Balance: {userBalances.orionAlexRWA} {platformTokenName}</span>
                </div>
              </div>

              {/* Stake Button */}
              <div className="mt-4">
                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-antic font-bold py-4 text-lg rounded-[20px] flex items-center justify-center gap-3 tracking-wide"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Stake Assets
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            // UNSTAKE MODE
            <>
              {/* Upper Section - Unstake Input */}
              <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between">
                {/* Amount Input Area */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <input
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent text-black text-3xl font-medium outline-none w-full"
                      type="number"
                    />
                    <div className="text-gray-500 text-sm mt-1">$0</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Platform Token Display */}
                    <div className="bg-white border border-gray-200 rounded-[16px] h-12 w-40 flex items-center justify-center px-3">
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-lg">⭐</span>
                        <span className="font-antic font-semibold text-sm">{platformTokenName}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setUnstakeAmount(userBalances.orionAlexRWA)}
                      className="bg-primary hover:bg-primary/90 text-white text-xs px-2 py-1 h-6 mt-2 rounded-md"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                {/* Staked Balance Display */}
                <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Staked: {userBalances.orionAlexRWA} {platformTokenName}</span>
                </div>
              </div>

              {/* Toggle Arrow Button */}
              <div className="flex justify-center -my-3 relative z-50">
                <button
                  onClick={() => setIsStakeMode(!isStakeMode)}
                  className="bg-white border-4 border-white rounded-full p-2 hover:bg-gray-50 transition-colors shadow-md cursor-pointer relative z-50"
                >
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Lower Section - Receive */}
              <div className="bg-gray-50 rounded-[20px] p-4 h-[150px] flex flex-col justify-between">
                {/* Reward Display Area */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-black text-3xl font-medium">
                      {(parseFloat(unstakeAmount || "0") * 1.05).toFixed(2)} {selectedVaultData.name}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">You Will Receive</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {/* Asset Token Display */}
                    <div className="bg-white border border-gray-200 rounded-[16px] h-12 w-40 flex items-center justify-center px-3">
                      <div className="flex items-center gap-2 text-black">
                        <span className="text-lg">{selectedVaultData.emoji}</span>
                        <span className="font-inter">{selectedVaultData.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Asset Balance */}
                <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                  <span>Balance: {userBalances.alexRWA} {selectedVaultData.name}</span>
                </div>
              </div>

              {/* Unstake Button */}
              <div className="mt-4">
                <Button
                  onClick={handleUnstake}
                  disabled={!unstakeAmount || loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-antic font-bold py-4 text-lg rounded-[20px] flex items-center justify-center gap-3 tracking-wide"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Unstake Assets
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default StakeSection;