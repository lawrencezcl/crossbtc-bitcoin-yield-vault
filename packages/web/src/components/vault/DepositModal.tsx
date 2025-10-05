'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bitcoin, Zap, AlertCircle, Copy, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { BitcoinAddress, LightningInvoice, BridgeQuote } from '@/types/atomiq'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: number, method: 'bitcoin' | 'lightning') => void
  loading?: boolean
  bitcoinAddress?: BitcoinAddress | null
  sdkStatus?: 'loading' | 'ready' | 'error'
}

export function DepositModal({
  isOpen,
  onClose,
  onDeposit,
  loading = false,
  bitcoinAddress: propBitcoinAddress,
  sdkStatus = 'ready'
}: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'bitcoin' | 'lightning'>('bitcoin')
  const [bitcoinAddress, setBitcoinAddress] = useState<BitcoinAddress | null>(propBitcoinAddress || null)
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoice | null>(null)
  const [bridgeQuote, setBridgeQuote] = useState<BridgeQuote | null>(null)
  const [depositStep, setDepositStep] = useState<'amount' | 'payment' | 'confirm'>('amount')
  const [copied, setCopied] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)

  const handleAmountChange = (value: string) => {
    // Only allow valid decimal input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleAmountChange = (value: string) => {
    // Only allow valid decimal input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      setBridgeQuote(null) // Reset quote when amount changes
    }
  }

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount)
    if (depositAmount > 0) {
      try {
        if (method === 'bitcoin' && sdkStatus === 'ready') {
          // Get bridge quote for Bitcoin deposits
          setQuoteLoading(true)
          const response = await onDeposit(depositAmount, method)

          if (response.bridgeDeposit) {
            setBridgeQuote(response.bridgeDeposit.quote)
            setBitcoinAddress({ address: response.bridgeDeposit.depositAddress } as BitcoinAddress)
            setDepositStep('payment')
          } else if (response.address) {
            // Direct Bitcoin address (fallback)
            setDepositStep('payment')
          }
        } else if (method === 'lightning' && sdkStatus === 'ready') {
          // Create Lightning invoice
          const response = await onDeposit(depositAmount, method)

          if (response.invoice) {
            setLightningInvoice(response.invoice)
            setDepositStep('payment')
          }
        } else {
          // Fallback to original behavior
          onDeposit(depositAmount, method)
        }
      } catch (error) {
        console.error('Deposit failed:', error)
        // Fall back to original behavior
        onDeposit(depositAmount, method)
      } finally {
        setQuoteLoading(false)
      }
    }
  }

  const handleCopyAddress = async () => {
    if (bitcoinAddress?.address) {
      await navigator.clipboard.writeText(bitcoinAddress.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyInvoice = async () => {
    if (lightningInvoice?.bolt11) {
      await navigator.clipboard.writeText(lightningInvoice.bolt11)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetModal = () => {
    setAmount('')
    setMethod('bitcoin')
    setDepositStep('amount')
    setLightningInvoice(null)
    setBridgeQuote(null)
    setCopied(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= 1000000

  // Update internal bitcoin address when prop changes
  useEffect(() => {
    if (propBitcoinAddress) {
      setBitcoinAddress(propBitcoinAddress)
    }
  }, [propBitcoinAddress])

  if (!isOpen) return null

  // Show payment step if we have address or invoice
  if (depositStep === 'payment' && (bitcoinAddress || lightningInvoice)) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {method === 'bitcoin' ? (
                <Bitcoin className="h-5 w-5 text-bitcoin-500" />
              ) : (
                <Zap className="h-5 w-5 text-blue-500" />
              )}
              {method === 'bitcoin' ? 'Send Bitcoin' : 'Pay Lightning Invoice'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {method === 'bitcoin' && bitcoinAddress && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Send {amount} BTC to:</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      value={bitcoinAddress.address}
                      readOnly
                      className="flex-1 bg-transparent border-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="p-2"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {bridgeQuote && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium">Bridge Details:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Output: {bridgeQuote.outputAmount.toFixed(8)} BTC on Starknet</div>
                      <div>Bridge Fee: {bridgeQuote.fees.bridge.toFixed(8)} BTC</div>
                      <div>Network Fee: {bridgeQuote.fees.network.toFixed(8)} BTC</div>
                      <div>Estimated Time: {bridgeQuote.estimatedTime} seconds</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Important</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send exactly {amount} BTC to the address above. Your deposit will be credited after 3 network confirmations.
                  </p>
                </div>
              </>
            )}

            {method === 'lightning' && lightningInvoice && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pay this Lightning Invoice:</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      value={lightningInvoice.bolt11}
                      readOnly
                      className="flex-1 bg-transparent border-none text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyInvoice}
                      className="p-2"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Lightning Network</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your payment will be credited instantly after the invoice is paid.
                  </p>
                </div>

                <div className="text-center p-3 bg-bitcoin-50 rounded-lg border border-bitcoin-200">
                  <div className="text-sm font-medium">Amount</div>
                  <div className="text-2xl font-bold text-bitcoin-600">
                    {amount} BTC
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${formatCurrency(parseFloat(amount) * 43000).replace('BTC', '').trim()}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => setDepositStep('amount')}
                className="flex-1"
              >
                New Deposit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-bitcoin-500" />
            Deposit Bitcoin
            {sdkStatus === 'ready' && (
              <Badge variant="secondary" className="text-xs">
                Real Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (BTC)</label>
            <Input
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00000000"
              className="text-lg font-mono"
              disabled={loading || quoteLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 0.0001 BTC</span>
              <span>Max: 10 BTC</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[0.001, 0.01, 0.1, 1].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => setAmount(value.toFixed(8))}
                className="font-mono"
              >
                {value} BTC
              </Button>
            ))}
          </div>

          {/* Deposit Method Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Deposit Method</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={method === 'bitcoin' ? 'default' : 'outline'}
                onClick={() => setMethod('bitcoin')}
                className={cn(
                  "flex flex-col items-center gap-2 h-auto p-4",
                  method === 'bitcoin' && "bitcoin-glow"
                )}
              >
                <Bitcoin className="h-6 w-6" />
                <span className="text-sm">Bitcoin</span>
                <span className="text-xs text-muted-foreground">
                  ~10-60 min
                </span>
              </Button>

              <Button
                variant={method === 'lightning' ? 'default' : 'outline'}
                onClick={() => setMethod('lightning')}
                className={cn(
                  "flex flex-col items-center gap-2 h-auto p-4",
                  method === 'lightning' && "bg-blue-500"
                )}
              >
                <Zap className="h-6 w-6" />
                <span className="text-sm">Lightning</span>
                <span className="text-xs text-muted-foreground">
                  Instant
                </span>
              </Button>
            </div>
          </div>

          {/* Method Information */}
          {method === 'bitcoin' && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Bitcoin Deposit</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Send Bitcoin to the generated address. Your deposit will be credited after 3 network confirmations (~30 minutes).
              </p>
            </div>
          )}

          {method === 'lightning' && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Lightning Network</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pay the Lightning invoice for instant deposit. Your funds will be available immediately.
              </p>
            </div>
          )}

          {/* Estimated Value */}
          {amount && isValidAmount && (
            <div className="p-3 bg-bitcoin-50 rounded-lg border border-bitcoin-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estimated USD Value</span>
                <span className="text-lg font-bold text-bitcoin-600">
                  ${formatCurrency(parseFloat(amount) * 43000).replace('BTC', '').trim()}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading || quoteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              className="flex-1 bitcoin-glow"
              disabled={!isValidAmount || loading || quoteLoading}
            >
              {loading || quoteLoading ? 'Processing...' : 'Deposit'}
            </Button>
          </div>

          {/* SDK Status Indicator */}
          {sdkStatus === 'error' && (
            <div className="space-y-2 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">SDK Error</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Using mock data. Some features may be unavailable.
              </p>
            </div>
          )}

          {sdkStatus === 'loading' && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Initializing SDK</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connecting to blockchain services...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}