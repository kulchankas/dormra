'use server'

import { getLocale } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { resolveLocale } from '@/lib/i18n-email'
import { parseAlertPayload } from '@/lib/alert-schema'

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

function validatePayload(payload: AlertPayload) {
  return parseAlertPayload({
    ...payload,
    move_in_before: payload.move_in_before || null,
  })
}

function validationError(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? 'Invalid alert data'
  }
  return 'Invalid alert data'
}

export async function createAlert(payload: AlertPayload): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  let validated
  try {
    validated = validatePayload(payload)
  } catch (err) {
    return { error: validationError(err) }
  }

  const locale = resolveLocale(await getLocale())

  const { error } = await supabase.from('user_alerts').insert({
    user_id: user.id,
    price_max: validated.price_max,
    districts: validated.districts.length > 0 ? validated.districts : null,
    move_in_before: validated.move_in_before,
    pets_required: validated.pets_required,
    couples: validated.couples,
    deposit_max: validated.deposit_max,
    notify_email: validated.notify_email,
    notify_telegram: validated.notify_telegram,
    telegram_chat_id: validated.telegram_chat_id || null,
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

  let validated
  try {
    validated = validatePayload(payload)
  } catch (err) {
    return { error: validationError(err) }
  }

  const locale = resolveLocale(await getLocale())

  const { error } = await supabase
    .from('user_alerts')
    .update({
      price_max: validated.price_max,
      districts: validated.districts.length > 0 ? validated.districts : null,
      move_in_before: validated.move_in_before,
      pets_required: validated.pets_required,
      couples: validated.couples,
      deposit_max: validated.deposit_max,
      notify_email: validated.notify_email,
      notify_telegram: validated.notify_telegram,
      telegram_chat_id: validated.telegram_chat_id || null,
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
