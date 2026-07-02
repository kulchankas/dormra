export function isNewlyAvailableTransition(
  previous: { available: boolean } | null,
  result: { available: boolean; scrapeOk: boolean },
): boolean {
  if (!result.scrapeOk) return false
  if (!previous) return false
  return previous.available === false && result.available === true
}
