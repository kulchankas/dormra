import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright-core', '@sparticuz/chromium-min'],
  outputFileTracingIncludes: {
    '/api/cron/scrape': ['./node_modules/playwright-core/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'oeadstudenthousing-public-production.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'www.stuwo.at' },
      { protocol: 'https', hostname: 'www.home4students.at' },
      { protocol: 'https', hostname: 'www.oejab.at' },
    ],
  },
}

export default withNextIntl(nextConfig)
