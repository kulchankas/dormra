import { cn } from '@/lib/utils'
import type { AvailabilityStatus } from '@/lib/availability'

type Props = {
  availability: AvailabilityStatus
  className?: string
}

export default function AvailabilityBadge({ availability, className }: Props) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
        availability.status === 'available' && 'bg-brand-accent text-white shadow-sm',
        availability.status === 'fully_booked' && 'bg-foreground/80 text-white',
        availability.status === 'unknown' && 'bg-surface/90 text-muted-foreground ring-1 ring-border',
        className,
      )}
    >
      {availability.label}
    </span>
  )
}
