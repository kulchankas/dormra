'use client'

import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { DISTRICT_NAMES } from '@/lib/helpers'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-foreground">{displayLabel}</span>
          <Popover>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="relative rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground after:absolute after:-inset-2"
                  aria-label={t('districtLegendAria')}
                />
              }
            >
              <Info className="size-3.5" aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-72 w-64 overflow-y-auto">
              <p className="mb-1.5 text-xs font-semibold text-foreground">{t('districtLegendTitle')}</p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {Object.entries(DISTRICT_NAMES).map(([k, name]) => (
                  <li key={k}>{k}. {name}</li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
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
              aria-label={`${n}. ${DISTRICT_NAMES[n]}`}
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
