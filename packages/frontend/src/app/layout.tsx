import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Far Labs - Decentralized AI Infrastructure',
  description: 'The ultimate Web3 platform for AI inference, GPU computing, and decentralized science',
  keywords: 'AI, blockchain, GPU, decentralized, inference, Web3, FAR token',
  openGraph: {
    title: 'Far Labs - Decentralized AI Infrastructure',
    description: 'The ultimate Web3 platform for AI inference and GPU computing',
    url: 'https://farlabs.ai',
    siteName: 'Far Labs',
    images: [
      {
        url: 'https://farlabs.ai/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Far Labs - Decentralized AI Infrastructure',
    description: 'The ultimate Web3 platform for AI inference and GPU computing',
    images: ['https://farlabs.ai/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-bg text-white`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #2D2D2D',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}