import 'server-only'

import { fetchAuthProviders } from '@/lib/auth-providers'

export type AdminAuthStatus = {
  googleEnabled: boolean
  emailEnabled: boolean
}

export async function getAdminAuthStatus(): Promise<AdminAuthStatus> {
  const providers = await fetchAuthProviders()
  return {
    googleEnabled: providers.google,
    emailEnabled: providers.email,
  }
}
