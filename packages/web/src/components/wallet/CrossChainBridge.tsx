/**
 * Cross-Chain Bridge Component
 * Handles Bitcoin to Starknet bridging via Chipi Pay
 */
import { useState, useEffect } from 'react';
import { Button, Card, Input, Select } from '@/components/ui';
import { useWallet } from '@/hooks/useWallet';
import { ChipiBridgeRoute } from '@/services/wallets';

export const CrossChainBridge: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('bitcoin');
  const [toChain, setToChain] = useState('starknet');
  const [recipient, setRecipient] = useState('');
  const [availableRoutes, setAvailableRoutes] = useState<ChipiBridgeRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<ChipiBridgeRoute | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    state,
    createPayment,
    getBridgeRoutes,
    isLoading,
    totalBalance,
  } = useWallet();

  // Load bridge routes when chains change
  useEffect(() => {
    if (fromChain && toChain && state.isChipiInitialized) {
      getBridgeRoutes(
        { fromChain, toChain, asset: 'BTC' },
        {
          onSuccess: (routes) => {
            setAvailableRoutes(routes);
            setSelectedRoute(routes.length > 0 ? routes[0] : null);
          },
        }
      );
    }
  }, [fromChain, toChain, state.isChipiInitialized, getBridgeRoutes]);

  const handleBridge = () => {
    if (!selectedRoute || !amount || !recipient) {
      return;
    }

    const bridgeRequest = {
      fromAddress: state.xverseAccount?.address || '',
      toAddress: recipient,
      amount: parseFloat(amount),
      asset: fromChain === 'starknet' ? 'STARKNET_BTC' : 'BTC',
      speed: 'normal' as const,
      message: `Cross-chain bridge from ${fromChain} to ${toChain}`,
    };

    createPayment(bridgeRequest, {
      onSuccess: () => {
        setShowConfirmation(false);
        setAmount('');
        setRecipient('');
      },
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return false;
    if (!selectedRoute) return false;
    return numAmount >= selectedRoute.minAmount && numAmount <= selectedRoute.maxAmount;
  };

  const estimatedFee = selectedRoute ? selectedRoute.fee.amount : 0;
  const totalAmount = parseFloat(amount || '0') + estimatedFee;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Cross-Chain Bridge</h3>
          <p className="text-sm text-gray-600">Bridge Bitcoin between chains</p>
        </div>
      </div>

      {!state.isReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            Please connect your wallet to use the bridge feature.
          </p>
        </div>
      )}

      {/* Chain Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Chain
          </label>
          <Select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            disabled={!state.isReady}
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="starknet">Starknet</option>
            <option value="lightning">Lightning</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Chain
          </label>
          <Select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            disabled={!state.isReady}
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="starknet">Starknet</option>
            <option value="lightning">Lightning</option>
          </Select>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (BTC)
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00000000"
          disabled={!state.isReady}
          rightIcon={
            <button
              type="button"
              onClick={() => setAmount(totalBalance.toString())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              MAX
            </button>
          }
        />

        {amount && selectedRoute && (
          <div className="mt-2 text-sm">
            {validateAmount() ? (
              <span className="text-green-600">✓ Valid amount</span>
            ) : (
              <span className="text-red-600">
                ✗ Amount must be between {selectedRoute.minAmount} and {selectedRoute.maxAmount} BTC
              </span>
            )}
          </div>
        )}
      </div>

      {/* Recipient Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipient Address
        </label>
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={`Enter ${toChain} address`}
          disabled={!state.isReady}
        />
      </div>

      {/* Route Information */}
      {selectedRoute && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-3">Bridge Route Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Time:</span>
              <span>{formatTime(selectedRoute.estimatedTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bridge Fee:</span>
              <span>{selectedRoute.fee.amount} {selectedRoute.fee.asset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Min Amount:</span>
              <span>{selectedRoute.minAmount} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Amount:</span>
              <span>{selectedRoute.maxAmount} BTC</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {amount && validateAmount() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">Transaction Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount to bridge:</span>
              <span>{amount} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bridge fee:</span>
              <span>{estimatedFee} BTC</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{totalAmount.toFixed(8)} BTC</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={() => setShowConfirmation(true)}
          disabled={!state.isReady || !validateAmount() || !recipient}
          loading={isLoading.creatingPayment}
          className="flex-1"
        >
          {isLoading.creatingPayment ? 'Processing...' : 'Bridge Assets'}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Bridge Transaction</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span>{fromChain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span>{toChain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span>{amount} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="text-sm font-mono">{recipient}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Cost:</span>
                <span>{totalAmount.toFixed(8)} BTC</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBridge}
                loading={isLoading.creatingPayment}
                className="flex-1"
              >
                Confirm Bridge
              </Button>
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