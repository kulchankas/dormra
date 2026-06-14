import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, BookmarkCheck, TrendingUp, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count: alertCount } = await supabase
    .from('user_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('active', true)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Alerts card */}
          <Link
            href="/dashboard/alerts"
            className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-xl bg-brand-soft">
                <Bell className="size-4 text-brand" />
              </div>
              {(alertCount ?? 0) > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white">
                  {alertCount}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">Alerts</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {alertCount === 0
                ? 'No active alerts'
                : `${alertCount} active alert${alertCount !== 1 ? 's' : ''}`}
            </p>
          </Link>

          {/* Saved dorms — coming soon */}
          <div className="rounded-2xl border border-border bg-surface p-5 opacity-60">
            <div className="mb-3 grid size-9 place-items-center rounded-xl bg-muted">
              <BookmarkCheck className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Saved dorms</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Coming soon</p>
          </div>

          {/* Application tracker — coming soon */}
          <div className="rounded-2xl border border-border bg-surface p-5 opacity-60">
            <div className="mb-3 grid size-9 place-items-center rounded-xl bg-muted">
              <TrendingUp className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Application tracker</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>

        {alertCount === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No alerts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Set up an alert and we&apos;ll notify you the moment a matching room opens.
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
        )}
      </div>
    </main>
  )
}
