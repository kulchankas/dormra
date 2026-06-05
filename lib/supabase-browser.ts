import { createBrowserClient } from '@supabase/ssr'

// SSR-aware browser client — stores session in cookies so the server can read it.
// Use this (not lib/supabase.ts) for all auth operations on the client side.
export const supabaseAuth = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
