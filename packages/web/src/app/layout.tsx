'use client'

import './globals.css'

// For Next.js 12.3.4, metadata is handled differently
export const metadata = {
  title: 'CrossBTC - Bitcoin Yield Vault',
  description: 'Earn yield on your Bitcoin with instant Lightning Network access',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Atomiq SDK will be initialized later */}
        <div>{children}</div>
      </body>
    </html>
  )
}