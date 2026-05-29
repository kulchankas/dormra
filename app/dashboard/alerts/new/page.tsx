import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AlertForm from '@/components/AlertForm'

export default async function NewAlertPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <Link
          href="/dashboard/alerts"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to alerts
        </Link>

        <h1 className="mb-6 text-xl font-medium text-foreground">New alert</h1>
        <AlertForm mode="create" />
      </div>
    </main>
  )
}
