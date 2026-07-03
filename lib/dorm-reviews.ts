import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { REVIEW_TAGS, MAX_TAGS_PER_REVIEW, sanitizeReviewTags, computeTagCounts, type ReviewTag } from './review-tags'

type DbClient = SupabaseClient<Database>

export const REVIEW_BODY_MIN_LENGTH = 10
export const REVIEW_BODY_MAX_LENGTH = 2000

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(REVIEW_BODY_MIN_LENGTH).max(REVIEW_BODY_MAX_LENGTH),
  tags: z.array(z.enum(REVIEW_TAGS)).max(MAX_TAGS_PER_REVIEW).optional().default([]),
})

export type ReviewInput = z.infer<typeof reviewInputSchema>

export const REPORT_REASONS = ['spam', 'harassment', 'false_info', 'off_topic', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export function isReportReason(value: string): value is ReportReason {
  return (REPORT_REASONS as readonly string[]).includes(value)
}

export type DormReview = {
  id: string
  dormId: string
  pseudonym: string
  rating: number
  body: string
  tags: ReviewTag[]
  createdAt: string
  updatedAt: string
  hidden: boolean
  isOwn: boolean
}

export type DormRatingSummary = {
  average: number | null
  count: number
}

const EMPTY_SUMMARY: DormRatingSummary = { average: null, count: 0 }

/** Pure aggregation — no rounding here, callers format for display. */
export function computeRatingSummary(ratings: number[]): DormRatingSummary {
  if (ratings.length === 0) return EMPTY_SUMMARY
  const sum = ratings.reduce((total, rating) => total + rating, 0)
  return { average: sum / ratings.length, count: ratings.length }
}

type ReviewRow = {
  id: string
  dorm_id: string
  user_id: string
  pseudonym: string
  rating: number
  body: string
  tags: string[]
  hidden: boolean
  created_at: string
  updated_at: string
}

function rowToReview(row: ReviewRow, viewerUserId: string | null): DormReview {
  return {
    id: row.id,
    dormId: row.dorm_id,
    pseudonym: row.pseudonym,
    rating: row.rating,
    body: row.body,
    tags: sanitizeReviewTags(row.tags ?? []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hidden: row.hidden,
    isOwn: viewerUserId != null && row.user_id === viewerUserId,
  }
}

/**
 * Reviews for one dorm, ordered newest first. Relies on RLS to include the
 * viewer's own review even if it's currently hidden pending moderation —
 * see the "own_reviews_read" policy in the migration.
 */
export async function getDormReviews(
  dormId: string,
  db: DbClient,
  viewerUserId: string | null = null,
): Promise<DormReview[]> {
  const { data, error } = await db
    .from('dorm_reviews')
    .select('id, dorm_id, user_id, pseudonym, rating, body, tags, hidden, created_at, updated_at')
    .eq('dorm_id', dormId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((row) => rowToReview(row, viewerUserId))
}

/** Most-mentioned tags across a dorm's visible reviews, for a "frequently mentioned" summary. */
export async function getDormTagCounts(dormId: string, db: DbClient) {
  const { data, error } = await db.from('dorm_reviews').select('tags').eq('dorm_id', dormId).eq('hidden', false)
  if (error || !data) return []
  return computeTagCounts(data.map((row) => row.tags ?? []))
}

/**
 * Bulk rating summaries (average + count of *visible* reviews) for many
 * dorms in one round trip — mirrors `getAvailabilityStatusBulk`'s shape so
 * the directory grid doesn't issue one query per card.
 */
export async function getDormRatingSummaries(
  dormIds: string[],
  db: DbClient,
): Promise<Map<string, DormRatingSummary>> {
  if (dormIds.length === 0) return new Map()

  const { data, error } = await db
    .from('dorm_reviews')
    .select('dorm_id, rating')
    .eq('hidden', false)
    .in('dorm_id', dormIds)

  if (error || !data) return new Map()

  const ratingsByDorm = new Map<string, number[]>()
  for (const row of data) {
    const ratings = ratingsByDorm.get(row.dorm_id) ?? []
    ratings.push(row.rating)
    ratingsByDorm.set(row.dorm_id, ratings)
  }

  const summaries = new Map<string, DormRatingSummary>()
  for (const [dormId, ratings] of ratingsByDorm) {
    summaries.set(dormId, computeRatingSummary(ratings))
  }
  return summaries
}

export async function getDormRatingSummary(dormId: string, db: DbClient): Promise<DormRatingSummary> {
  const summaries = await getDormRatingSummaries([dormId], db)
  return summaries.get(dormId) ?? EMPTY_SUMMARY
}

export function ratingSummaryMapToRecord(
  map: Map<string, DormRatingSummary>,
): Record<string, DormRatingSummary> {
  return Object.fromEntries(map)
}
