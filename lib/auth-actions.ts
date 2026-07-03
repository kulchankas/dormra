'use server'

import { revalidatePath } from 'next/cache'
import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { resolveLocale } from '@/lib/i18n-email'

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  const locale = resolveLocale(await getLocale())
  redirect({ href: '/', locale })
}
