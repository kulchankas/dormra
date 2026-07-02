import { getLastScrapeTime } from '@/lib/last-scrape'
import ScanningPill from '@/components/ScanningPill'

export default async function ScanningPillServer() {
  const lastScrapedAt = await getLastScrapeTime()
  return <ScanningPill lastScrapedAt={lastScrapedAt} />
}
