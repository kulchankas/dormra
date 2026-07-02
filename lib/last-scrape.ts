import { createClient } from '@/lib/supabase/server'

/** Latest successful or attempted scrape timestamp across all dorms. */
export async function getLastScrapeTime(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('availability_snapshots')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return data?.scraped_at ?? null
  } catch {
    return null
  }
}
