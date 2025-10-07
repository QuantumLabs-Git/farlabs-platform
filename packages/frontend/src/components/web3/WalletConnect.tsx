'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal: any) => {
    if (!bal) return '0'
    return parseFloat(bal.formatted).toFixed(4)
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-sm text-dark-text">Balance</div>
          <div className="text-sm font-semibold text-white">
            {formatBalance(balance)} BNB
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-dark-hover border border-dark-border rounded-lg
                   text-white hover:bg-dark-card transition-all flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {formatAddress(address)}
        </button>

        {/* Wallet Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-20 right-4 z-50 bg-dark-card border border-dark-border
                         rounded-xl p-6 w-80 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Wallet</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-dark-text mb-1">Address</div>
                    <div className="text-white font-mono text-sm break-all">{address}</div>
                  </div>

                  <div>
                    <div className="text-sm text-dark-text mb-1">Balance</div>
                    <div className="text-white font-semibold">{formatBalance(balance)} BNB</div>
                  </div>

                  <button
                    onClick={() => {
                      disconnect()
                      setShowModal(false)
                    }}
                    className="w-full px-4 py-2 bg-red-600/10 border border-red-600/30
                             text-red-400 rounded-lg hover:bg-red-600/20 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg
                 font-semibold text-white hover:from-primary-700 hover:to-primary-600
                 transition-all duration-300 shadow-lg hover:shadow-primary-500/30"
      >
        Connect Wallet
      </button>

      {/* Connect Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                       z-50 bg-dark-card border border-dark-border rounded-xl p-6 w-96
                       shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Connect Wallet</h3>

              <div className="space-y-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => {
                      connect({ connector })
                      setShowModal(false)
                    }}
                    disabled={!connector.ready || isLoading}
                    className="w-full px-4 py-3 bg-dark-hover border border-dark-border
                             rounded-lg text-white hover:bg-primary-600/10 hover:border-primary-500/50
                             transition-all flex items-center justify-between group"
                  >
                    <span>{connector.name}</span>
                    {isLoading && pendingConnector?.id === connector.id && (
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent
                                    rounded-full animate-spin" />
                    )}
                    {!connector.ready && <span className="text-dark-text text-sm">Unsupported</span>}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error.message}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}