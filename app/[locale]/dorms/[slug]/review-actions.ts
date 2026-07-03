'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generatePseudonym } from '@/lib/pseudonym'
import { reviewInputSchema, isReportReason, type ReportReason } from '@/lib/dorm-reviews'

type ActionResult = { error?: string }

export async function createReview(
  dormSlug: string,
  dormId: string,
  input: { rating: number; body: string },
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = reviewInputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid review' }

  const { error } = await supabase.from('dorm_reviews').insert({
    dorm_id: dormId,
    user_id: user.id,
    pseudonym: generatePseudonym(),
    rating: parsed.data.rating,
    body: parsed.data.body,
  })

  if (error) {
    // Unique constraint on (dorm_id, user_id) — friendlier message than the raw DB error.
    if (error.code === '23505') return { error: 'already_reviewed' }
    return { error: error.message }
  }

  revalidatePath(`/dorms/${dormSlug}`)
  revalidatePath('/dorms')
  return {}
}

export async function updateReview(
  dormSlug: string,
  reviewId: string,
  input: { rating: number; body: string },
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = reviewInputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid review' }

  const { error } = await supabase
    .from('dorm_reviews')
    .update({
      rating: parsed.data.rating,
      body: parsed.data.body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dorms/${dormSlug}`)
  revalidatePath('/dorms')
  return {}
}

export async function deleteReview(dormSlug: string, reviewId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('dorm_reviews').delete().eq('id', reviewId).eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dorms/${dormSlug}`)
  revalidatePath('/dorms')
  return {}
}

export async function reportReview(
  reviewId: string,
  reason: ReportReason,
  details: string | null,
): Promise<ActionResult> {
  if (!isReportReason(reason)) return { error: 'Invalid reason' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('dorm_review_reports').insert({
    review_id: reviewId,
    reporter_user_id: user.id,
    reason,
    details: details?.trim() ? details.trim().slice(0, 500) : null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'already_reported' }
    return { error: error.message }
  }

  return {}
}
