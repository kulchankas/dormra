import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Pill-shaped toggle button. Shared by the dorms filter and the alert form.
 */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-brand bg-brand text-white'
          : 'border-border bg-surface text-foreground hover:border-brand/40 hover:bg-brand-soft/50',
        className,
      )}
    >
      {children}
    </button>
  )
}
