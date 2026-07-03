'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  /** Accessible label per star, e.g. (n) => `Rate ${n} out of 5`. Required when interactive. */
  starLabel?: (n: number) => string
  /** Accessible label for the whole read-only display, e.g. "4 out of 5 stars". Omit when an adjacent text label already conveys the value. */
  ariaLabel?: string
  className?: string
}

const SIZE_CLASS = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
} as const

/** Read-only star display when `onChange` is omitted; an interactive 1-5 picker otherwise. */
export default function StarRating({ value, onChange, size = 'md', starLabel, ariaLabel, className }: Props) {
  const interactive = typeof onChange === 'function'
  const stars = [1, 2, 3, 4, 5]

  if (!interactive) {
    return (
      <div
        className={cn('inline-flex items-center gap-0.5', className)}
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
      >
        {stars.map((n) => (
          <Star
            key={n}
            className={cn(SIZE_CLASS[size], n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/40')}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)} role="radiogroup">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={starLabel?.(n) ?? String(n)}
          onClick={() => onChange(n)}
          className="rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
        >
          <Star className={cn(SIZE_CLASS[size], n <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/40')} />
        </button>
      ))}
    </div>
  )
}
