import { toast as sonnerToast } from 'sonner';

/**
 * Professional Toast Notification System
 * Clean, user-friendly messages for all app interactions
 */

export const toast = {
  // ============ Success Messages ============

  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  mintSuccess: (assetType: string, amount: number, txHash?: string) => {
    sonnerToast.success('Tokens Minted Successfully', {
      description: `${amount} ${assetType} RWA tokens have been minted to your wallet${txHash ? ` (${txHash.slice(0, 8)}...)` : ''}`,
      duration: 5000,
    });
  },

  stakeSuccess: (assetType: string, amount: number) => {
    sonnerToast.success('Staking Successful', {
      description: `${amount} ${assetType} tokens staked. You'll start earning yield immediately.`,
      duration: 4000,
    });
  },

  unstakeSuccess: (assetType: string, amount: number, yieldClaimed?: number) => {
    const yieldMsg = yieldClaimed ? ` Yield claimed: $${yieldClaimed.toFixed(2)} USDC.` : '';
    sonnerToast.success('Unstaking Successful', {
      description: `${amount} ${assetType} tokens returned to your wallet.${yieldMsg}`,
      duration: 4000,
    });
  },

  claimYieldSuccess: (amount: number) => {
    sonnerToast.success('Yield Claimed', {
      description: `$${amount.toFixed(2)} USDC has been transferred to your wallet.`,
      duration: 4000,
    });
  },

  borrowSuccess: (amount: number, healthFactor: number) => {
    sonnerToast.success('Loan Originated Successfully', {
      description: `$${amount.toFixed(2)} USDC borrowed. Health Factor: ${healthFactor.toFixed(0)}%`,
      duration: 5000,
    });
  },

  repaySuccess: (amount: number, remaining: number) => {
    const msg = remaining === 0
      ? 'Loan fully repaid! Your collateral is now available.'
      : `$${amount.toFixed(2)} repaid. Remaining debt: $${remaining.toFixed(2)}`;
    sonnerToast.success('Repayment Successful', {
      description: msg,
      duration: 4000,
    });
  },

  // ============ Error Messages ============

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  insufficientBalance: (assetType: string) => {
    sonnerToast.error('Insufficient Balance', {
      description: `You don't have enough ${assetType} tokens for this transaction.`,
      duration: 4000,
    });
  },

  transactionFailed: (reason?: string) => {
    sonnerToast.error('Transaction Failed', {
      description: reason || 'The transaction could not be completed. Please try again.',
      duration: 5000,
    });
  },

  walletNotConnected: () => {
    sonnerToast.error('Wallet Not Connected', {
      description: 'Please connect your wallet to continue.',
      duration: 3000,
    });
  },

  contractError: (operation: string) => {
    sonnerToast.error('Contract Error', {
      description: `Failed to ${operation}. Please check your connection and try again.`,
      duration: 5000,
    });
  },

  healthFactorTooLow: (current: number, minimum: number) => {
    sonnerToast.error('Health Factor Too Low', {
      description: `Your health factor (${current.toFixed(0)}%) is below the minimum required (${minimum}%).`,
      duration: 5000,
    });
  },

  // ============ Warning Messages ============

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  lowHealthFactor: (healthFactor: number) => {
    sonnerToast.warning('Low Health Factor Warning', {
      description: `Your health factor is ${healthFactor.toFixed(0)}%. Consider adding collateral or repaying debt.`,
      duration: 6000,
    });
  },

  approvalRequired: (assetType: string) => {
    sonnerToast.warning('Approval Required', {
      description: `Please approve the vault to spend your ${assetType} tokens before staking.`,
      duration: 5000,
    });
  },

  simulationMode: () => {
    sonnerToast.info('Simulation Mode', {
      description: 'This action is simulated locally. Real contract integration coming soon.',
      duration: 3000,
    });
  },

  // ============ Info Messages ============

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  processing: (message: string = 'Processing Transaction') => {
    sonnerToast.loading(message, {
      description: 'Please wait while we process your request...',
      duration: Infinity, // Manual dismissal
      id: 'processing-toast',
    });
  },

  dismissProcessing: () => {
    sonnerToast.dismiss('processing-toast');
  },

  transactionSubmitted: (txHash: string) => {
    sonnerToast.info('Transaction Submitted', {
      description: `Transaction hash: ${txHash.slice(0, 12)}...`,
      duration: 4000,
    });
  },

  networkSwitch: (network: string) => {
    sonnerToast.info('Network Detected', {
      description: `Connected to ${network}`,
      duration: 3000,
    });
  },

  // ============ Promise-based Toasts ============

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  // ============ Custom Action Toasts ============

  custom: {
    reviewTransaction: (action: string, onConfirm: () => void, onCancel: () => void) => {
      sonnerToast(`Review ${action}`, {
        description: 'Please review the details before confirming.',
        duration: 10000,
        action: {
          label: 'Confirm',
          onClick: onConfirm,
        },
        cancel: {
          label: 'Cancel',
          onClick: onCancel,
        },
      });
    },
  },
};

export default toast;
