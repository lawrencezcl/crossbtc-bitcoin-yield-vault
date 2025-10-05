import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bitcoin address validation
export function isValidBitcoinAddress(address: string): boolean {
  try {
    // Basic validation for bech32 addresses (bc1, tb1)
    const bech32Regex = /^(bc1|tb1)[a-z0-9]{8,87}$/i
    if (bech32Regex.test(address)) {
      return true
    }

    // Legacy address validation (base58check)
    const base58Regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
    return base58Regex.test(address)
  } catch {
    return false
  }
}

// Lightning invoice validation
export function isValidLightningInvoice(invoice: string): boolean {
  try {
    // Basic validation for BOLT11 invoices - more lenient pattern
    const bolt11Regex = /^ln(bc|tb)[a-z0-9]{100,}$/
    return bolt11Regex.test(invoice.toLowerCase())
  } catch {
    return false
  }
}

// Format satoshi to BTC
export function satoshiToBTC(satoshi: number): string {
  return (satoshi / 100000000).toFixed(8)
}

// Format BTC to satoshi
export function btcToSatoshi(btc: number): number {
  return Math.floor(btc * 100000000)
}

// Format currency display
export function formatCurrency(
  amount: number,
  currency = 'BTC',
  decimals = 8
): string {
  if (currency === 'BTC') {
    return `${amount.toFixed(decimals)} BTC`
  }
  if (decimals === 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// Time ago formatter
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`
  return `${Math.floor(seconds / 2592000)} months ago`
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}