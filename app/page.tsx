import { Suspense } from 'react'
import Link from 'next/link'
import { Bell, Search, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAvailabilityStatusBulk, type Dorm } from '@/lib/helpers'
import HeroSearch from '@/components/HeroSearch'
import DormCard from '@/components/DormCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// ─── How it works ─────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: Search,
    step: '01',
    title: 'Search & filter',
    desc: 'All providers in one place — filter by price, district, deposit.',
  },
  {
    icon: Bell,
    step: '02',
    title: 'Set an alert',
    desc: 'Tell Dormra your criteria once. We check every 15 minutes.',
  },
  {
    icon: Mail,
    step: '03',
    title: 'Get notified',
    desc: 'Email or Telegram the moment a matching room opens up.',
  },
] as const

const PROVIDERS = ['OeAD', 'STUWO', 'home4students', 'ÖJAB', 'Akademikerhilfe', 'Viennabase']

// ─── Skeletons ────────────────────────────────────────────────────────────────

function DormPreviewSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Skeleton className="h-[160px] w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

// ─── Dorms preview RSC ────────────────────────────────────────────────────────

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        className="w-full bg-background pt-12 pb-10 md:pt-20 md:pb-14"
        aria-label="Search student dorms in Vienna"
      >
        <div className="mx-auto flex max-w-[680px] flex-col items-center px-6 text-center">
          {/* Eyebrow */}
          <span className="mb-4 inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            Vienna student housing
          </span>

          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
            Every student dorm in Vienna.
            <br className="hidden sm:block" />
            <span className="text-brand"> One search.</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Stop refreshing 8 different websites. Dormra tracks availability across all providers — and alerts you the moment a room opens.
          </p>

          <div className="mt-7 flex w-full justify-center">
            <HeroSearch />
          </div>

          {/* Provider trust bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <span className="text-[11px] text-muted-foreground/60">Tracking</span>
            {PROVIDERS.map((p) => (
              <span key={p} className="text-[11px] font-medium text-muted-foreground">
                {p}
              </span>
            ))}
            <span className="text-[11px] text-muted-foreground/60">& more</span>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="w-full border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1100px] grid-cols-3 divide-x divide-border px-6">
          {[
            { value: '70+', label: 'dorm buildings' },
            { value: '8+', label: 'providers covered' },
            { value: '15 min', label: 'refresh interval' },
          ].map(({ value, label }) => (
            <div key={label} className="py-4 text-center">
              <p className="text-lg font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="w-full bg-background" aria-label="How Dormra works">
        <div className="mx-auto max-w-[1100px] px-6 py-12">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">How it works</h2>
            <p className="mt-1 text-sm text-muted-foreground">Three steps to stop missing rooms</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-brand-soft">
                    <Icon className="size-5 text-brand" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-widest text-brand/60">{step}</span>
                </div>
                <p className="mb-1 text-[15px] font-medium text-foreground">{title}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              className="h-8 rounded-full text-xs text-muted-foreground"
              render={<Link href="/how-it-works" />}
            >
              Learn more about how Dormra works →
            </Button>
          </div>
        </div>
      </section>

      {/* ── Dorms preview ── */}
      <section className="w-full border-t border-border bg-surface pb-12 pt-8" aria-label="Dorms in Vienna">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Latest listings</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Recently added to Dormra</p>
            </div>
            <Link
              href="/dorms"
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Browse all →
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DormPreviewSkeleton />
                <DormPreviewSkeleton />
                <DormPreviewSkeleton />
              </div>
            }
          >
            <DormsPreview />
          </Suspense>

          <div className="mt-6 text-center">
            <Button
              size="lg"
              nativeButton={false}
              className="h-11 rounded-full px-8 text-sm"
              render={<Link href="/dorms" />}
            >
              Browse all dorms
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
          <div>
            <Link href="/" className="text-sm font-semibold text-brand">Dormra</Link>
            <p className="mt-0.5 text-xs text-muted-foreground">Vienna student housing · 2026</p>
          </div>
          <nav className="flex items-center gap-4" aria-label="Footer links">
            <Link href="/how-it-works" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors">
              How it works
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
