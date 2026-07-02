import { Bell, BookmarkCheck, Plus, Search, Settings } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import ScanningPillServer from '@/components/ScanningPillServer'
import { Link, redirect } from '@/i18n/navigation'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dashboard', t('dashboardTitle'))
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')
  const tHome = await getTranslations('home')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect({ href: '/login?redirect=/dashboard', locale })
    return
  }

  const [{ count: alertCount }, { count: savedCountRaw }] = await Promise.all([
    supabase
      .from('user_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('active', true),
    supabase
      .from('tracker')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const count = alertCount ?? 0
  const savedCount = savedCountRaw ?? 0

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-4">
            <ScanningPillServer />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/alerts"
            className="card-elevated group rounded-2xl bg-surface p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-soft transition-colors group-hover:bg-brand/10">
                <Bell className="size-4 text-brand" />
              </div>
              {count > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{t('alerts')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {count === 0
                ? t('noActiveAlerts')
                : count === 1
                  ? t('activeAlertCount', { count })
                  : t('activeAlertCountPlural', { count })}
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="card-elevated group rounded-2xl bg-surface p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="mb-3 grid size-10 place-items-center rounded-xl bg-brand-soft transition-colors group-hover:bg-brand/10">
              <Settings className="size-4 text-brand" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t('settings')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('settingsHint')}</p>
          </Link>

          <Link
            href="/dashboard/saved"
            className="card-elevated group rounded-2xl bg-surface p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-soft transition-colors group-hover:bg-brand/10">
                <BookmarkCheck className="size-4 text-brand" />
              </div>
              {savedCount > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                  {savedCount}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{t('savedDorms')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {savedCount === 0
                ? t('savedDormsHint')
                : savedCount === 1
                  ? t('savedDormsCount', { count: savedCount })
                  : t('savedDormsCountPlural', { count: savedCount })}
            </p>
          </Link>
        </div>

        {count === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface-soft/50 p-8 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">{t('noAlerts')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('noAlertsHint')}</p>
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button
                size="sm"
                nativeButton={false}
                className="h-9 rounded-full px-4 text-xs"
                render={<Link href="/dashboard/alerts/new" />}
              >
                <Plus className="size-3.5" />
                {t('createFirstAlert')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="h-9 rounded-full px-4 text-xs"
                render={<Link href="/dorms" />}
              >
                <Search className="size-3.5" />
                {tHome('browseFirst')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
