import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, Send, Wallet, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const FundingManagement = () => {
  const [fundingAmount, setFundingAmount] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [selectedVault, setSelectedVault] = useState("lending_pool");
  const [isFunding, setIsFunding] = useState(false);

  const fundingTargets = [
    {
      id: "lending_pool",
      name: "Lending Pool",
      address: "CBJM554...WT5Y",
      currentBalance: "50,000",
      required: "100,000",
      type: "pool",
    },
    {
      id: "vault_invoices",
      name: "Invoice Vault",
      address: "CB3I43A...H2TT",
      currentBalance: "10,000",
      required: "25,000",
      type: "vault",
    },
    {
      id: "vault_tbills",
      name: "T-Bills Vault",
      address: "Pending",
      currentBalance: "0",
      required: "25,000",
      type: "vault",
    },
    {
      id: "vault_realestate",
      name: "Real Estate Vault",
      address: "Pending",
      currentBalance: "0",
      required: "25,000",
      type: "vault",
    },
  ];

  const handleFundLiquidityPool = async () => {
    if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsFunding(true);
    try {
      // Simulate funding transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully funded ${fundingAmount} USDC to Lending Pool!`);
      setFundingAmount("");
    } catch (error: any) {
      toast.error(error.message || "Funding failed");
    } finally {
      setIsFunding(false);
    }
  };

  const handleFundYield = async () => {
    if (!yieldAmount || parseFloat(yieldAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const target = fundingTargets.find(t => t.id === selectedVault);
    if (!target || target.type !== "vault") {
      toast.error("Please select a valid vault");
      return;
    }

    setIsFunding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully funded ${yieldAmount} USDC yield to ${target.name}!`);
      setYieldAmount("");
    } catch (error: any) {
      toast.error(error.message || "Yield funding failed");
    } finally {
      setIsFunding(false);
    }
  };

  const selectedTarget = fundingTargets.find(t => t.id === selectedVault);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
          Funding Management
        </h2>
        <p className="text-gray-600">
          Fund lending pool and vaults with USDC for operations
        </p>
      </div>

      {/* Funding Overview */}
      <div className="grid grid-cols-4 gap-4">
        {fundingTargets.map((target) => {
          const percentage = (parseFloat(target.currentBalance.replace(/,/g, '')) / parseFloat(target.required.replace(/,/g, ''))) * 100;

          return (
            <div
              key={target.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedVault(target.id)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                target.type === "pool" ? "bg-purple-100" : "bg-blue-100"
              }`}>
                {target.type === "pool" ? (
                  <Wallet className="w-5 h-5 text-purple-600" />
                ) : (
                  <DollarSign className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {target.name}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                ${target.currentBalance} / ${target.required}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Fund Lending Pool */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
                Fund Lending Pool
              </h3>
              <p className="text-xs text-gray-600">
                Add USDC liquidity for loans
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Amount (USDC)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-semibold">$50,000 USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target Balance:</span>
                <span className="font-semibold">$100,000 USDC</span>
              </div>
            </div>

            <Button
              onClick={handleFundLiquidityPool}
              disabled={isFunding || !fundingAmount}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {isFunding ? "Funding..." : "Fund Lending Pool"}
            </Button>
          </div>
        </div>

        {/* Fund Vault Yield */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
                Fund Vault Yield
              </h3>
              <p className="text-xs text-gray-600">
                Add USDC for staking rewards
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Vault
              </label>
              <select
                value={selectedVault}
                onChange={(e) => setSelectedVault(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {fundingTargets.filter(t => t.type === "vault").map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    {vault.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Yield Amount (USDC)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={yieldAmount}
                  onChange={(e) => setYieldAmount(e.target.value)}
                  placeholder="Enter yield amount"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {selectedTarget && selectedTarget.type === "vault" && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vault Balance:</span>
                  <span className="font-semibold">${selectedTarget.currentBalance} USDC</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleFundYield}
              disabled={isFunding || !yieldAmount || selectedTarget?.type !== "vault"}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isFunding ? "Funding..." : "Fund Vault Yield"}
            </Button>
          </div>
        </div>
      </div>

      {/* Funding History */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
          Recent Funding Transactions
        </h3>
        <div className="space-y-3">
          {[
            { target: "Lending Pool", amount: "25,000", date: "2 hours ago", type: "pool" },
            { target: "Invoice Vault", amount: "10,000", date: "1 day ago", type: "yield" },
            { target: "Lending Pool", amount: "25,000", date: "3 days ago", type: "pool" },
          ].map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === "pool" ? "bg-purple-100" : "bg-green-100"
                }`}>
                  {tx.type === "pool" ? (
                    <Wallet className="w-4 h-4 text-purple-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{tx.target}</div>
                  <div className="text-xs text-gray-600">{tx.date}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                +${tx.amount} USDC
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FundingManagement;
