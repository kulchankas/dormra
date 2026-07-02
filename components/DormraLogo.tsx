import { cn } from '@/lib/utils'

const sizeConfig = {
  sm: { mark: 'size-6', icon: 'size-3.5', text: 'text-sm', gap: 'gap-2' },
  md: { mark: 'size-8', icon: 'size-4', text: 'text-base', gap: 'gap-2.5' },
  lg: { mark: 'size-10', icon: 'size-5', text: 'text-lg', gap: 'gap-3' },
} as const

type DormraLogoProps = {
  className?: string
  showWordmark?: boolean
  variant?: 'default' | 'inverse' | 'muted'
  size?: keyof typeof sizeConfig
}

function DormraMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <path
        d="M4.5 10.75 12 5l7.5 5.75V19a1.25 1.25 0 0 1-1.25 1.25H5.75A1.25 1.25 0 0 1 4.5 19V10.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 20.25v-5.5h4v5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="17.25" cy="8.75" r="1.35" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

export default function DormraLogo({
  className,
  showWordmark = true,
  variant = 'default',
  size = 'md',
}: DormraLogoProps) {
  const config = sizeConfig[size]

  const markShell =
    variant === 'inverse'
      ? 'bg-white/70 text-brand ring-1 ring-brand/10'
      : variant === 'muted'
        ? 'bg-surface-soft text-brand ring-1 ring-border/80'
        : 'bg-brand-soft/70 text-brand ring-1 ring-brand/12'

  const wordmarkClass =
    variant === 'inverse'
      ? 'text-foreground'
      : variant === 'muted'
        ? 'text-foreground'
        : 'text-brand'

  return (
    <span className={cn('inline-flex items-center', config.gap, className)}>
      <span
        className={cn(
          'grid place-items-center rounded-[10px]',
          config.mark,
          markShell,
        )}
      >
        <DormraMark className={config.icon} />
      </span>
      {showWordmark ? (
        <span className={cn('font-semibold tracking-tight', config.text, wordmarkClass)}>
          Dormra
        </span>
      ) : null}
    </span>
  )
}

export { DormraMark }
