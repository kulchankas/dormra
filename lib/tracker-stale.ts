/** Days in `applied` before we nudge the user to update their status. */
export const STALE_APPLIED_DAYS = 14

export function isStaleAppliedStatus(
  updatedAt: string | Date,
  nowMs = Date.now(),
): boolean {
  const updatedMs =
    typeof updatedAt === 'string' ? new Date(updatedAt).getTime() : updatedAt.getTime()
  if (Number.isNaN(updatedMs)) return false
  return nowMs - updatedMs >= STALE_APPLIED_DAYS * 24 * 60 * 60 * 1000
}
