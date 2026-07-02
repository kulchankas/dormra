import { setRequestLocale, getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { getRecentDeliveries } from '@/lib/admin-stats'
import { Link } from '@/i18n/navigation'

const DATE_LOCALES = { en: enGB, de, ru } as const

type PageProps = { params: Promise<{ locale: string }> }

export default async function AdminDeliveriesPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('admin')
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const deliveries = await getRecentDeliveries(100)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('deliveriesTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('deliveriesSubtitle')}</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-8 text-center text-sm text-muted-foreground">
          {t('noDeliveries')}
        </div>
      ) : (
        <div className="card-elevated overflow-hidden rounded-2xl bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft/80 text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t('sentAt')}</th>
                  <th className="px-4 py-3 font-medium">{t('dorm')}</th>
                  <th className="px-4 py-3 font-medium">{t('provider')}</th>
                  <th className="px-4 py-3 font-medium">{t('channel')}</th>
                  <th className="px-4 py-3 font-medium">{t('userId')}</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(row.sentAt), 'd MMM yyyy HH:mm', { locale: dateLocale })}
                    </td>
                    <td className="px-4 py-3">
                      {row.dormSlug ? (
                        <Link
                          href={`/dorms/${row.dormSlug}`}
                          className="font-medium text-foreground hover:text-brand hover:underline"
                        >
                          {row.dormName}
                        </Link>
                      ) : (
                        row.dormName
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.provider || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.channel}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.userId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
