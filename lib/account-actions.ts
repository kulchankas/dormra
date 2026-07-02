'use server'

import { getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from '@/i18n/navigation'
import { resolveLocale } from '@/lib/i18n-email'
import { z } from 'zod'

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export async function changePassword(password: string): Promise<{ error?: string }> {
  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { error: error.message }

  return {}
}

export type AccountExport = {
  exported_at: string
  email: string | undefined
  alerts: unknown[]
  alert_deliveries: unknown[]
}

export async function exportAccountData(): Promise<{ data?: AccountExport; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const [{ data: alerts, error: alertsError }, { data: deliveries, error: deliveriesError }] =
    await Promise.all([
      supabase.from('user_alerts').select('*').eq('user_id', user.id).order('created_at'),
      supabase
        .from('alert_log')
        .select('id, sent_at, channel, dorm_id, snapshot_id')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(500),
    ])

  if (alertsError) return { error: alertsError.message }
  if (deliveriesError) return { error: deliveriesError.message }

  return {
    data: {
      exported_at: new Date().toISOString(),
      email: user.email,
      alerts: alerts ?? [],
      alert_deliveries: deliveries ?? [],
    },
  }
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return { error: deleteError.message }

  await supabase.auth.signOut()
  const locale = resolveLocale(await getLocale())
  redirect({ href: '/', locale })
  return {}
}
