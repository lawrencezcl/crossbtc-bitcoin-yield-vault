'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AtomiqSDKProvider } from '@/services/atomiq-sdk'
import { loadAtomiqConfig } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CrossBTC - Bitcoin Yield Vault',
  description: 'Earn yield on your Bitcoin with instant Lightning Network access',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Load configuration from environment variables
  const config = loadAtomiqConfig()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AtomiqSDKProvider
          config={config}
          onInitialized={(sdk) => {
            console.log('Atomiq SDK initialized successfully')
          }}
          onError={(error) => {
            console.error('Failed to initialize Atomiq SDK:', error)
          }}
        >
          {children}
        </AtomiqSDKProvider>
      </body>
    </html>
  )
}