import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

function getClient(): AnyClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars are not set.')
  return createClient(url, key)
}

let _client: AnyClient | undefined

export const supabase: AnyClient = new Proxy({} as AnyClient, {
  get(_target, prop) {
    if (!_client) _client = getClient()
    return (_client as unknown as Record<string, unknown>)[prop as string]
  },
})
