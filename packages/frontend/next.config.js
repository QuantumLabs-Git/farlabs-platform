/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['farlabs.ai', 'ipfs.io', 'gateway.pinata.cloud'],
    formats: ['image/avif', 'image/webp']
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.farlabs.ai',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.farlabs.ai',
    NEXT_PUBLIC_BSC_RPC: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org/',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '56',
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}

module.exports = nextConfig