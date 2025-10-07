'use client'

import { ServiceCard } from './ServiceCard'
import { motion } from 'framer-motion'

const services = [
  {
    id: 'inference',
    icon: '🧠',
    title: 'Far Inference',
    description: 'Decentralized AI inference network for LLMs and machine learning models',
    href: '/inference',
    gradient: 'from-purple-600 to-pink-600',
    stats: { users: '50K+', requests: '10M+' }
  },
  {
    id: 'gaming',
    icon: '🎮',
    title: 'Farcana Game',
    description: 'Next-gen blockchain gaming ecosystem with play-to-earn mechanics',
    href: '/gaming',
    gradient: 'from-blue-600 to-cyan-600',
    stats: { players: '100K+', rewards: '$5M+' }
  },
  {
    id: 'desci',
    icon: '🧪',
    title: 'Far DeSci',
    description: 'Decentralized science platform for research collaboration and funding',
    href: '/desci',
    gradient: 'from-green-600 to-teal-600',
    stats: { projects: '500+', funding: '$10M+' }
  },
  {
    id: 'gamed',
    icon: '🏆',
    title: 'Far GameD',
    description: 'Game distribution platform with blockchain-based licensing',
    href: '/gamed',
    gradient: 'from-orange-600 to-red-600',
    stats: { games: '1K+', downloads: '5M+' }
  },
  {
    id: 'fartwin',
    icon: '👥',
    title: 'FarTwin AI',
    description: 'Digital twin AI platform for personalized virtual assistants',
    href: '/fartwin',
    gradient: 'from-indigo-600 to-purple-600',
    stats: { twins: '25K+', interactions: '100M+' }
  },
  {
    id: 'gpu',
    icon: '🖥️',
    title: 'Far GPU De-Pin',
    description: 'Decentralized GPU network for AI model training and computing',
    href: '/gpu',
    gradient: 'from-yellow-600 to-orange-600',
    stats: { nodes: '10K+', vram: '500TB+' }
  },
  {
    id: 'staking',
    icon: '💎',
    title: '$FAR Staking',
    description: 'Stake FAR tokens to earn rewards from all platform revenue streams',
    href: '/staking',
    gradient: 'from-purple-600 to-indigo-600',
    stats: { staked: '$500M+', apy: '15-30%' }
  }
]

export function ServiceGrid() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Seven Revenue Streams</span>
          </h2>
          <p className="text-xl text-dark-text max-w-3xl mx-auto">
            Multiple ways to earn with $FAR through our comprehensive ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}