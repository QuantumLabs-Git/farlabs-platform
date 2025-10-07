'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

interface ServiceCardProps {
  service: {
    id: string
    icon: string
    title: string
    description: string
    href: string
    gradient: string
    stats: {
      [key: string]: string | undefined
    }
  }
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      card.style.setProperty('--mouse-x', `${x}px`)
      card.style.setProperty('--mouse-y', `${y}px`)
    }

    card.addEventListener('mousemove', handleMouseMove)
    return () => card.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative"
    >
      <Link href={service.href}>
        <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8
                      overflow-hidden transition-all duration-300 hover:border-primary-500/50
                      hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] card-hover">

          {/* Gradient background on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                        transition-opacity duration-500">
            <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient}
                          opacity-5`} />
          </div>

          {/* Mouse follow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100
                       transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y),
                         rgba(168, 85, 247, 0.06), transparent 40%)`
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="text-5xl mb-4 grayscale contrast-200 opacity-80
                          group-hover:opacity-100 transition-opacity">
              {service.icon}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">
              {service.title}
            </h3>

            <p className="text-dark-text leading-relaxed mb-4">
              {service.description}
            </p>

            {/* Stats */}
            <div className="flex gap-4 mb-4">
              {Object.entries(service.stats)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <div className="text-primary-400 font-semibold">{value}</div>
                    <div className="text-dark-text capitalize">{key}</div>
                  </div>
                ))}
            </div>

            <div className="flex items-center text-primary-400 font-semibold
                          group-hover:text-primary-300 transition-colors">
              <span className="group-hover:translate-x-2 transition-transform">
                Explore →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}