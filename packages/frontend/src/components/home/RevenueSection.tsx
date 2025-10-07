'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { RevenueCalculator } from '@/components/revenue/RevenueCalculator'

export function RevenueSection() {
  const [activeTab, setActiveTab] = useState('calculator')

  return (
    <section className="py-20 px-4 bg-dark-card/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Maximize Your Returns</span>
          </h2>
          <p className="text-xl text-dark-text max-w-3xl mx-auto">
            Calculate your potential earnings across all revenue streams
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-dark-card rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-text hover:text-white'
              }`}
            >
              Revenue Calculator
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-text hover:text-white'
              }`}
            >
              Revenue Breakdown
            </button>
          </div>
        </div>

        {activeTab === 'calculator' ? (
          <RevenueCalculator />
        ) : (
          <RevenueBreakdown />
        )}
      </div>
    </section>
  )
}

function RevenueBreakdown() {
  const streams = [
    { name: 'Far Inference', percentage: 25, color: 'bg-purple-600' },
    { name: 'Far GPU De-Pin', percentage: 30, color: 'bg-yellow-600' },
    { name: 'Farcana Game', percentage: 15, color: 'bg-blue-600' },
    { name: 'Far DeSci', percentage: 10, color: 'bg-green-600' },
    { name: 'Far GameD', percentage: 8, color: 'bg-orange-600' },
    { name: 'FarTwin AI', percentage: 7, color: 'bg-indigo-600' },
    { name: 'Staking Rewards', percentage: 5, color: 'bg-purple-700' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-2xl p-8 border border-dark-border"
    >
      <h3 className="text-2xl font-bold text-white mb-6">Platform Revenue Distribution</h3>

      <div className="space-y-4">
        {streams.map((stream, index) => (
          <motion.div
            key={stream.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="w-32 text-dark-text">{stream.name}</div>
            <div className="flex-1">
              <div className="bg-dark-hover rounded-full h-8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stream.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full ${stream.color} flex items-center justify-end px-3`}
                >
                  <span className="text-white text-sm font-semibold">{stream.percentage}%</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-hover rounded-lg p-4">
          <div className="text-dark-text text-sm mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold text-white">$8.5M</div>
        </div>
        <div className="bg-dark-hover rounded-lg p-4">
          <div className="text-dark-text text-sm mb-1">Staker Rewards</div>
          <div className="text-2xl font-bold text-primary-400">$1.7M</div>
        </div>
        <div className="bg-dark-hover rounded-lg p-4">
          <div className="text-dark-text text-sm mb-1">Node Earnings</div>
          <div className="text-2xl font-bold text-yellow-400">$2.5M</div>
        </div>
        <div className="bg-dark-hover rounded-lg p-4">
          <div className="text-dark-text text-sm mb-1">Treasury</div>
          <div className="text-2xl font-bold text-green-400">$1.3M</div>
        </div>
      </div>
    </motion.div>
  )
}