import { setRequestLocale, getTranslations } from 'next-intl/server'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { Activity, Bell, Building2, Mail, AlertTriangle } from 'lucide-react'
import { getAdminOverview, getRecentCronRuns } from '@/lib/admin-stats'
import { Link } from '@/i18n/navigation'

const DATE_LOCALES = { en: enGB, de, ru } as const

type PageProps = { params: Promise<{ locale: string }> }

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'success' | 'warning'
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600'
      : tone === 'warning'
        ? 'text-amber-600'
        : 'text-brand'

  return (
    <div className="card-elevated rounded-2xl bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`grid size-10 place-items-center rounded-xl bg-brand-soft ${toneClass}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default async function AdminOverviewPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('admin')
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const stats = await getAdminOverview()
  const cronRuns = await getRecentCronRuns(8)

  const lastScrape = stats.lastScrapedAt
    ? formatDistanceToNow(new Date(stats.lastScrapedAt), { addSuffix: true, locale: dateLocale })
    : t('never')

  return (
    <div className="space-y-8">
      <section aria-label={t('overviewSection')}>
        <h2 className="mb-4 text-sm font-semibold text-foreground">{t('overviewSection')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Building2}
            label={t('activeDorms')}
            value={stats.activeDorms}
            hint={t('availableNow', { count: stats.availableNow })}
            tone="success"
          />
          <StatCard
            icon={AlertTriangle}
            label={t('scrapeIssues')}
            value={stats.scrapeFailures + stats.staleSnapshots}
            hint={t('scrapeIssuesHint', {
              failed: stats.scrapeFailures,
              stale: stats.staleSnapshots,
            })}
            tone={stats.scrapeFailures > 0 ? 'warning' : 'default'}
          />
          <StatCard
            icon={Bell}
            label={t('activeAlerts')}
            value={stats.activeAlerts}
            hint={t('totalAlerts', { count: stats.totalAlerts })}
          />
          <StatCard
            icon={Mail}
            label={t('emailsThisWeek')}
            value={stats.emailsThisWeek}
            hint={t('emailsToday', { count: stats.emailsToday })}
          />
        </div>
      </section>

      <section className="card-elevated rounded-2xl bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="size-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">{t('scraperHealth')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('lastScrape')}: <span className="font-medium text-foreground">{lastScrape}</span>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">{t('provider')}</th>
                <th className="pb-2 pr-4 font-medium">{t('dormCount')}</th>
                <th className="pb-2 pr-4 font-medium">{t('providerLastScrape')}</th>
                <th className="pb-2 font-medium">{t('failures')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.providerStats.map(({ provider, dorms, failures, lastScrapedAt, staleCount }) => {
                const providerLast = lastScrapedAt
                  ? formatDistanceToNow(new Date(lastScrapedAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })
                  : t('never')
                const isStale =
                  !lastScrapedAt ||
                  Date.now() - new Date(lastScrapedAt).getTime() > 6 * 60 * 60 * 1000

                return (
                  <tr key={provider} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{provider}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{dorms}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={
                          isStale ? 'font-medium text-amber-600' : 'text-muted-foreground'
                        }
                      >
                        {providerLast}
                      </span>
                      {staleCount > 0 && (
                        <span className="mt-0.5 block text-xs text-amber-600/80">
                          {t('staleDorms', { count: staleCount })}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={
                          failures > 0 ? 'font-medium text-amber-600' : 'text-muted-foreground'
                        }
                      >
                        {failures}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {stats.staleSnapshots > 0 && (
          <p className="mt-3 text-xs text-amber-700">{t('cronSplitHint')}</p>
        )}
        {(stats.scrapeFailures > 0 || stats.staleSnapshots > 0) && (
          <p className="mt-4">
            <Link href="/admin/dorms" className="text-sm font-medium text-brand hover:underline">
              {t('viewDormHealth')} →
            </Link>
          </p>
        )}
      </section>

      <section className="card-elevated rounded-2xl bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="size-4 text-brand" />
          <h2 className="text-sm font-semibold text-foreground">{t('cronRunsSection')}</h2>
        </div>
        {cronRuns.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('cronRunsEmpty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">{t('cronRunWhen')}</th>
                  <th className="pb-2 pr-4 font-medium">{t('cronRunJob')}</th>
                  <th className="pb-2 pr-4 font-medium">{t('cronRunDuration')}</th>
                  <th className="pb-2 pr-4 font-medium">{t('cronRunResult')}</th>
                  <th className="pb-2 font-medium">{t('cronRunCounts')}</th>
                </tr>
              </thead>
              <tbody>
                {cronRuns.map((run) => {
                  const when = formatDistanceToNow(new Date(run.startedAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })
                  const jobLabel =
                    run.batch !== null && run.batches !== null
                      ? `${run.providers.join(', ')} (${run.batch + 1}/${run.batches})`
                      : run.providers.join(', ')
                  const durationSec = (run.durationMs / 1000).toFixed(0)

                  return (
                    <tr key={run.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 text-muted-foreground">{when}</td>
                      <td className="py-2.5 pr-4 font-medium text-foreground">{jobLabel}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{durationSec}s</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={
                            run.ok && run.errors === 0
                              ? 'font-medium text-emerald-600'
                              : 'font-medium text-amber-600'
                          }
                        >
                          {run.ok
                            ? run.errors > 0
                              ? t('cronRunPartial', { errors: run.errors })
                              : t('cronRunOk')
                            : t('cronRunFailed')}
                        </span>
                        {run.errorMessage && (
                          <span className="mt-0.5 block text-xs text-destructive">{run.errorMessage}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {t('cronRunScraped', {
                          scraped: run.scraped,
                          skipped: run.skipped,
                          pruned: run.pruned,
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{t('cronRunsHint')}</p>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-5">
        <h2 className="text-sm font-semibold text-foreground">{t('externalMonitoring')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('externalMonitoringHint')}</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Vercel
            </a>
            {' — '}
            {t('monitorVercel')}
          </li>
          <li>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Supabase
            </a>
            {' — '}
            {t('monitorSupabase')}
          </li>
          <li>
            <a
              href="https://console.cron-job.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              cron-job.org
            </a>
            {' — '}
            {t('monitorCron')}
          </li>
          <li>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Resend
            </a>
            {' — '}
            {t('monitorResend')}
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {t('monitoringDoc')}{' '}
          <code className="rounded bg-muted px-1 py-0.5">docs/MONITORING.md</code>
        </p>
      </section>
    </div>
  )
}
