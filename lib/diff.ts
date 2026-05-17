import { supabase } from './supabase'
import type { ScraperResult } from '@/scrapers/types'

export async function processSnapshot(dormId: string, result: ScraperResult): Promise<void> {
  // 1. Insert the new snapshot
  const { data: inserted, error: insertError } = await supabase
    .from('availability_snapshots')
    .insert({
      dorm_id: dormId,
      available: result.available,
      rooms_count: result.roomsCount,
      raw_text: result.rawText,
      scrape_ok: result.scrapeOk,
      error_msg: result.errorMsg,
    })
    .select('id, scraped_at')
    .single()

  if (insertError || !inserted) {
    console.error(`[SNAPSHOT] Insert failed for dorm ${dormId}:`, insertError?.message)
    return
  }

  // 2. Fetch the previous snapshot (the one just before the row we inserted)
  const { data: previous } = await supabase
    .from('availability_snapshots')
    .select('available, scraped_at')
    .eq('dorm_id', dormId)
    .lt('scraped_at', inserted.scraped_at)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single()

  // 3. Detect newly-available transitions
  const wasUnavailable = !previous || previous.available === false
  if (wasUnavailable && result.available) {
    // TODO: trigger alerts (email / Telegram) here
    console.log(`[DIFF] ${dormId} became available`)
  }
}
