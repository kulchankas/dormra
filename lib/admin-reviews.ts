import 'server-only'
import { createAdminClient } from './supabase/admin'

export type ReportedReview = {
  id: string
  dormId: string
  dormName: string
  dormSlug: string
  pseudonym: string
  rating: number
  body: string
  hidden: boolean
  createdAt: string
  reportCount: number
  reasons: string[]
}

/**
 * Reviews that have at least one report, newest-most-reported first. Uses
 * the service-role client because reading `dorm_review_reports` (who
 * reported what) is intentionally not exposed to regular users via RLS —
 * see docs/COMMUNITY_REVIEWS.md §4.
 */
export async function getReportedReviews(): Promise<ReportedReview[]> {
  const admin = createAdminClient()

  const { data: reports } = await admin.from('dorm_review_reports').select('review_id, reason')
  if (!reports?.length) return []

  const reviewIds = [...new Set(reports.map((r) => r.review_id))]
  const { data: reviews } = await admin
    .from('dorm_reviews')
    .select('id, dorm_id, pseudonym, rating, body, hidden, created_at')
    .in('id', reviewIds)
  if (!reviews?.length) return []

  const dormIds = [...new Set(reviews.map((r) => r.dorm_id))]
  const { data: dorms } = await admin.from('dorms').select('id, name, slug').in('id', dormIds)
  const dormById = new Map((dorms ?? []).map((d) => [d.id, d]))

  const reasonsByReview = new Map<string, string[]>()
  for (const report of reports) {
    const reasons = reasonsByReview.get(report.review_id) ?? []
    reasons.push(report.reason)
    reasonsByReview.set(report.review_id, reasons)
  }

  return reviews
    .map((review) => {
      const dorm = dormById.get(review.dorm_id)
      const reasons = reasonsByReview.get(review.id) ?? []
      return {
        id: review.id,
        dormId: review.dorm_id,
        dormName: dorm?.name ?? 'Unknown dorm',
        dormSlug: dorm?.slug ?? '',
        pseudonym: review.pseudonym,
        rating: review.rating,
        body: review.body,
        hidden: review.hidden,
        createdAt: review.created_at,
        reportCount: reasons.length,
        reasons,
      }
    })
    .sort((a, b) => b.reportCount - a.reportCount)
}
