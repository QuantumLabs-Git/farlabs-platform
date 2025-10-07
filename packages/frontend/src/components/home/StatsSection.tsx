'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Stat {
  label: string
  value: string
  prefix?: string
  suffix?: string
  decimals?: number
}

const stats: Stat[] = [
  { label: 'Total Value Locked', value: '1250000000', prefix: '$', decimals: 0 },
  { label: 'Active GPU Nodes', value: '12543', suffix: '+', decimals: 0 },
  { label: 'Daily Transactions', value: '450000', suffix: '+', decimals: 0 },
  { label: 'Platform Revenue', value: '8500000', prefix: '$', suffix: '/mo', decimals: 0 },
  { label: 'Staking APY', value: '25.5', suffix: '%', decimals: 1 },
  { label: 'Network Uptime', value: '99.99', suffix: '%', decimals: 2 },
]

function AnimatedCounter({ end, prefix = '', suffix = '', decimals = 0 }: {
  end: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const duration = 2000

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)

      setCount(Math.floor(progress * end * Math.pow(10, decimals)) / Math.pow(10, decimals))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [end, decimals])

  return (
    <span>
      {prefix}{count.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-dark-bg to-dark-card/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          onViewportEnter={() => setIsVisible(true)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                {isVisible ? (
                  <AnimatedCounter
                    end={parseFloat(stat.value)}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                ) : (
                  '0'
                )}
              </div>
              <div className="text-sm text-dark-text">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}