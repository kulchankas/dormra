import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'oeadstudenthousing-public-production.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'www.stuwo.at' },
      { protocol: 'https', hostname: 'www.home4students.at' },
    ],
  },
}

export default nextConfig
