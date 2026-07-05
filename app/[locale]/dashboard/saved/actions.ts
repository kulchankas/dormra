'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isTrackerStatus, type TrackerStatus } from '@/lib/tracker'

export async function toggleSavedDorm(dormId: string): Promise<{ saved: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { saved: false, error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('tracker')
    .select('id')
    .eq('user_id', user.id)
    .eq('dorm_id', dormId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('tracker').delete().eq('id', existing.id)
    if (error) return { saved: true, error: error.message }
    revalidatePath('/dashboard/saved')
    revalidatePath('/dashboard')
    return { saved: false }
  }

  const { error } = await supabase.from('tracker').insert({
    user_id: user.id,
    dorm_id: dormId,
    status: 'interested',
  })
  if (error) return { saved: false, error: error.message }
  revalidatePath('/dashboard/saved')
  revalidatePath('/dashboard')
  return { saved: true }
}

export async function updateTrackerStatus(
  trackerId: string,
  status: TrackerStatus,
): Promise<{ error?: string }> {
  if (!isTrackerStatus(status)) return { error: 'Invalid status' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tracker')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', trackerId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/saved')
  return {}
}

/** Upsert tracker row and mark as applied when the user clicks Apply on a dorm. */
export async function recordApplyClick(dormId: string): Promise<{ trackerId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date().toISOString()
  const { data: existing } = await supabase
    .from('tracker')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('dorm_id', dormId)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'applied' || existing.status === 'accepted') {
      revalidatePath('/dashboard/saved')
      revalidatePath('/dashboard')
      return { trackerId: existing.id }
    }
    const { error } = await supabase
      .from('tracker')
      .update({ status: 'applied', updated_at: now })
      .eq('id', existing.id)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/saved')
    revalidatePath('/dashboard')
    return { trackerId: existing.id }
  }

  const { data: inserted, error } = await supabase
    .from('tracker')
    .insert({ user_id: user.id, dorm_id: dormId, status: 'applied', updated_at: now })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/saved')
  revalidatePath('/dashboard')
  return { trackerId: inserted.id }
}

export async function removeSavedDorm(trackerId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tracker')
    .delete()
    .eq('id', trackerId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/saved')
  revalidatePath('/dashboard')
  return {}
}
