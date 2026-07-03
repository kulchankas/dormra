export type AuthProviders = {
  google: boolean
  email: boolean
}

type AuthSettingsResponse = {
  external?: {
    google?: boolean
    email?: boolean
  }
}

/** Fetch enabled auth providers from Supabase (public /auth/v1/settings). */
export async function fetchAuthProviders(
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
): Promise<AuthProviders> {
  if (!supabaseUrl || !anonKey) {
    return { google: false, email: true }
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      // Client-side: avoid caching a stale "google: false" after dashboard changes.
      cache: 'no-store',
    })

    if (!res.ok) {
      return { google: false, email: true }
    }

    const data = (await res.json()) as AuthSettingsResponse
    return {
      google: data.external?.google === true,
      email: data.external?.email !== false,
    }
  } catch {
    return { google: false, email: true }
  }
}
