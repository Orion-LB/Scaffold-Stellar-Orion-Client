export type NetworkType = "testnet" | "mainnet" | "futurenet" | "custom";

export type Network = {
  id: NetworkType;
  label: string;
  horizonUrl: string;
  horizonHeaderName?: string;
  horizonHeaderValue?: string;
  rpcUrl: string;
  rpcHeaderName?: string;
  rpcHeaderValue?: string;
  passphrase: string;
};