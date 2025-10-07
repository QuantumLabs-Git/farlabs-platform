'use client'

import { ReactNode } from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bsc, bscTestnet],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
}