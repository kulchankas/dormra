import { ArrowLeft, BookmarkCheck, Search } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { getAvailabilityStatusBulk, availabilityMapToRecord } from '@/lib/availability'
import { localizeAvailabilityRecord } from '@/lib/i18n-availability'
import { Button } from '@/components/ui/button'
import DormCard from '@/components/DormCard'
import RemoveSavedDormButton from '@/components/RemoveSavedDormButton'
import TrackerStatusSelect from '@/components/TrackerStatusSelect'
import { TRACKER_STATUS_ORDER, isTrackerStatus, type TrackerStatus } from '@/lib/tracker'
import { isStaleAppliedStatus } from '@/lib/tracker-stale'
import { type Dorm } from '@/lib/helpers'
import { Link, redirect } from '@/i18n/navigation'

type PageProps = { params: Promise<{ locale: string }> }

type TrackerRow = {
  id: string
  dorm_id: string
  status: string
  created_at: string
  updated_at: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dashboard/saved', t('savedPageTitle'))
}

export default async function SavedDormsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('saved')
  const tAvail = await getTranslations('availability')
  const tHome = await getTranslations('home')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect({ href: '/login?redirect=/dashboard/saved', locale })
    return
  }

  const { data: trackerData } = await supabase
    .from('tracker')
    .select('id, dorm_id, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const trackerRows = (trackerData ?? []) as TrackerRow[]
  const dormIds = trackerRows.map((r) => r.dorm_id)

  const dormsById = new Map<string, Dorm>()
  if (dormIds.length > 0) {
    const { data: dormsData } = await supabase.from('dorms').select('*').in('id', dormIds)
    for (const dorm of (dormsData ?? []) as Dorm[]) {
      dormsById.set(dorm.id, dorm)
    }
  }

  const availabilityMap = localizeAvailabilityRecord(
    availabilityMapToRecord(await getAvailabilityStatusBulk(dormIds, supabase)),
    (key) => tAvail(key),
  )

  const byStatus = new Map<TrackerStatus, { tracker: TrackerRow; dorm: Dorm }[]>()
  for (const row of trackerRows) {
    const dorm = dormsById.get(row.dorm_id)
    if (!dorm) continue
    const status = isTrackerStatus(row.status) ? row.status : 'interested'
    const list = byStatus.get(status) ?? []
    list.push({ tracker: row, dorm })
    byStatus.set(status, list)
  }

  const statusLabels: Record<TrackerStatus, string> = {
    interested: t('statusInterested'),
    applied: t('statusApplied'),
    accepted: t('statusAccepted'),
    rejected: t('statusRejected'),
  }

  const total = trackerRows.length
  const staleAppliedCount = trackerRows.filter(
    (row) => row.status === 'applied' && isStaleAppliedStatus(row.updated_at),
  ).length

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t('backToDashboard')}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? t('subtitleEmpty')
              : total === 1
                ? t('subtitle', { count: total })
                : t('subtitlePlural', { count: total })}
          </p>
        </div>

        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-12 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft">
              <BookmarkCheck className="size-6 text-brand" />
            </div>
            <p className="text-base font-semibold text-foreground">{t('empty')}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t('emptyHint')}</p>
            <div className="mt-6">
              <Button nativeButton={false} className="h-10 rounded-full px-6 text-sm" render={<Link href="/dorms" />}>
                <Search className="size-4" />
                {tHome('browseFirst')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {staleAppliedCount > 0 && (
              <div
                role="status"
                className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-foreground"
              >
                <p className="font-medium">{t('staleAppliedBannerTitle')}</p>
                <p className="mt-1 text-muted-foreground">{t('staleAppliedBannerBody')}</p>
              </div>
            )}
            {TRACKER_STATUS_ORDER.map((status) => {
              const entries = byStatus.get(status)
              if (!entries || entries.length === 0) return null
              return (
                <section key={status} aria-label={statusLabels[status]}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    {statusLabels[status]}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {entries.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {entries.map(({ tracker, dorm }) => (
                      <div key={tracker.id} className="flex flex-col gap-2">
                        <DormCard
                          dorm={dorm}
                          availability={
                            availabilityMap[dorm.id] ?? { status: 'unknown', label: tAvail('unknown') }
                          }
                          variant="compact"
                        />
                        <div className="flex items-center justify-between gap-2 px-0.5">
                          <TrackerStatusSelect trackerId={tracker.id} status={status} />
                          <RemoveSavedDormButton trackerId={tracker.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
