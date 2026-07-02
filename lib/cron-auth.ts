import { timingSafeEqual } from 'crypto'

/** Fail closed: reject all cron requests when CRON_SECRET is missing. */
export function authorizeCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const header = request.headers.get('authorization')
  if (!header) return false

  const expected = `Bearer ${secret}`
  if (header.length !== expected.length) return false

  try {
    return timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  } catch {
    return false
  }
}
