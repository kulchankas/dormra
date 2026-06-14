import { cn } from '@/lib/utils'
import { DISTRICT_NAMES } from '@/lib/helpers'

/**
 * 5-column numbered grid of Vienna's 23 districts. Shared by the dorms filter
 * and the alert form.
 */
export default function DistrictGrid({
  selected,
  onChange,
  label = 'District',
}: {
  selected: number[]
  onChange: (d: number[]) => void
  label?: string
}) {
  const toggle = (d: number) =>
    onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear ({selected.length})
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Object.keys(DISTRICT_NAMES).map((k) => {
          const n = Number(k)
          const isSelected = selected.includes(n)
          return (
            <button
              key={n}
              type="button"
              title={`${n}. ${DISTRICT_NAMES[n]}`}
              onClick={() => toggle(n)}
              className={cn(
                'h-8 w-full rounded-lg text-xs font-medium transition-all',
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
        <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
          {selected.map((d) => `${d}. ${DISTRICT_NAMES[d]}`).join(' · ')}
        </p>
      )}
    </div>
  )
}
