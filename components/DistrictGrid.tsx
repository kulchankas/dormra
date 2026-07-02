'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { DISTRICT_NAMES } from '@/lib/helpers'

export default function DistrictGrid({
  selected,
  onChange,
  label,
}: {
  selected: number[]
  onChange: (d: number[]) => void
  label?: string
}) {
  const t = useTranslations('labels')
  const tForm = useTranslations('alertForm')
  const displayLabel = label ?? tForm('districts')

  const toggle = (d: number) =>
    onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{displayLabel}</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="relative text-[11px] text-muted-foreground hover:text-foreground transition-colors after:absolute after:-inset-2"
          >
            {t('clearCount', { count: selected.length })}
          </button>
        )}
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{t('districtAnyHint')}</p>
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-6">
        {Object.keys(DISTRICT_NAMES).map((k) => {
          const n = Number(k)
          const isSelected = selected.includes(n)
          return (
            <button
              key={n}
              type="button"
              title={`${n}. ${DISTRICT_NAMES[n]}`}
              aria-pressed={isSelected}
              onClick={() => toggle(n)}
              className={cn(
                'h-11 w-full rounded-lg text-xs font-medium transition-all',
                isSelected
                  ? 'bg-brand text-white'
                  : 'bg-muted text-muted-foreground hover:bg-brand-soft hover:text-brand',
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {selected.map((d) => `${d}. ${DISTRICT_NAMES[d]}`).join(' · ')}
        </p>
      )}
    </div>
  )
}
