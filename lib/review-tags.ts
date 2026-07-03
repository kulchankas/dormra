/**
 * Quick-select tags for The Grapevine reviews. The set is deliberately small
 * and drawn from real, recurring vocabulary in Vienna student housing
 * reviews (see docs/RESEARCH_STUDENT_VOICE.md) rather than a generic list —
 * every entry here shows up near-verbatim across multiple independent
 * sources of student feedback.
 */
export const REVIEW_TAGS = [
  'thin_walls',
  'slow_repairs',
  'responsive_staff',
  'unreliable_wifi',
  'reliable_wifi',
  'messy_kitchen',
  'clean',
  'great_location',
  'party_dorm',
  'quiet_dorm',
  'friendly_community',
  'small_rooms',
] as const

export type ReviewTag = (typeof REVIEW_TAGS)[number]

export const MAX_TAGS_PER_REVIEW = 6

export function isReviewTag(value: string): value is ReviewTag {
  return (REVIEW_TAGS as readonly string[]).includes(value)
}

export function sanitizeReviewTags(tags: readonly string[]): ReviewTag[] {
  const unique = [...new Set(tags)].filter(isReviewTag)
  return unique.slice(0, MAX_TAGS_PER_REVIEW)
}

export type TagCount = { tag: ReviewTag; count: number }

/** Aggregate tag frequency across a dorm's visible reviews, most-mentioned first. */
export function computeTagCounts(reviewTags: readonly (readonly string[])[]): TagCount[] {
  const counts = new Map<ReviewTag, number>()
  for (const tags of reviewTags) {
    for (const tag of sanitizeReviewTags(tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
