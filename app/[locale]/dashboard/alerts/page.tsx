import { ArrowLeft, Bell, Plus, Pencil, Home } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteAlertButton from '@/components/DeleteAlertButton'
import AlertActiveToggle from '@/components/AlertActiveToggle'
import ScanningPill from '@/components/ScanningPill'
import { DISTRICT_NAMES, type Dorm } from '@/lib/helpers'
import { alertToDormsHref, countMatches } from '@/lib/alertMatch'
import { cn } from '@/lib/utils'
import { dateLocale } from '@/lib/i18n-dates'
import { Link, redirect } from '@/i18n/navigation'

type AlertRow = {
  id: string
  price_max: number | null
  districts: number[] | null
  move_in_before: string | null
  pets_required: boolean
  couples: boolean
  deposit_max: number | null
  notify_email: boolean
  notify_telegram: boolean
  telegram_chat_id: string | null
  active: boolean
  created_at: string
}

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dashboard/alerts', t('alertsPageTitle'))
}

function formatAlertSummary(
  alert: AlertRow,
  t: Awaited<ReturnType<typeof getTranslations<'dashboard'>>>,
  locale: string,
): string {
  const parts: string[] = []
  if (alert.price_max) parts.push(t('alertSummaryPrice', { price: alert.price_max }))
  if (alert.districts && alert.districts.length > 0) {
    const names = alert.districts
      .map((d) => DISTRICT_NAMES[d] ?? `${d}th`)
      .slice(0, 2)
    const suffix = alert.districts.length > 2 ? ` +${alert.districts.length - 2}` : ''
    parts.push(names.join(', ') + suffix)
  }
  if (alert.move_in_before) {
    const d = new Date(alert.move_in_before)
    parts.push(
      t('alertSummaryMoveIn', {
        date: d.toLocaleDateString(dateLocale(locale), { month: 'short', year: 'numeric' }),
      }),
    )
  }
  return parts.join(' · ') || t('alertSummaryAnyRoom')
}

function formatCreatedAt(iso: string, locale: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(dateLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AlertsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')
  const tHome = await getTranslations('home')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect({ href: '/login?redirect=/dashboard/alerts', locale })
    return
  }

  const [{ data: alerts }, { data: dormData }] = await Promise.all([
    supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('dorms').select('*').eq('active', true),
  ])

  const rows = (alerts ?? []) as AlertRow[]
  const dorms = (dormData ?? []) as Dorm[]
  const activeCount = rows.filter((r) => r.active).length

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t('backToDashboard')}
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('alerts')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length === 0
                ? t('getEmailedWhenMatch')
                : t('activeTotal', { active: activeCount, total: rows.length })}
            </p>
            {rows.length > 0 && (
              <div className="mt-3">
                <ScanningPill />
              </div>
            )}
          </div>
          <Button
            size="sm"
            nativeButton={false}
            className="h-9 shrink-0 self-start rounded-full px-4 text-xs"
            render={<Link href="/dashboard/alerts/new" />}
          >
            <Plus className="size-3.5" />
            {t('newAlert')}
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-12 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft">
              <Bell className="size-6 text-brand" />
            </div>
            <p className="text-base font-semibold text-foreground">{t('noAlerts')}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t('alertsSubtitle')}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button
                nativeButton={false}
                className="h-10 rounded-full px-6 text-sm"
                render={<Link href="/dashboard/alerts/new" />}
              >
                <Plus className="size-4" />
                {t('createFirstAlert')}
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                className="h-10 rounded-full px-6 text-sm"
                render={<Link href="/dorms" />}
              >
                {tHome('browseFirst')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((alert) => {
              const criteria = {
                price_max: alert.price_max,
                districts: alert.districts,
                deposit_max: alert.deposit_max,
                pets_required: alert.pets_required,
                couples: alert.couples,
              }
              const matchCount = countMatches(dorms, criteria)
              const dormsHref = alertToDormsHref(criteria)

              return (
                <article
                  key={alert.id}
                  className={cn(
                    'card-elevated rounded-2xl bg-surface p-4 transition-opacity sm:p-5',
                    !alert.active && 'opacity-60',
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-foreground sm:text-base">
                          {formatAlertSummary(alert, t, locale)}
                        </h2>
                        {!alert.active && (
                          <Badge variant="secondary" className="text-[10px]">{t('paused')}</Badge>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t('created', { date: formatCreatedAt(alert.created_at, locale) })}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {alert.pets_required && (
                          <Badge variant="secondary" className="text-[10px]">{t('petsBadge')}</Badge>
                        )}
                        {alert.couples && (
                          <Badge variant="secondary" className="text-[10px]">{t('couplesBadge')}</Badge>
                        )}
                        {alert.deposit_max != null && (
                          <Badge variant="secondary" className="text-[10px]">
                            {t('depositBadge', { months: alert.deposit_max })}
                          </Badge>
                        )}
                        {alert.notify_email && (
                          <Badge variant="secondary" className="text-[10px]">{t('emailBadge')}</Badge>
                        )}
                      </div>

                      <Link
                        href={dormsHref}
                        className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft/70"
                      >
                        <Home className="size-3.5" />
                        {matchCount === 1
                          ? t('dormMatches', { count: matchCount })
                          : t('dormsMatch', { count: matchCount })}
                      </Link>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                      <AlertActiveToggle id={alert.id} active={alert.active} />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          className="size-9"
                          render={<Link href={`/dashboard/alerts/${alert.id}`} />}
                          aria-label={t('editAlertAria')}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <DeleteAlertButton id={alert.id} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
