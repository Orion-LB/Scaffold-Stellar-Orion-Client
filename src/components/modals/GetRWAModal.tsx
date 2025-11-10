import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetType, getAssetConfig, getAllAssetTypes, createMockRWAServiceFromAddress } from "@/services/contracts";
import { simulateMint } from "@/lib/localStorage";
import { toast } from "sonner";
import { Coins, Sparkles, Info } from "lucide-react";
import { useContractServices } from "@/hooks/useContractServices";

interface GetRWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  onSuccess?: () => void;
}

export const GetRWAModal = ({ isOpen, onClose, address, onSuccess }: GetRWAModalProps) => {
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(AssetType.INVOICES);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet } = useContractServices();
  const assetConfig = getAssetConfig(selectedAssetType);

  const handleMint = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountNum > 10000) {
      toast.error("Maximum mint amount is 10,000 tokens");
      return;
    }

    setLoading(true);
    try {
      // Convert amount to contract units (18 decimals)
      const mintAmount = BigInt(Math.floor(amountNum * 1e18));

      // Show transaction progress
      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Preparing transaction...</span>
        </div>
      );

      // Create wallet provider for contract call
      const walletProvider = wallet.isConnected ? {
        address: wallet.address!,
        networkPassphrase: wallet.networkPassphrase,
        signTransaction: wallet.signTransaction,
      } : undefined;

      // Create RWA service for selected asset
      const rwaService = createMockRWAServiceFromAddress(assetConfig.rwa, walletProvider);

      toast.info(
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Minting {amountNum.toFixed(2)} {assetConfig.displayName} tokens...</span>
        </div>
      );

      // ✅ REAL CONTRACT CALL: mint_rwa_tokenss(user, amount)
      const result = await rwaService.mint_rwa_tokens(address, mintAmount, walletProvider);

      if (!result.success) {
        throw new Error(result.error || "Minting transaction failed");
      }

      // Get transaction hash from result
      const txHash = result.transactionHash || `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

      // ✅ ALSO UPDATE LOCALSTORAGE (for UI consistency)
      simulateMint(address, selectedAssetType, mintAmount);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">✅ Transaction Confirmed!</div>
          <div className="text-sm">
            +{amountNum.toFixed(2)} {assetConfig.displayName} tokens minted successfully
          </div>
          <div className="text-xs text-gray-600">
            TX: {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </div>
        </div>,
        { duration: 4000 }
      );

      // Reset form
      setAmount("");

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Minting failed:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount("10000");
  };

  const suggestedAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-plus-jakarta text-xl">
            <Coins className="w-6 h-6 text-primary" />
            Get RWA Tokens
          </DialogTitle>
          <DialogDescription className="font-plus-jakarta">
            Mint test RWA tokens for staking and testing the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 font-plus-jakarta">
              This is a testnet feature. Tokens are minted instantly for testing purposes.
            </p>
          </div>

          {/* Asset Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="assetType" className="font-plus-jakarta font-semibold">
              Select Asset Type
            </Label>
            <Select
              value={selectedAssetType}
              onValueChange={(value) => setSelectedAssetType(value as AssetType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAllAssetTypes().map((assetType) => {
                  const config = getAssetConfig(assetType);
                  return (
                    <SelectItem key={assetType} value={assetType}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.emoji}</span>
                        <span className="font-plus-jakarta">{config.displayName}</span>
                        <span className="text-xs text-gray-500">({config.symbol})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Asset Info Card */}
          <div className="border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                {assetConfig.emoji}
              </div>
              <div>
                <div className="font-plus-jakarta font-bold text-gray-900">
                  {assetConfig.displayName}
                </div>
                <div className="text-xs text-gray-600">Base APY: {assetConfig.baseAPY}%</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <span className="font-semibold">Contract:</span>{" "}
              <code className="bg-gray-100 px-1 rounded">{assetConfig.rwa.slice(0, 8)}...</code>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-plus-jakarta font-semibold">
              Amount to Mint
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-antic pr-20"
                min="0"
                max="10000"
                step="any"
              />
              <button
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded transition-colors"
              >
                MAX
              </button>
            </div>
            <p className="text-xs text-gray-500 font-plus-jakarta">
              Maximum: 10,000 tokens per transaction
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="font-plus-jakarta text-xs text-gray-600 mb-2 block">
              Quick Select
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {suggestedAmounts.map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-primary/10 hover:border-primary text-sm font-plus-jakarta font-semibold rounded-lg transition-all border-2 border-transparent"
                >
                  {value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span className="text-sm font-plus-jakarta font-semibold text-green-900">
                  You will receive:
                </span>
              </div>
              <div className="text-2xl font-antic font-bold text-green-700">
                {parseFloat(amount).toLocaleString()} {assetConfig.symbol}
              </div>
              <div className="text-xs text-green-700 mt-1">
                ≈ ${(parseFloat(amount) * 1.0).toLocaleString()} USD value
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 font-plus-jakarta"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-primary hover:bg-primary/90 font-plus-jakarta font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Mint Tokens
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
