'use server'

import { getLocale } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { resolveLocale } from '@/lib/i18n-email'

export type AlertPayload = {
  price_max: number | null
  districts: number[]
  move_in_before: string | null
  pets_required: boolean
  couples: boolean
  deposit_max: number | null
  notify_email: boolean
  notify_telegram: boolean
  telegram_chat_id: string | null
}

export async function createAlert(payload: AlertPayload): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const locale = resolveLocale(await getLocale())

  const { error } = await supabase.from('user_alerts').insert({
    user_id: user.id,
    price_max: payload.price_max,
    districts: payload.districts.length > 0 ? payload.districts : null,
    move_in_before: payload.move_in_before,
    pets_required: payload.pets_required,
    couples: payload.couples,
    deposit_max: payload.deposit_max,
    notify_email: payload.notify_email,
    notify_telegram: payload.notify_telegram,
    telegram_chat_id: payload.telegram_chat_id || null,
    locale,
    active: true,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alerts')
  revalidatePath('/dashboard')
  redirect({ href: '/dashboard/alerts', locale })
  return {}
}

export async function updateAlert(id: string, payload: AlertPayload): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const locale = resolveLocale(await getLocale())

  const { error } = await supabase
    .from('user_alerts')
    .update({
      price_max: payload.price_max,
      districts: payload.districts.length > 0 ? payload.districts : null,
      move_in_before: payload.move_in_before,
      pets_required: payload.pets_required,
      couples: payload.couples,
      deposit_max: payload.deposit_max,
      notify_email: payload.notify_email,
      notify_telegram: payload.notify_telegram,
      telegram_chat_id: payload.telegram_chat_id || null,
      locale,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alerts')
  revalidatePath('/dashboard')
  redirect({ href: '/dashboard/alerts', locale })
  return {}
}

export async function toggleAlertActive(id: string, active: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_alerts')
    .update({ active })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alerts')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteAlert(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/alerts')
  revalidatePath('/dashboard')
  return {}
}
