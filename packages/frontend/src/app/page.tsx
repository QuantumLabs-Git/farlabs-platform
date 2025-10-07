'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { ServiceGrid } from '@/components/home/ServiceGrid'
import { StatsSection } from '@/components/home/StatsSection'
import { RevenueSection } from '@/components/home/RevenueSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <ServiceGrid />
      <RevenueSection />
    </div>
  )
}