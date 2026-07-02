import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type LegacyClient = SupabaseClient<Database>

function getClient(): LegacyClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars are not set.')
  return createClient<Database>(url, key)
}

let _client: LegacyClient | undefined

/**
 * @deprecated Prefer `createClient()` from `@/lib/supabase/server` (RSC/actions)
 * or `@/lib/supabase/client` (browser). Kept for legacy call sites that cannot
 * be async (e.g. default param in availability helpers).
 */
export const supabase: LegacyClient = new Proxy({} as LegacyClient, {
  get(_target, prop) {
    if (!_client) _client = getClient()
    return (_client as unknown as Record<string, unknown>)[prop as string]
  },
})
