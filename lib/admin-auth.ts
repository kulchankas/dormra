import type { Locale } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-emails'

export { getAdminEmails, isAdminEmail } from '@/lib/admin-emails'

export async function requireAdmin(locale: Locale) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login?redirect=/admin', locale })
    return null
  }

  if (!isAdminEmail(user.email)) {
    redirect({ href: '/', locale })
    return null
  }

  return user
}
