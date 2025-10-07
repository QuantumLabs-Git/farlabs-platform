'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface RevenueStream {
  id: string
  name: string
  enabled: boolean
  monthlyBase: number
  growthRate: number
  icon: string
}

export function RevenueCalculator() {
  const [stakingAmount, setStakingAmount] = useState(10000)
  const [stakingPeriod, setStakingPeriod] = useState(12)
  const [streams, setStreams] = useState<RevenueStream[]>([
    {
      id: 'inference',
      name: 'Far Inference',
      enabled: true,
      monthlyBase: 0.08,
      growthRate: 1.05,
      icon: '🧠'
    },
    {
      id: 'gpu',
      name: 'Far GPU De-Pin',
      enabled: true,
      monthlyBase: 0.06,
      growthRate: 1.15,
      icon: '🖥️'
    },
    {
      id: 'gaming',
      name: 'Farcana Game',
      enabled: false,
      monthlyBase: 0.04,
      growthRate: 1.03,
      icon: '🎮'
    },
    {
      id: 'desci',
      name: 'Far DeSci',
      enabled: false,
      monthlyBase: 0.02,
      growthRate: 1.02,
      icon: '🧪'
    },
    {
      id: 'gamed',
      name: 'Far GameD',
      enabled: false,
      monthlyBase: 0.03,
      growthRate: 1.04,
      icon: '🏆'
    },
    {
      id: 'fartwin',
      name: 'FarTwin AI',
      enabled: false,
      monthlyBase: 0.05,
      growthRate: 1.08,
      icon: '👥'
    }
  ])

  const projectedRevenue = useMemo(() => {
    const data = []
    let cumulative = 0

    for (let month = 0; month <= stakingPeriod; month++) {
      let monthlyRevenue = 0

      streams.forEach(stream => {
        if (stream.enabled) {
          const baseRevenue = stakingAmount * stream.monthlyBase
          const growthMultiplier = Math.pow(stream.growthRate, month)
          monthlyRevenue += baseRevenue * growthMultiplier
        }
      })

      cumulative += monthlyRevenue

      data.push({
        month,
        monthly: monthlyRevenue,
        cumulative: cumulative,
        roi: (cumulative / stakingAmount) * 100
      })
    }

    return data
  }, [stakingAmount, streams, stakingPeriod])

  const toggleStream = (id: string) => {
    setStreams(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    )
  }

  const finalRevenue = projectedRevenue[stakingPeriod] || projectedRevenue[projectedRevenue.length - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-2xl p-8 border border-dark-border"
    >
      <h3 className="text-3xl font-bold text-white mb-8">
        Revenue Forecast Calculator
      </h3>

      {/* Revenue Stream Selection */}
      <div className="mb-8">
        <h4 className="text-xl text-white mb-4">Select Revenue Streams</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {streams.map(stream => (
            <label
              key={stream.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                stream.enabled
                  ? 'bg-primary-600/10 border-primary-500'
                  : 'bg-dark-hover border-dark-border hover:border-dark-text'
              }`}
            >
              <input
                type="checkbox"
                checked={stream.enabled}
                onChange={() => toggleStream(stream.id)}
                className="w-5 h-5 rounded border-dark-border bg-dark-hover
                         checked:bg-primary-600 checked:border-primary-600"
              />
              <span className="text-2xl">{stream.icon}</span>
              <span className={stream.enabled ? 'text-white' : 'text-dark-text'}>
                {stream.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Staking Controls */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-dark-text mb-2">
            Staking Amount ($FAR)
          </label>
          <input
            type="number"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(Math.max(0, Number(e.target.value)))}
            className="w-full bg-dark-hover border border-dark-border rounded-lg
                     px-4 py-3 text-white focus:border-primary-500
                     focus:outline-none transition-colors"
          />
          <div className="mt-2 flex gap-2">
            {[1000, 5000, 10000, 50000].map(amount => (
              <button
                key={amount}
                onClick={() => setStakingAmount(amount)}
                className="px-3 py-1 text-sm bg-dark-hover rounded hover:bg-primary-600/20
                         text-dark-text hover:text-white transition-all"
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-dark-text mb-2">
            Staking Period: {stakingPeriod} months
          </label>
          <input
            type="range"
            min="1"
            max="36"
            value={stakingPeriod}
            onChange={(e) => setStakingPeriod(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="mt-2 flex justify-between text-sm text-dark-text">
            <span>1 mo</span>
            <span>12 mo</span>
            <span>24 mo</span>
            <span>36 mo</span>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-hover rounded-xl p-6">
          <p className="text-dark-text mb-2">Total Investment</p>
          <p className="text-3xl font-bold text-white">
            ${stakingAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-dark-hover rounded-xl p-6">
          <p className="text-dark-text mb-2">Monthly Revenue</p>
          <p className="text-3xl font-bold text-yellow-400">
            ${Math.round(finalRevenue.monthly).toLocaleString()}
          </p>
        </div>

        <div className="bg-dark-hover rounded-xl p-6">
          <p className="text-dark-text mb-2">Total Returns</p>
          <p className="text-3xl font-bold gradient-text">
            ${Math.round(finalRevenue.cumulative).toLocaleString()}
          </p>
        </div>

        <div className="bg-dark-hover rounded-xl p-6">
          <p className="text-dark-text mb-2">ROI</p>
          <p className="text-3xl font-bold text-green-400">
            {finalRevenue.roi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Revenue Chart Preview */}
      <div className="bg-dark-hover rounded-xl p-6">
        <h4 className="text-xl text-white mb-4">Revenue Projection</h4>
        <div className="h-64 flex items-end gap-1">
          {projectedRevenue.map((data, index) => {
            const height = (data.cumulative / finalRevenue.cumulative) * 100
            return (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t
                         hover:from-primary-500 hover:to-primary-300 transition-all"
                style={{ height: `${height}%` }}
                title={`Month ${index}: $${Math.round(data.cumulative).toLocaleString()}`}
              />
            )
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm text-dark-text">
          <span>Month 0</span>
          <span>Month {Math.floor(stakingPeriod / 2)}</span>
          <span>Month {stakingPeriod}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-sm text-dark-text text-center">
        * These are estimated projections based on current platform metrics.
        Actual returns may vary based on market conditions and platform performance.
      </p>
    </motion.div>
  )
}