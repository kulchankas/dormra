import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAvailabilityStatusBulk, type Dorm } from '@/lib/helpers'
import HeroSearch from '@/components/HeroSearch'
import DormCard from '@/components/DormCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ─── How it works cards ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & filter',
    desc: 'All providers in one place — filter by price, district, deposit.',
  },
  {
    step: '02',
    title: 'Set an alert',
    desc: 'Tell Dormra your criteria once. We check every 15 minutes.',
  },
  {
    step: '03',
    title: 'Get notified',
    desc: 'Email or Telegram the moment a matching room opens up.',
  },
] as const

// ─── Dorm preview loading skeleton ───────────────────────────────────────────

function DormPreviewSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Skeleton className="h-[140px] w-full" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

// ─── Dorms preview RSC (separate async component for Suspense) ────────────────

async function DormsPreview() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dorms')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const previewDorms = (data ?? []) as Dorm[]
  const availabilityMap = await getAvailabilityStatusBulk(previewDorms.map((d) => d.id))

  if (previewDorms.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Listings coming soon — check back shortly.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
      {previewDorms.map((dorm) => (
        <DormCard
          key={dorm.id}
          dorm={dorm}
          availability={availabilityMap.get(dorm.id) ?? { status: 'unknown', label: 'Status unknown' }}
          variant="compact"
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="w-full bg-background pt-10 pb-[30px] md:pt-16 md:pb-10"
        aria-label="Search student dorms in Vienna"
      >
        <div className="mx-auto flex max-w-[720px] flex-col items-center px-6 text-center">
          <h1 className="text-[26px] font-medium leading-tight text-foreground md:text-[34px]">
            Every Vienna student dorm.
            <br className="hidden sm:block" /> One search.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Stop refreshing 8 websites a day — Dormra watches them for you.
          </p>
          <div className="mt-6 flex w-full justify-center">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="w-full bg-surface" aria-label="How Dormra works">
        <div className="mx-auto max-w-[1100px] px-6 py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border border-border bg-background p-4">
                <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-brand">
                  {step}
                </p>
                <p className="mb-1 text-[15px] font-medium text-foreground">{title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Button variant="ghost" size="sm" nativeButton={false} className="h-8 rounded-full text-xs text-muted-foreground" render={<Link href="/how-it-works" />}>
              Learn more →
            </Button>
          </div>
        </div>
      </section>

      {/* ── Dorms preview ── */}
      <section className="w-full bg-surface pb-8" aria-label="Dorms in Vienna">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Dorms in Vienna</h2>
            <Link
              href="/dorms"
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
                <DormPreviewSkeleton />
                <DormPreviewSkeleton />
                <DormPreviewSkeleton />
              </div>
            }
          >
            <DormsPreview />
          </Suspense>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <p className="text-xs text-muted-foreground">
            <Link href="/" className="font-medium text-brand">Dormra</Link>
            {' '}· Vienna student housing
          </p>
          <nav className="flex items-center gap-3" aria-label="Footer links">
            <Link href="/how-it-works" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              How it works
            </Link>
            <span className="text-muted-foreground/40" aria-hidden="true">·</span>
            <Link href="/privacy" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
            <span className="text-muted-foreground/40" aria-hidden="true">·</span>
            <Link href="/terms" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
