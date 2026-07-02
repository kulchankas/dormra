import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Bell, Plus, Pencil, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteAlertButton from '@/components/DeleteAlertButton'
import AlertActiveToggle from '@/components/AlertActiveToggle'
import ScanningPill from '@/components/ScanningPill'
import { DISTRICT_NAMES, type Dorm } from '@/lib/helpers'
import { alertToDormsHref, countMatches } from '@/lib/alertMatch'
import { cn } from '@/lib/utils'

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

function formatAlertSummary(alert: AlertRow): string {
  const parts: string[] = []
  if (alert.price_max) parts.push(`up to €${alert.price_max}/mo`)
  if (alert.districts && alert.districts.length > 0) {
    const names = alert.districts
      .map((d) => DISTRICT_NAMES[d] ?? `${d}th`)
      .slice(0, 2)
    const suffix = alert.districts.length > 2 ? ` +${alert.districts.length - 2}` : ''
    parts.push(names.join(', ') + suffix)
  }
  if (alert.move_in_before) {
    const d = new Date(alert.move_in_before)
    parts.push(`move-in by ${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`)
  }
  return parts.join(' · ') || 'Any room in Vienna'
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/alerts')

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
          Dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Alerts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length === 0
                ? 'Get emailed when a matching room opens'
                : `${activeCount} active · ${rows.length} total`}
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
            New alert
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-12 text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft">
              <Bell className="size-6 text-brand" />
            </div>
            <p className="text-base font-semibold text-foreground">No alerts yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Tell us your budget and districts once — we check every provider every 15 minutes and email you when a room opens.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button
                nativeButton={false}
                className="h-10 rounded-full px-6 text-sm"
                render={<Link href="/dashboard/alerts/new" />}
              >
                <Plus className="size-4" />
                Create first alert
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                className="h-10 rounded-full px-6 text-sm"
                render={<Link href="/dorms" />}
              >
                Browse dorms first
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
                          {formatAlertSummary(alert)}
                        </h2>
                        {!alert.active && (
                          <Badge variant="secondary" className="text-[10px]">Paused</Badge>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Created {formatCreatedAt(alert.created_at)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {alert.pets_required && (
                          <Badge variant="secondary" className="text-[10px]">Pets</Badge>
                        )}
                        {alert.couples && (
                          <Badge variant="secondary" className="text-[10px]">Couples</Badge>
                        )}
                        {alert.deposit_max != null && (
                          <Badge variant="secondary" className="text-[10px]">
                            Deposit ≤ {alert.deposit_max} mo
                          </Badge>
                        )}
                        {alert.notify_email && (
                          <Badge variant="secondary" className="text-[10px]">Email</Badge>
                        )}
                      </div>

                      <Link
                        href={dormsHref}
                        className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft/70"
                      >
                        <Home className="size-3.5" />
                        {matchCount} {matchCount === 1 ? 'dorm matches' : 'dorms match'} now
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
                          aria-label="Edit alert"
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
