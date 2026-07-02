import { setRequestLocale, getTranslations } from 'next-intl/server'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { getDormHealthRows } from '@/lib/admin-stats'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const DATE_LOCALES = { en: enGB, de, ru } as const

type PageProps = { params: Promise<{ locale: string }> }

const STATUS_STYLES = {
  available: 'bg-emerald-500/10 text-emerald-700',
  booked: 'bg-muted text-muted-foreground',
  unknown: 'bg-muted text-muted-foreground',
  failed: 'bg-red-500/10 text-red-700',
  stale: 'bg-amber-500/10 text-amber-700',
} as const

export default async function AdminDormsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('admin')
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const rows = await getDormHealthRows()
  const issues = rows.filter((r) => r.status === 'failed' || r.status === 'stale')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('dormsTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('dormsSubtitle', { total: rows.length, issues: issues.length })}
          </p>
        </div>
      </div>

      <div className="card-elevated overflow-hidden rounded-2xl bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-soft/80 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t('dorm')}</th>
                <th className="px-4 py-3 font-medium">{t('provider')}</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
                <th className="px-4 py-3 font-medium">{t('lastCheck')}</th>
                <th className="px-4 py-3 font-medium">{t('error')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dorms/${row.slug}`}
                      className="font-medium text-foreground hover:text-brand hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.provider}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_STYLES[row.status],
                      )}
                    >
                      {t(`statusLabels.${row.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.scrapedAt
                      ? formatDistanceToNow(new Date(row.scrapedAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })
                      : '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-red-600" title={row.errorMsg ?? undefined}>
                    {row.errorMsg ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
