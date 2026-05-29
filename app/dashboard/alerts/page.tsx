import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Bell, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteAlertButton from '@/components/DeleteAlertButton'
import { DISTRICT_NAMES } from '@/lib/helpers'

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
    parts.push(`by ${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`)
  }
  return parts.join(' · ') || 'Any room'
}

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: alerts } = await supabase
    .from('user_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (alerts ?? []) as AlertRow[]

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

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-medium text-foreground">Alerts</h1>
          <Button
            size="sm"
            nativeButton={false}
            className="h-8 rounded-full px-4 text-xs"
            render={<Link href="/dashboard/alerts/new" />}
          >
            <Plus className="size-3.5" />
            New alert
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No alerts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create an alert and we'll ping you the moment a matching room opens.
            </p>
            <Button
              size="sm"
              nativeButton={false}
              className="mt-4 h-8 rounded-full px-4 text-xs"
              render={<Link href="/dashboard/alerts/new" />}
            >
              <Plus className="size-3.5" />
              Create first alert
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {formatAlertSummary(alert)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {alert.pets_required && (
                        <Badge variant="secondary" className="text-[10px]">Pets</Badge>
                      )}
                      {alert.couples && (
                        <Badge variant="secondary" className="text-[10px]">Couples</Badge>
                      )}
                      {alert.deposit_max != null && (
                        <Badge variant="secondary" className="text-[10px]">
                          Deposit ≤ €{alert.deposit_max}
                        </Badge>
                      )}
                      {alert.notify_email && (
                        <Badge variant="secondary" className="text-[10px]">Email</Badge>
                      )}
                      {alert.notify_telegram && (
                        <Badge variant="secondary" className="text-[10px]">Telegram</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false}
                      render={<Link href={`/dashboard/alerts/${alert.id}`} />}
                      aria-label="Edit alert"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <DeleteAlertButton id={alert.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
