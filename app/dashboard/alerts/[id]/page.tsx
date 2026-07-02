import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AlertForm from '@/components/AlertForm'
import type { AlertPayload } from '@/app/dashboard/alerts/actions'

export default async function EditAlertPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/dashboard/alerts/${id}`)}`)

  const { data: alert } = await supabase
    .from('user_alerts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!alert) notFound()

  const defaultValues: AlertPayload = {
    price_max: alert.price_max ?? null,
    districts: alert.districts ?? [],
    move_in_before: alert.move_in_before ?? null,
    pets_required: alert.pets_required ?? false,
    couples: alert.couples ?? false,
    deposit_max: alert.deposit_max ?? null,
    notify_email: alert.notify_email ?? true,
    notify_telegram: alert.notify_telegram ?? false,
    telegram_chat_id: alert.telegram_chat_id ?? null,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="hero-glow border-b border-border/40">
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
          <Link
            href="/dashboard/alerts"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to alerts
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit alert</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Update your criteria — changes apply to future availability notifications.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
        <AlertForm mode="edit" alertId={id} defaultValues={defaultValues} />
      </div>
    </main>
  )
}
