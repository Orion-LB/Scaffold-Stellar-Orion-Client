import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { wallet } from "../util/wallet";
import storage from "../util/storage";
import type { StellarWalletProvider, SignOptions, SignedTransaction } from "../services/contracts/ContractService";

export interface WalletContextType extends StellarWalletProvider {
  network?: string;
  isPending: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const initialState = {
  address: "",
  network: undefined,
  networkPassphrase: "",
  isConnected: false,
};

const POLL_INTERVAL = 1000;

export const WalletContext = // eslint-disable-line react-refresh/only-export-components
  createContext<WalletContextType>({
    address: "",
    networkPassphrase: "",
    isPending: true,
    isConnected: false,
    signTransaction: async () => ({ signedTxXdr: "" }),
    connect: async () => {},
    disconnect: async () => {},
  });

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] =
    useState<Omit<WalletContextType, "isPending" | "connect" | "disconnect" | "signTransaction">>(initialState);
  const [isPending, startTransition] = useTransition();
  const popupLock = useRef(false);

  const nullify = () => {
    updateState(initialState);
    storage.setItem("walletId", "");
    storage.setItem("walletAddress", "");
    storage.setItem("walletNetwork", "");
    storage.setItem("networkPassphrase", "");
  };

  // Soroban-compatible sign transaction function
  const signTransaction = async (xdr: string, options: SignOptions): Promise<SignedTransaction> => {
    try {
      const result = await wallet.signTransaction(xdr, {
        address: options.address,
        networkPassphrase: options.networkPassphrase,
      });
      
      // Handle different return types from different wallets
      let signedTxXdr: string;
      if (typeof result === 'string') {
        signedTxXdr = result;
      } else if (result && typeof result === 'object' && 'signedTxXdr' in result) {
        signedTxXdr = result.signedTxXdr;
      } else {
        throw new Error('Invalid signature result format');
      }
      
      return { signedTxXdr };
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  };

  const connect = async () => {
    try {
      const { connectWallet } = await import("../util/wallet");
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      const { disconnectWallet } = await import("../util/wallet");
      await disconnectWallet();
      nullify();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error;
    }
  };

  const updateState = (newState: Omit<WalletContextType, "isPending" | "connect" | "disconnect" | "signTransaction">) => {
    setState((prev: Omit<WalletContextType, "isPending" | "connect" | "disconnect" | "signTransaction">) => {
      if (
        prev.address !== newState.address ||
        prev.network !== newState.network ||
        prev.networkPassphrase !== newState.networkPassphrase ||
        prev.isConnected !== newState.isConnected
      ) {
        return newState;
      }
      return prev;
    });
  };

  const updateCurrentWalletState = async () => {
    // There is no way, with StellarWalletsKit, to check if the wallet is
    // installed/connected/authorized. We need to manage that on our side by
    // checking our storage item.
    const walletId = storage.getItem("walletId");
    const walletNetwork = storage.getItem("walletNetwork");
    const walletAddr = storage.getItem("walletAddress");
    const passphrase = storage.getItem("networkPassphrase");

    if (
      !state.address &&
      walletAddr !== null &&
      walletNetwork !== null &&
      passphrase !== null
    ) {
      updateState({
        address: walletAddr,
        network: walletNetwork,
        networkPassphrase: passphrase,
        isConnected: true,
      });
    }

    if (!walletId) {
      nullify();
    } else {
      if (popupLock.current) return;
      // If our storage item is there, then we try to get the user's address &
      // network from their wallet. Note: `getAddress` MAY open their wallet
      // extension, depending on which wallet they select!
      try {
        popupLock.current = true;
        wallet.setWallet(walletId);
        if (walletId !== "freighter" && walletAddr !== null) return;
        const [a, n] = await Promise.all([
          wallet.getAddress(),
          wallet.getNetwork(),
        ]);

        if (!a.address) storage.setItem("walletId", "");
        if (
          a.address !== state.address ||
          n.network !== state.network ||
          n.networkPassphrase !== state.networkPassphrase
        ) {
          storage.setItem("walletAddress", a.address);
          updateState({ 
            ...a, 
            ...n, 
            isConnected: Boolean(a.address)
          });
        }
      } catch (e) {
        // If `getNetwork` or `getAddress` throw errors... sign the user out???
        nullify();
        // then log the error (instead of throwing) so we have visibility
        // into the error while working on Scaffold Stellar but we do not
        // crash the app process
        console.error(e);
      } finally {
        popupLock.current = false;
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    // Create recursive polling function to check wallet state continuously
    const pollWalletState = async () => {
      if (!isMounted) return;

      await updateCurrentWalletState();

      if (isMounted) {
        timer = setTimeout(() => void pollWalletState(), POLL_INTERVAL);
      }
    };

    // Get the wallet address when the component is mounted for the first time
    startTransition(async () => {
      await updateCurrentWalletState();
      // Start polling after initial state is loaded

      if (isMounted) {
        timer = setTimeout(() => void pollWalletState(), POLL_INTERVAL);
      }
    });

    // Clear the timeout and stop polling when the component unmounts
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps -- it SHOULD only run once per component mount

  const contextValue = useMemo(
    () => ({
      ...state,
      isPending,
      signTransaction,
      connect,
      disconnect,
    }),
    [state, isPending],
  );

  return <WalletContext value={contextValue}>{children}</WalletContext>;
};
