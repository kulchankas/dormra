import { Suspense } from 'react'
import Link from 'next/link'
import { Bell, Search, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAvailabilityStatusBulk, type Dorm } from '@/lib/helpers'
import HeroSearch from '@/components/HeroSearch'
import DormraLogo from '@/components/DormraLogo'
import DormCard from '@/components/DormCard'
import ScanningPill from '@/components/ScanningPill'
import UniversityLogos from '@/components/UniversityLogos'
import PixelHeroDecor from '@/components/pixel/PixelHeroDecor'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

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
    desc: 'Email alert the moment a matching room opens up.',
  },
] as const

const TRACKED_PROVIDERS = [
  { name: 'OeAD', live: true },
  { name: 'STUWO', live: true },
  { name: 'home4students', live: true },
  { name: 'ÖJAB', live: false },
  { name: 'Akademikerhilfe', live: false },
  { name: 'Viennabase', live: false },
] as const

async function LiveStats() {
  let dormCount: number | null = null
  let providerCount: number | null = null

  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('dorms')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    dormCount = count ?? 0

    const { data: providerRows } = await supabase
      .from('dorms')
      .select('provider')
      .eq('active', true)
    providerCount = new Set((providerRows ?? []).map((row) => row.provider)).size
  } catch {
    // No Supabase env — show static fallback below.
  }

  const stats = [
    {
      value: dormCount != null ? `${dormCount}+` : '49+',
      label: 'dorm listings',
    },
    {
      value: providerCount != null ? String(providerCount) : '3',
      label: 'providers live',
    },
    { value: '15 min', label: 'refresh interval' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8">
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  )
}

function DormPreviewSkeleton() {
  return (
    <div className="card-elevated overflow-hidden rounded-2xl bg-surface">
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

export default function HomePage() {
  return (
    <main>
      <section
        className="hero-glow relative w-full pt-12 pb-10 md:pt-20 md:pb-14"
        aria-label="Search student dorms in Vienna"
      >
        <PixelHeroDecor />
        <div className="mx-auto flex max-w-[680px] flex-col items-center px-6 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs font-medium text-brand backdrop-blur-sm">
            Vienna student housing
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Beta
            </span>
          </span>

          <h1 className="text-[28px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[42px]">
            Every student dorm in Vienna.
            <br className="hidden sm:block" />
            <span className="text-brand"> One search.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Stop refreshing 8 different websites. Dormra tracks availability across all providers — and alerts you the moment a room opens.
          </p>

          <div className="mt-8 flex w-full justify-center">
            <HeroSearch />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              Tracking
            </span>
            {TRACKED_PROVIDERS.map(({ name, live }) => (
              <span
                key={name}
                className={
                  live
                    ? 'rounded-full bg-surface/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground ring-1 ring-brand/25'
                    : 'rounded-full bg-surface/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/60 ring-1 ring-border/40'
                }
                title={live ? 'Live availability scraping' : 'Coming soon'}
              >
                {name}
                {!live ? ' · soon' : ''}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-background pb-4" aria-label="Trusted by students from Vienna universities">
        <p className="mb-6 px-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          Trusted by students from
        </p>
        <UniversityLogos />
      </section>

      <div className="w-full bg-surface-soft/80">
        <div className="mx-auto max-w-[1100px] px-6 py-5">
          <Suspense
            fallback={
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="mx-auto h-12 w-20 rounded-lg" />
                ))}
              </div>
            }
          >
            <LiveStats />
          </Suspense>
          <div className="mt-4 flex justify-center">
            <ScanningPill />
          </div>
        </div>
      </div>

      <section className="w-full bg-background" aria-label="How Dormra works">
        <div className="mx-auto max-w-[1100px] px-6 py-12">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">How it works</h2>
            <p className="mt-1 text-sm text-muted-foreground">Three steps to stop missing rooms</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card-elevated rounded-2xl bg-surface p-5 transition-shadow">
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-brand-soft">
                    <Icon className="size-5 text-brand" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-widest text-brand/50">{step}</span>
                </div>
                <p className="mb-1 text-[15px] font-semibold text-foreground">{title}</p>
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

      <section className="w-full bg-surface pb-12 pt-10" aria-label="Dorms in Vienna">
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

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              nativeButton={false}
              className="h-11 rounded-full px-8 text-sm"
              render={<Link href="/dorms" />}
            >
              Browse all dorms
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              className="h-11 rounded-full px-8 text-sm"
              render={<Link href="/signup?redirect=/dashboard/alerts/new" />}
            >
              Set up a free alert
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full bg-background" aria-label="Set a dorm alert">
        <div className="mx-auto max-w-[1100px] px-6 pb-12">
          <div className="card-elevated overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft to-surface px-6 py-10 text-center md:py-14">
            <div className="mx-auto max-w-xl">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-brand text-white">
                <Bell className="size-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
                Never miss a room again
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Set one alert with your budget and districts. Dormra checks every provider every
                15 minutes and emails you the moment a match opens.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  className="h-11 rounded-full px-7 text-sm"
                  render={<Link href="/dashboard/alerts/new" />}
                >
                  <Bell className="size-4" />
                  Set an alert
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  className="h-11 rounded-full px-7 text-sm"
                  render={<Link href="/dorms" />}
                >
                  Browse dorms first
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-background">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <DormraLogo size="sm" variant="muted" />
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">Vienna student housing · 2026</p>
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
