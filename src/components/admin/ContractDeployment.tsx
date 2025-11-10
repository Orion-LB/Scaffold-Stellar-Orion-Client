import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Server, Upload, CheckCircle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { AssetType, getAllAssetTypes } from "@/services/contracts";

const ContractDeployment = () => {
  const [deployingContract, setDeployingContract] = useState<string | null>(null);
  const [deployedAddresses, setDeployedAddresses] = useState<Record<string, string>>({});

  const contracts = [
    {
      category: "RWA Tokens",
      items: [
        { id: "rwa_invoices", name: "Invoice RWA Token", wasm: "rwa_token.wasm", assetType: AssetType.INVOICES },
        { id: "rwa_tbills", name: "T-Bills RWA Token", wasm: "rwa_token.wasm", assetType: AssetType.TBILLS },
        { id: "rwa_realestate", name: "Real Estate RWA Token", wasm: "rwa_token.wasm", assetType: AssetType.REALESTATE },
      ],
    },
    {
      category: "stRWA Tokens",
      items: [
        { id: "strwa_invoices", name: "Invoice stRWA Token", wasm: "strwa_token.wasm", assetType: AssetType.INVOICES },
        { id: "strwa_tbills", name: "T-Bills stRWA Token", wasm: "strwa_token.wasm", assetType: AssetType.TBILLS },
        { id: "strwa_realestate", name: "Real Estate stRWA Token", wasm: "strwa_token.wasm", assetType: AssetType.REALESTATE },
      ],
    },
    {
      category: "Vaults",
      items: [
        { id: "vault_invoices", name: "Invoice Vault", wasm: "vault.wasm", assetType: AssetType.INVOICES },
        { id: "vault_tbills", name: "T-Bills Vault", wasm: "vault.wasm", assetType: AssetType.TBILLS },
        { id: "vault_realestate", name: "Real Estate Vault", wasm: "vault.wasm", assetType: AssetType.REALESTATE },
      ],
    },
  ];

  const handleDeploy = async (contractId: string, contractName: string) => {
    setDeployingContract(contractId);

    try {
      // Simulate deployment (replace with actual Stellar deployment)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock address
      const mockAddress = `C${Math.random().toString(36).substring(2, 15).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      setDeployedAddresses(prev => ({
        ...prev,
        [contractId]: mockAddress,
      }));

      toast.success(`${contractName} deployed successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Deployment failed");
    } finally {
      setDeployingContract(null);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const handleDeployAll = async () => {
    toast.info("Starting bulk deployment...");
    for (const category of contracts) {
      for (const contract of category.items) {
        if (!deployedAddresses[contract.id]) {
          await handleDeploy(contract.id, contract.name);
        }
      }
    }
    toast.success("All contracts deployed!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-plus-jakarta text-2xl font-bold text-gray-900 mb-2">
            Contract Deployment
          </h2>
          <p className="text-gray-600">
            Deploy RWA, stRWA, and Vault contracts for multi-asset platform
          </p>
        </div>
        <Button
          onClick={handleDeployAll}
          className="bg-primary hover:bg-primary/90"
          disabled={deployingContract !== null}
        >
          <Upload className="w-4 h-4 mr-2" />
          Deploy All
        </Button>
      </div>

      {/* Deployment Progress */}
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            Deployment Progress
          </span>
          <span className="text-sm font-semibold text-primary">
            {Object.keys(deployedAddresses).length} / 9 contracts
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(deployedAddresses).length / 9) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contract Categories */}
      <div className="space-y-6">
        {contracts.map((category) => (
          <div key={category.category} className="border border-gray-200 rounded-lg p-6 bg-white">
            <h3 className="font-plus-jakarta text-lg font-semibold text-gray-900 mb-4">
              {category.category}
            </h3>
            <div className="space-y-3">
              {category.items.map((contract) => {
                const isDeployed = !!deployedAddresses[contract.id];
                const isDeploying = deployingContract === contract.id;

                return (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDeployed ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        {isDeployed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Server className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">
                            {contract.name}
                          </div>
                          {isDeployed && (
                            <div className="px-2 py-0.5 bg-green-100 rounded text-green-700 text-xs font-semibold">
                              Deployed
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 font-mono mt-1">
                          WASM: {contract.wasm}
                        </div>
                        {isDeployed && deployedAddresses[contract.id] && (
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {deployedAddresses[contract.id]}
                            </code>
                            <button
                              onClick={() => handleCopyAddress(deployedAddresses[contract.id])}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeploy(contract.id, contract.name)}
                      disabled={isDeployed || isDeploying}
                      variant={isDeployed ? "outline" : "default"}
                      className={isDeployed ? "" : "bg-primary hover:bg-primary/90"}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : isDeployed ? (
                        "Deployed"
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Deploy
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Deployment Instructions */}
      <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
        <h3 className="font-plus-jakarta text-sm font-semibold text-blue-900 mb-3">
          📋 Deployment Instructions
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>1.</strong> Deploy all RWA tokens first (Invoice, T-Bills, Real Estate)
          </p>
          <p>
            <strong>2.</strong> Deploy corresponding stRWA tokens for each asset type
          </p>
          <p>
            <strong>3.</strong> Deploy Vault contracts for each asset type
          </p>
          <p>
            <strong>4.</strong> Copy and save all contract addresses for initialization step
          </p>
          <p className="text-xs text-blue-600 mt-3">
            Note: Each contract will be deployed to Stellar Testnet. Make sure you have sufficient XLM for fees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractDeployment;
