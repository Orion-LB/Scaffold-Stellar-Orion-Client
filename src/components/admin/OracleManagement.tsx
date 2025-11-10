import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AssetType, getAllAssetTypes, getAssetConfig } from "@/services/contracts";

const OracleManagement = () => {
  const [prices, setPrices] = useState<Record<AssetType, string>>({
    [AssetType.INVOICES]: "1.05",
    [AssetType.TBILLS]: "1.02",
    [AssetType.REALESTATE]: "1.08",
  });
  const [updatingAsset, setUpdatingAsset] = useState<AssetType | null>(null);

  const handleUpdatePrice = async (assetType: AssetType) => {
    const price = prices[assetType];
    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setUpdatingAsset(assetType);
    try {
      // Simulate oracle price update
      await new Promise(resolve => setTimeout(resolve, 1500));

      const config = getAssetConfig(assetType);
      toast.success(`Updated ${config.displayName} price to $${price}`);
    } catch (error: any) {
      toast.error(error.message || "Price update failed");
    } finally {
      setUpdatingAsset(null);
    }
  };

  const handleUpdateAllPrices = async () => {
    toast.info("Updating all oracle prices...");
    for (const assetType of getAllAssetTypes()) {
      await handleUpdatePrice(assetType);
    }
    toast.success("All prices updated successfully!");
  };

  const priceHistory = [
    { asset: "Invoice RWA", price: "1.05", change: "+0.03%", timestamp: "2 min ago" },
    { asset: "T-Bills Vault", price: "1.02", change: "+0.01%", timestamp: "5 min ago" },
    { asset: "Real Estate", price: "1.08", change: "-0.02%", timestamp: "8 min ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
            Oracle Management
          </h2>
          <p className="text-gray-600">
            Set and monitor prices for RWA assets
          </p>
        </div>
        <Button
          onClick={handleUpdateAllPrices}
          className="bg-primary hover:bg-primary/90"
          disabled={updatingAsset !== null}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Update All Prices
        </Button>
      </div>

      {/* Price Configuration */}
      <div className="grid grid-cols-3 gap-4">
        {getAllAssetTypes().map((assetType) => {
          const config = getAssetConfig(assetType);
          const isUpdating = updatingAsset === assetType;
          const currentPrice = prices[assetType];

          return (
            <div
              key={assetType}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{config.emoji}</div>
                <div>
                  <h3 className="font-plus-jakarta text-base font-semibold text-gray-900">
                    {config.displayName}
                  </h3>
                  <p className="text-xs text-gray-600">{config.symbol}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Current Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentPrice}
                    onChange={(e) =>
                      setPrices((prev) => ({ ...prev, [assetType]: e.target.value }))
                    }
                    className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-antic text-lg font-bold"
                  />
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Expected Yield:</span>
                  <span className="font-semibold">{config.baseAPY}% APY</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold">2 min ago</span>
                </div>
              </div>

              <Button
                onClick={() => handleUpdatePrice(assetType)}
                disabled={isUpdating}
                className="w-full bg-primary hover:bg-primary/90"
                size="sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 mr-2" />
                    Update Price
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Oracle Status */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
          Oracle Status
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                Oracle Active
              </span>
            </div>
            <p className="text-xs text-green-700">
              All price feeds operational
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                Update Interval
              </span>
            </div>
            <p className="text-xs text-blue-700">Every 60 seconds</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">
                Total Updates
              </span>
            </div>
            <p className="text-xs text-purple-700">1,234 today</p>
          </div>
        </div>
      </div>

      {/* Price History */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
          Recent Price Updates
        </h3>
        <div className="space-y-3">
          {priceHistory.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {item.asset}
                </div>
                <div className="text-xs text-gray-600">{item.timestamp}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  ${item.price}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    item.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Configuration */}
      <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-plus-jakarta text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Oracle Bot Configuration
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Status:</strong> Running and updating prices every 60 seconds
          </p>
          <p>
            <strong>Data Sources:</strong> Primary API + Fallback prices configured
          </p>
          <p>
            <strong>Contract:</strong> CD5XYT6...FJJC6AZ
          </p>
          <p className="text-xs text-blue-600 mt-3">
            Manual price updates will override bot prices for 5 minutes before
            resuming automatic updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OracleManagement;
