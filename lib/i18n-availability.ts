import type { AvailabilityStatus } from './availability'

type TranslateFn = (key: 'available' | 'fullyBooked' | 'unknown') => string

export function localizeAvailability(
  status: AvailabilityStatus,
  t: TranslateFn,
): AvailabilityStatus {
  return {
    status: status.status,
    label: t(
      status.status === 'available'
        ? 'available'
        : status.status === 'fully_booked'
          ? 'fullyBooked'
          : 'unknown',
    ),
  }
}

export function localizeAvailabilityMap(
  map: Map<string, AvailabilityStatus>,
  t: TranslateFn,
): Map<string, AvailabilityStatus> {
  return new Map(
    [...map.entries()].map(([id, status]) => [id, localizeAvailability(status, t)]),
  )
}

export function localizeAvailabilityRecord(
  record: Record<string, AvailabilityStatus>,
  t: TranslateFn,
): Record<string, AvailabilityStatus> {
  return Object.fromEntries(
    Object.entries(record).map(([id, status]) => [id, localizeAvailability(status, t)]),
  )
}
