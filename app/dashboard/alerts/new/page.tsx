import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AlertForm from '@/components/AlertForm'

export default async function NewAlertPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/alerts/new')

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New alert</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Set your criteria once — we&apos;ll email you when availability opens across all providers.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
        <AlertForm mode="create" />
      </div>
    </main>
  )
}
