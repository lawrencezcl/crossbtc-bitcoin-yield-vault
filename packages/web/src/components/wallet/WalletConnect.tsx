/**
 * Wallet Connect Component
 * Handles Xverse wallet connection and display
 */
import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { useWallet } from '@/hooks/useWallet';
import { XverseIcon, ChipiPayIcon } from '@/components/icons';

export const WalletConnect: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    state,
    isXverseAvailable,
    isReady,
    connectXverse,
    disconnectXverse,
    isLoading,
  } = useWallet();

  const handleConnect = () => {
    if (!isXverseAvailable) {
      window.open('https://xverse.app/', '_blank');
      return;
    }
    connectXverse();
  };

  const handleDisconnect = () => {
    disconnectXverse();
    setShowDetails(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(8);
  };

  if (!state.isXverseConnected) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <XverseIcon className="h-12 w-12 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-4">
            Connect your Xverse wallet to manage your Bitcoin vault
          </p>

          {!isXverseAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                Xverse wallet not detected. Please install the Xverse browser extension.
              </p>
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={isLoading.connectingXverse}
            className="w-full"
          >
            {isLoading.connectingXverse ? 'Connecting...' : 'Connect Xverse'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <XverseIcon className="h-8 w-8 text-orange-500" />
          <div>
            <h3 className="font-semibold">Xverse Wallet</h3>
            <p className="text-sm text-gray-600">
              {state.xverseAccount?.network || 'mainnet'} • {formatAddress(state.xverseAccount?.address || '')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {state.isChipiInitialized && (
            <div className="flex items-center space-x-1">
              <ChipiPayIcon className="h-5 w-5 text-green-500" />
              <span className="text-xs text-green-600">ChipiPay Ready</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Details'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">BTC Balance</p>
          <p className="font-semibold">
            {formatBalance(state.xverseAccount?.balance || 0)} BTC
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Total Assets</p>
          <p className="font-semibold">
            {formatBalance(state.chipiBalances?.reduce((sum, bal) => sum + bal.balance, 0) || 0)} BTC
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t pt-4 space-y-4">
          {/* Wallet Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Wallet Address</label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono break-all">
              {state.xverseAccount?.address}
            </div>
          </div>

          {/* Chipi Pay Balances */}
          {state.chipiBalances && state.chipiBalances.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Asset Balances</label>
              <div className="mt-2 space-y-2">
                {state.chipiBalances.map((balance, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{balance.asset}</span>
                    <span className="text-sm">
                      {formatBalance(balance.balance)} ({formatBalance(balance.available)} available)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Network</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              state.xverseAccount?.network === 'mainnet'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {state.xverseAccount?.network || 'mainnet'}
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}
    </Card>
  );
};