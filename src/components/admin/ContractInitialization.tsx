import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AssetType } from "@/services/contracts";

const ContractInitialization = () => {
  const [initializingVault, setInitializingVault] = useState<string | null>(null);
  const [initializedVaults, setInitializedVaults] = useState<Set<string>>(new Set());

  const vaults = [
    {
      id: "vault_invoices",
      name: "Invoice Vault",
      assetType: AssetType.INVOICES,
      rwaToken: "CCHUQ75...FBFVV",
      stRwaToken: "CCCTL6U...PJUS",
      vaultAddress: "CB3I43A...H2TT",
    },
    {
      id: "vault_tbills",
      name: "T-Bills Vault",
      assetType: AssetType.TBILLS,
      rwaToken: "Pending deployment",
      stRwaToken: "Pending deployment",
      vaultAddress: "Pending deployment",
    },
    {
      id: "vault_realestate",
      name: "Real Estate Vault",
      assetType: AssetType.REALESTATE,
      rwaToken: "Pending deployment",
      stRwaToken: "Pending deployment",
      vaultAddress: "Pending deployment",
    },
  ];

  const handleInitialize = async (vaultId: string, vaultName: string) => {
    setInitializingVault(vaultId);

    try {
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      setInitializedVaults(prev => new Set([...prev, vaultId]));
      toast.success(`${vaultName} initialized successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Initialization failed");
    } finally {
      setInitializingVault(null);
    }
  };

  const canInitialize = (vault: any) => {
    return !vault.rwaToken.includes("Pending") &&
           !vault.stRwaToken.includes("Pending") &&
           !vault.vaultAddress.includes("Pending");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
          Contract Initialization
        </h2>
        <p className="text-gray-600">
          Initialize vaults with token pairs and configuration
        </p>
      </div>

      {/* Initialization Progress */}
      <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            Initialization Progress
          </span>
          <span className="text-sm font-semibold text-primary">
            {initializedVaults.size} / 3 vaults
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(initializedVaults.size / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Vault Initialization */}
      <div className="space-y-4">
        {vaults.map((vault) => {
          const isInitialized = initializedVaults.has(vault.id);
          const isInitializing = initializingVault === vault.id;
          const readyToInitialize = canInitialize(vault);

          return (
            <div
              key={vault.id}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isInitialized ? "bg-green-100" : "bg-gray-100"
                  }`}>
                    {isInitialized ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Database className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900">
                        {vault.name}
                      </h3>
                      {isInitialized && (
                        <div className="px-2 py-0.5 bg-green-100 rounded text-green-700 text-xs font-semibold">
                          Initialized
                        </div>
                      )}
                      {!readyToInitialize && !isInitialized && (
                        <div className="px-2 py-0.5 bg-yellow-100 rounded text-yellow-700 text-xs font-semibold">
                          Awaiting Deployment
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Asset Type: {vault.assetType}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleInitialize(vault.id, vault.name)}
                  disabled={!readyToInitialize || isInitialized || isInitializing}
                  className={isInitialized ? "" : "bg-primary hover:bg-primary/90"}
                  variant={isInitialized ? "outline" : "default"}
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : isInitialized ? (
                    "Initialized"
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Initialize
                    </>
                  )}
                </Button>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">RWA Token</div>
                  <code className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded block">
                    {vault.rwaToken}
                  </code>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">stRWA Token</div>
                  <code className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded block">
                    {vault.stRwaToken}
                  </code>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Vault Address</div>
                  <code className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded block">
                    {vault.vaultAddress}
                  </code>
                </div>
              </div>

              {/* Initialization Parameters */}
              {isInitialized && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-800">
                    <strong>Initialization Parameters:</strong>
                    <ul className="mt-2 space-y-1 ml-4 list-disc">
                      <li>Admin: {`0x...${Math.random().toString(36).substring(7)}`}</li>
                      <li>USDC Token: CAXHQJ6...ZGS</li>
                      <li>Lending Pool: CBJM554...WT5Y</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-plus-jakarta text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Initialization Checklist
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Ensure all tokens (RWA + stRWA) are deployed before initialization</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Vault contract must be deployed and address saved</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Admin wallet must have sufficient XLM for transaction fees</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Initialize vaults before funding or oracle configuration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInitialization;
