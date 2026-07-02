import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type AdminClient = SupabaseClient<Database>

/**
 * Server-side Supabase client using the service-role key.
 *
 * Bypasses RLS — only call this from trusted server contexts (route handlers,
 * server actions, cron jobs). NEVER import this module from a Client Component
 * or anywhere that ships to the browser. `server-only` enforces this at build
 * time.
 */
export function createAdminClient(): AdminClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
