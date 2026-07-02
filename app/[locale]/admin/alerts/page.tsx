import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAlertStats } from '@/lib/admin-stats'

type PageProps = { params: Promise<{ locale: string }> }

export default async function AdminAlertsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('admin')

  const stats = await getAlertStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('alertsTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('alertsSubtitle')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated rounded-2xl bg-surface p-5">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">{t('totalAlertsLabel')}</p>
        </div>
        <div className="card-elevated rounded-2xl bg-surface p-5">
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
          <p className="text-sm text-muted-foreground">{t('activeAlerts')}</p>
        </div>
        <div className="card-elevated rounded-2xl bg-surface p-5">
          <p className="text-2xl font-bold text-foreground">{stats.createdLast7Days}</p>
          <p className="text-sm text-muted-foreground">{t('created7d')}</p>
        </div>
        <div className="card-elevated rounded-2xl bg-surface p-5">
          <p className="text-2xl font-bold text-foreground">{stats.createdLast30Days}</p>
          <p className="text-sm text-muted-foreground">{t('created30d')}</p>
        </div>
      </div>

      <div className="card-elevated rounded-2xl bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t('byLocale')}</h3>
        {stats.byLocale.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noAlertsYet')}</p>
        ) : (
          <div className="space-y-2">
            {stats.byLocale.map(({ locale: loc, count }) => (
              <div key={loc} className="flex items-center justify-between text-sm">
                <span className="font-medium uppercase text-foreground">{loc}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
