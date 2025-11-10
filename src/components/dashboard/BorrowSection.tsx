import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Wallet, RefreshCw, AlertCircle, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useContractServices } from "@/hooks/useContractServices";
import { CONTRACT_ADDRESSES, createStRWAServiceFromAddress, createLendingPoolService, createUSDCService, getAssetConfig, AssetType } from "@/services/contracts";
import type { LoanInfo } from "@/services/contracts/LendingPoolService";
import { getProfile, simulateBorrow, simulateRepay } from "@/lib/localStorage";

// Utility functions for calculations
const usdcFromContractUnits = (contractUnits: bigint): number => {
  return Number(contractUnits) / 10_000_000;
};

const usdcToContractUnits = (usdcAmount: number): bigint => {
  return BigInt(Math.floor(usdcAmount * 10_000_000));
};

const calculateHealthFactor = (collateralAmount: bigint, strwaPrice: bigint, debt: bigint, penalties: bigint): number => {
  if (debt === 0n && penalties === 0n) return Infinity;
  const collateralValue = (collateralAmount * strwaPrice) / BigInt(1e18);
  const totalDebt = debt + penalties;
  if (totalDebt === 0n) return Infinity;
  return Number((collateralValue * 100n) / totalDebt) / 100;
};

const calculateMaxBorrow = (collateralAmount: bigint, strwaPrice: bigint): bigint => {
  const collateralValue = (collateralAmount * strwaPrice) / BigInt(1e18);
  return (collateralValue * 100n) / 140n;
};


