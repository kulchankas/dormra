export const TRACKER_STATUSES = ['interested', 'applied', 'accepted', 'rejected'] as const

export type TrackerStatus = (typeof TRACKER_STATUSES)[number]

export function isTrackerStatus(value: string): value is TrackerStatus {
  return (TRACKER_STATUSES as readonly string[]).includes(value)
}

/** Display order for grouping the saved-dorms list — active statuses first. */
export const TRACKER_STATUS_ORDER: TrackerStatus[] = ['interested', 'applied', 'accepted', 'rejected']
