'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-bg to-primary-800/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="gradient-text">Far Labs</span>
            <br />
            <span className="text-white">Decentralized AI Infrastructure</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-dark-text mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Powering the future with blockchain-based AI inference, GPU computing,
            and multiple revenue streams through the $FAR ecosystem
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/staking"
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-semibold text-white hover:from-primary-700 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-primary-500/50"
            >
              Start Staking $FAR
            </Link>
            <Link
              href="/inference"
              className="px-8 py-4 bg-dark-card border border-dark-border rounded-lg font-semibold text-white hover:bg-dark-hover transition-all duration-300"
            >
              Try AI Inference
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$1B+</div>
              <div className="text-dark-text">Total Value Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10,000+</div>
              <div className="text-dark-text">GPU Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100K+</div>
              <div className="text-dark-text">Active Users</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg
          className="w-6 h-6 text-dark-text"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </section>
  )
}