const BorrowSection = () => {
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCollateralModal, setShowCollateralModal] = useState(false);

  // Multiple collateral support
  const [collateralPercentages, setCollateralPercentages] = useState<Record<string, number>>({
    "OrionAlexRWA": 0,
    "OrionEthRWA": 0,
    "OrionBtcRWA": 0,
  });

  // Real contract balances
  const [stRwaBalance, setStRwaBalance] = useState<bigint>(BigInt(0));
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0));
  const [activeLoan, setActiveLoan] = useState<LoanInfo | null>(null);
  const [stRwaPrice, setStRwaPrice] = useState<bigint>(BigInt(10500)); // Default 105 USDC

  // Contract services
  const {
    isConnected,
    address,
    wallet,
  } = useContractServices();

  // Load balances and loan data from localStorage
  useEffect(() => {
    if (!isConnected || !address) return;

    const loadData = () => {
      try {
        // Load from localStorage
        const profile = getProfile(address);
        
        // Get stRWA balance from first selected asset type with tokens
        let totalStRwa = BigInt(0);
        for (const assetType of ['invoices', 'tbills', 'realestate'] as AssetType[]) {
          totalStRwa += profile.assetBalances[assetType].stRwaBalance;
        }
        
        setStRwaBalance(totalStRwa);
        setUsdcBalance(profile.usdcBalance);
        
        // Check if any vault has an active loan
        const hasLoan = Object.values(profile.vaultLoans).some(loan => loan.hasLoan);
        if (hasLoan) {
          // Create a mock loan for display
          const firstLoanAsset = Object.entries(profile.vaultLoans).find(([_, loan]) => loan.hasLoan);
          if (firstLoanAsset) {
            const [assetType, loanInfo] = firstLoanAsset;
            const mockLoan: LoanInfo = {
              borrower: address,
              collateral_amount: BigInt(Math.floor(loanInfo.borrowedAmount * 1e18 * 1.5)), // Mock collateral
              principal: BigInt(Math.floor(loanInfo.borrowedAmount * 1e7)),
              outstanding_debt: BigInt(Math.floor(loanInfo.borrowedAmount * 1e7)),
              interest_rate: BigInt(520),
              start_time: BigInt(Date.now()),
              end_time: BigInt(Date.now() + 365 * 24 * 60 * 60 * 1000),
              last_interest_update: BigInt(Date.now()),
              warnings_issued: 0,
              last_warning_time: BigInt(0),
              penalties: BigInt(0),
              yield_share_percent: BigInt(10),
            };
            setActiveLoan(mockLoan);
          }
        } else {
          setActiveLoan(null);
        }
        
        // Mock price
        setStRwaPrice(BigInt(10500)); // $105
      } catch (error) {
        console.error("Failed to load borrow data from localStorage:", error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const formatBalance = (balance: bigint, decimals: number = 18) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
  };

  // Collateral assets with their balances (mock multiple vaults)
  const collateralAssets = [
    {
      id: "OrionAlexRWA",
      name: "Orion Alex RWA",
      balance: formatBalance(stRwaBalance),
      price: Number(stRwaPrice) / 100, // Price in USDC
      emoji: "🏦"
    },
    {
      id: "OrionEthRWA",
      name: "Orion Eth RWA",
      balance: formatBalance(BigInt(0)), // TODO: Load from other vaults when deployed
      price: Number(stRwaPrice) / 100,
      emoji: "⚡"
    },
    {
      id: "OrionBtcRWA",
      name: "Orion Btc RWA",
      balance: formatBalance(BigInt(0)), // TODO: Load from other vaults when deployed
      price: Number(stRwaPrice) / 100,
      emoji: "₿"
    }
  ];

  // Calculate total percentage selected
  const getTotalPercentage = () => {
    return Object.values(collateralPercentages).reduce((sum, p) => sum + p, 0);
  };

  // Calculate total collateral amount in tokens
  const getTotalCollateralAmount = () => {
    let total = 0;
    collateralAssets.forEach(asset => {
      const percentage = collateralPercentages[asset.id] || 0;
      const amount = parseFloat(asset.balance) * percentage / 100;
      total += amount;
    });
    return total.toFixed(2);
  };

  // Calculate total collateral value in USD
  const getTotalCollateralValue = () => {
    let total = 0;
    collateralAssets.forEach(asset => {
      const percentage = collateralPercentages[asset.id] || 0;
      const amount = parseFloat(asset.balance) * percentage / 100;
      total += amount * asset.price;
    });
    return total.toFixed(2);
  };

  const handleBorrow = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (activeLoan) {
      toast.error("You already have an active loan. Please repay it first.");
      return;
    }

    // Check if total percentage equals 100%
    const totalPercentage = getTotalPercentage();
    if (totalPercentage !== 100) {
      toast.error(`Total collateral must be 100%. Currently: ${totalPercentage}%`);
      return;
    }

    const totalCollateralAmount = parseFloat(getTotalCollateralAmount());
    const collateral = BigInt(Math.floor(totalCollateralAmount * 1e18));
    const loanAmt = BigInt(Math.floor(parseFloat(borrowAmount || "0") * 1e7)); // USDC has 7 decimals

    if (collateral <= 0 || loanAmt <= 0) {
      toast.error("Please enter valid amounts");
      return;
    }

    if (collateral > stRwaBalance) {
      toast.error("Insufficient platform token balance");
      return;
    }

    // Check health factor
    const healthFactor = calculateHealthFactor(
      collateral,
      stRwaPrice,
      loanAmt,
      BigInt(0) // No penalties yet
    );

    if (healthFactor < 1.4) {
      toast.error(`Health factor too low (${healthFactor.toFixed(2)}). Need at least 1.40. Reduce loan amount or add more collateral.`);
      return;
    }

    setLoading(true);
    try {
      // Create wallet provider for contract calls
      const walletProvider = wallet.isConnected ? {
        address: wallet.address!,
        networkPassphrase: wallet.networkPassphrase,
        signTransaction: wallet.signTransaction,
      } : undefined;

      if (!walletProvider) {
        throw new Error("Wallet not connected");
      }

      // Get primary asset type from selected collateral
      const primaryAssetType = (collateralAssets.find(a => collateralPercentages[a.id] > 0)?.id as AssetType) || AssetType.INVOICES;
      const assetConfig = getAssetConfig(primaryAssetType);

      // Show realistic transaction progress
      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Approving collateral...</span>
        </div>
      );

      // Step 1: Approve stRWA tokens for lending pool
      const stRwaService = createStRWAServiceFromAddress(assetConfig.stRwa, walletProvider);
      const approveResult = await stRwaService.approve(
        address,
        CONTRACT_ADDRESSES.LENDING_POOL,
        collateral,
        walletProvider
      );

      if (!approveResult.success) {
        throw new Error(approveResult.error || "Failed to approve collateral");
      }

      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Originating loan...</span>
        </div>
      );

      // Step 2: Originate loan
      // ✅ REAL CONTRACT CALL: originate_loan(borrower, collateral, loan_amount, duration_months)
      const lendingPoolService = createLendingPoolService(walletProvider);
      const loanResult = await lendingPoolService.originate_loan(
        address,
        collateral,
        loanAmt,
        12, // 12 months duration
        walletProvider
      );

      if (!loanResult.success) {
        throw new Error(loanResult.error || "Loan origination failed");
      }

      // Get transaction hash from result
      const txHash = loanResult.transactionHash || `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 11)}`.toUpperCase();

      // ✅ ALSO UPDATE LOCALSTORAGE (for UI consistency)
      simulateBorrow(address, primaryAssetType, loanAmt, collateral);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">✅ Loan Originated!</div>
          <div className="text-sm">
            Borrowed {usdcFromContractUnits(loanAmt)} {selectedAsset}
          </div>
          <div className="text-sm text-gray-600">
            Collateral: {totalCollateralAmount.toFixed(2)} platform tokens locked
          </div>
          <div className="text-xs text-gray-600">
            TX: {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </div>
        </div>,
        { duration: 5000 }
      );

      setBorrowAmount("");
      setCollateralPercentages({
        "invoices": 0,
        "tbills": 0,
        "realestate": 0,
      });

      // Refresh data from localStorage
      const profile = getProfile(address);
      setUsdcBalance(profile.usdcBalance);
      
      // Create a mock loan info for active loan
      if (profile.vaultLoans[primaryAssetType].hasLoan) {
        const mockLoan: LoanInfo = {
          borrower: address,
          collateral_amount: collateral,
          principal: loanAmt,
          outstanding_debt: loanAmt,
          interest_rate: BigInt(520), // 5.2%
          start_time: BigInt(Date.now()),
          end_time: BigInt(Date.now() + 365 * 24 * 60 * 60 * 1000),
          last_interest_update: BigInt(Date.now()),
          warnings_issued: 0,
          last_warning_time: BigInt(0),
          penalties: BigInt(0),
          yield_share_percent: BigInt(10),
        };
        setActiveLoan(mockLoan);
      }
    } catch (error: any) {
      console.error("Borrow failed:", error);
      toast.error("Borrow failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!activeLoan) {
      toast.error("No active loan to repay");
      return;
    }

    const repayAmount = activeLoan.outstanding_debt;

    if (repayAmount > usdcBalance) {
      toast.error("Insufficient USDC balance to repay loan");
      return;
    }

    setLoading(true);
    try {
      // Create wallet provider for contract calls
      const walletProvider = wallet.isConnected ? {
        address: wallet.address!,
        networkPassphrase: wallet.networkPassphrase,
        signTransaction: wallet.signTransaction,
      } : undefined;

      if (!walletProvider) {
        throw new Error("Wallet not connected");
      }

      // Show realistic transaction progress
      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Approving USDC...</span>
        </div>
      );

      // Step 1: Approve USDC for lending pool
      const usdcService = createUSDCService(walletProvider);
      const approveResult = await usdcService.approve(
        address,
        CONTRACT_ADDRESSES.LENDING_POOL,
        repayAmount,
        walletProvider
      );

      if (!approveResult.success) {
        throw new Error(approveResult.error || "Failed to approve USDC");
      }

      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Repaying loan...</span>
        </div>
      );

      // Step 2: Repay loan
      // ✅ REAL CONTRACT CALL: repay_loan(borrower, repay_amount)
      const lendingPoolService = createLendingPoolService(walletProvider);
      const repayResult = await lendingPoolService.repay_loan(
        address,
        repayAmount,
        walletProvider
      );

      if (!repayResult.success) {
        throw new Error(repayResult.error || "Loan repayment failed");
      }

      // Get transaction hash from result
      const txHash = repayResult.transactionHash || `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 11)}`.toUpperCase();

      // ✅ ALSO UPDATE LOCALSTORAGE (for UI consistency)
      simulateRepay(address, AssetType.INVOICES, repayAmount);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">✅ Loan Repaid!</div>
          <div className="text-sm">
            Repaid {usdcFromContractUnits(repayAmount)} USDC
          </div>
          <div className="text-sm text-green-600">
            Collateral released
          </div>
          <div className="text-xs text-gray-600">
            TX: {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </div>
        </div>,
        { duration: 5000 }
      );

      // Refresh data from localStorage
      const profile = getProfile(address);
      setUsdcBalance(profile.usdcBalance);
      setActiveLoan(null);
    } catch (error: any) {
      console.error("Repay failed:", error);
      toast.error("Repay failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateMaxBorrowAmount = () => {
    const totalCollateral = parseFloat(getTotalCollateralAmount());
    const collateral = BigInt(Math.floor(totalCollateral * 1e18));
    if (collateral <= 0) return "0.00";

    const maxBorrow = calculateMaxBorrow(collateral, stRwaPrice);
    return usdcFromContractUnits(maxBorrow);
  };

  // Set percentage for a specific collateral asset
  const setAssetPercentage = (assetId: string, percentage: number) => {
    setCollateralPercentages(prev => ({
      ...prev,
      [assetId]: percentage
    }));
  };

  // Available borrow assets
  const borrowAssets = [
    { id: "USDC", name: "USD Coin", symbol: "USDC", rate: "5.2%" },
    { id: "XLM", name: "Stellar Lumens", symbol: "XLM", rate: "4.8%" }
  ];

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to borrow USDC</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center h-full bg-[#antic] relative p-6 overflow-hidden">
        <div className="w-full max-w-2xl bg-[#antic] relative z-50 max-h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">

          {/* Active Loan Display */}
          {activeLoan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">Active Loan</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700">Collateral:</span>
                      <span className="ml-2 font-semibold">{formatBalance(activeLoan.collateral_amount)} stRWA</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Debt:</span>
                      <span className="ml-2 font-semibold">{formatBalance(activeLoan.outstanding_debt, 7)} USDC</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleRepayLoan}
                    disabled={loading}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Repay Loan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Minimal Borrow Modal - Only 2 Placeholders */}
          <div className="bg-[#d8dfe5] rounded-[24px] p-6 pb-8 border border-gray-200 relative z-50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-antic">Borrow Assets</h2>

            {/* PLACEHOLDER 1: Borrow Amount with Asset Selector */}
            <div className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-gray-200">
              <label className="text-sm text-gray-600 font-antic mb-3 block">Amount to Borrow</label>
              <div className="flex items-center gap-3">
                {/* Amount Input */}
                <div className="flex-1">
                  <input
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-black text-3xl font-antic font-bold outline-none w-full"
                    type="number"
                  />
                  <div className="flex items-center gap-2 text-gray-500 text-xs mt-2">
                    <Wallet className="w-3 h-3" />
                    <span className="font-antic">Balance: {formatBalance(usdcBalance, 7)} USDC</span>
                  </div>
                </div>

                {/* Asset Selector on Right */}
                <div className="flex flex-col items-end gap-2">
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="w-[140px] bg-gray-50 border-gray-300 h-12 font-antic font-semibold text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {borrowAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id} className="font-antic">
                          <div className="flex flex-col">
                            <span className="font-semibold">{asset.symbol}</span>
                            <span className="text-xs text-gray-500">Rate: {asset.rate}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setBorrowAmount(calculateMaxBorrowAmount().toString())}
                    size="sm"
                    variant="outline"
                    className="text-xs font-antic"
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>

            {/* PLACEHOLDER 2: Collateral with OrionRWA Token Conversion */}
            <div className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-gray-600 font-antic">Collateral Required</label>
                <Button
                  onClick={() => setShowCollateralModal(true)}
                  size="sm"
                  variant="outline"
                  className="text-xs flex items-center gap-1 font-antic"
                >
                  <Plus className="w-3 h-3" />
                  {getTotalPercentage() === 0 ? 'Select' : 'Edit'}
                </Button>
              </div>

              {getTotalPercentage() > 0 ? (
                <div className="space-y-3">
                  {/* Selected Collateral Display */}
                  {collateralAssets.map((asset) => {
                    const percentage = collateralPercentages[asset.id];
                    if (percentage === 0) return null;
                    
                    const tokenAmount = parseFloat(asset.balance) * percentage / 100;
                    // Hardcoded conversion: 1 Token = 1.5 OrionRWA Token (dummy value)
                    const orionRwaAmount = tokenAmount * 1.5;
                    const orionRwaValue = orionRwaAmount * 105; // $105 per OrionRWA token

                    return (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{asset.emoji}</span>
                          <div>
                            <div className="font-antic font-semibold text-gray-900">
                              {percentage}% of {asset.name}
                            </div>
                            <div className="text-xs text-gray-500 font-antic">
                              {tokenAmount.toFixed(2)} stRWA tokens
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-antic font-bold text-primary text-lg">
                            {orionRwaAmount.toFixed(2)} OrionRWA
                          </div>
                          <div className="text-xs text-gray-500 font-antic">
                            ≈ ${orionRwaValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Summary */}
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 font-antic">Total Collateral Value</div>
                      <div className={`text-xs font-antic font-semibold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {getTotalPercentage()}% Selected {getTotalPercentage() !== 100 && `(${100 - getTotalPercentage()}% more needed)`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-antic font-bold text-gray-900">
                        ${getTotalCollateralValue()}
                      </div>
                      <div className="text-xs text-gray-500 font-antic">
                        Max: {calculateMaxBorrowAmount()} {selectedAsset}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-3xl mb-2">🏦</div>
                  <div className="text-sm text-gray-500 font-antic">No collateral selected</div>
                  <div className="text-xs text-gray-400 font-antic mt-1">Click "Select" to choose your collateral</div>
                </div>
              )}
            </div>

            {/* Health Factor (Compact) */}
            {getTotalPercentage() > 0 && borrowAmount && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700 font-antic font-semibold">Health Factor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold font-antic ${
                    calculateHealthFactor(
                      BigInt(Math.floor(parseFloat(getTotalCollateralAmount()) * 1e18)),
                      stRwaPrice,
                      BigInt(Math.floor(parseFloat(borrowAmount) * 1e7)),
                      BigInt(0)
                    ) >= 1.4 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateHealthFactor(
                      BigInt(Math.floor(parseFloat(getTotalCollateralAmount()) * 1e18)),
                      stRwaPrice,
                      BigInt(Math.floor(parseFloat(borrowAmount) * 1e7)),
                      BigInt(0)
                    ).toFixed(2)}
                  </div>
                  <span className="text-xs text-gray-500 font-antic">min: 1.40</span>
                </div>
              </div>
            )}

            {/* ONE BUTTON: Borrow */}
            <Button
              onClick={handleBorrow}
              disabled={!borrowAmount || getTotalPercentage() !== 100 || loading || !!activeLoan}
              className="w-full bg-primary hover:bg-primary/90 text-white font-antic font-bold py-4 text-lg rounded-[20px] flex items-center justify-center gap-3 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {getTotalPercentage() === 100 ? `Borrow ${borrowAmount || '0.00'} ${selectedAsset}` : `Complete Collateral Selection (${getTotalPercentage()}%)`}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Collateral Selection Modal */}
      <Dialog open={showCollateralModal} onOpenChange={setShowCollateralModal}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border-white/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-antic text-xl font-semibold text-foreground">
              Select Collateral Assets
            </DialogTitle>
            <p className="text-sm text-gray-600 font-antic">
              Allocate your platform tokens as collateral. Total must equal 100%.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Total Progress */}
            <div className={`rounded-lg p-4 ${getTotalPercentage() === 100 ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-antic font-semibold">Total Selected</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-antic font-bold ${getTotalPercentage() === 100 ? 'text-green-700' : 'text-orange-700'}`}>
                    {getTotalPercentage()}%
                  </span>
                  {getTotalPercentage() === 100 && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${getTotalPercentage() === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${Math.min(getTotalPercentage(), 100)}%` }}
                />
              </div>
            </div>

            {/* Collateral Assets */}
            {collateralAssets.map((asset) => (
              <div key={asset.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{asset.emoji}</span>
                    <div>
                      <div className="font-antic font-semibold text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-600 font-antic">
                        Balance: {asset.balance} • ${(parseFloat(asset.balance) * asset.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-antic font-bold text-primary">
                      {collateralPercentages[asset.id]}%
                    </div>
                    <div className="text-xs text-gray-500 font-antic">
                      {(parseFloat(asset.balance) * collateralPercentages[asset.id] / 100).toFixed(2)} tokens
                    </div>
                  </div>
                </div>

                {/* Percentage Buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {[0, 25, 50, 75, 100].map((percentage) => (
                    <Button
                      key={percentage}
                      onClick={() => setAssetPercentage(asset.id, percentage)}
                      variant="outline"
                      className={`font-antic font-bold transition-colors ${
                        collateralPercentages[asset.id] === percentage
                          ? 'bg-primary text-white border-primary'
                          : 'hover:bg-primary/10'
                      }`}
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-antic font-semibold mb-2">Collateral Summary</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between font-antic">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="font-semibold text-gray-900">{getTotalCollateralAmount()} stRWA</span>
                </div>
                <div className="flex justify-between font-antic">
                  <span className="text-gray-700">Total Value:</span>
                  <span className="font-semibold text-gray-900">${getTotalCollateralValue()} USD</span>
                </div>
                <div className="flex justify-between font-antic">
                  <span className="text-gray-700">Max Borrow:</span>
                  <span className="font-semibold text-gray-900">{calculateMaxBorrowAmount()} {selectedAsset}</span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={() => setShowCollateralModal(false)}
              disabled={getTotalPercentage() !== 100}
              className="w-full bg-primary hover:bg-primary/90 text-white font-antic font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getTotalPercentage() === 100 ? 'Confirm Selection' : `Select ${100 - getTotalPercentage()}% More`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BorrowSection;