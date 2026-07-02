import Link from 'next/link'
import { Search, Bell, Mail, Clock, Map, ShieldCheck } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    n: '01',
    icon: Search,
    title: 'Search & filter',
    desc: 'All providers in one place — filter by price, district, deposit and amenities.',
  },
  {
    n: '02',
    icon: Bell,
    title: 'Set an alert',
    desc: 'Tell Dormra your criteria once. We check every 15 minutes, across every provider.',
  },
  {
    n: '03',
    icon: Mail,
    title: 'Get notified',
    desc: 'Email alert the moment a matching room opens up.',
  },
]

const HIGHLIGHTS = [
  { icon: Clock, label: 'Checked every 15 min' },
  { icon: Map, label: '70+ Vienna buildings' },
  { icon: ShieldCheck, label: 'No scams, no middlemen' },
]

const FAQ = [
  {
    q: 'How much does Dormra cost?',
    a: 'Browsing and basic alerts will always be free. We are in private beta — pricing for advanced alerts will be announced before launch.',
  },
  {
    q: 'Which providers are covered?',
    a: 'OeAD, STUWO, home4students, ÖJAB, Akademikerhilfe, WIHAST, Viennabase, The Fizz and more — we continuously add new sources.',
  },
  {
    q: 'How accurate is the availability data?',
    a: 'We re-scrape every 15 minutes and compare each snapshot to the previous one. Rows older than 6 hours are marked as "Status unknown" so you never act on stale data.',
  },
  {
    q: 'Does Dormra apply on my behalf?',
    a: 'Not yet — today we send you straight to the provider with everything pre-filled when possible. A universal application layer is on the Phase 5 roadmap.',
  },
  {
    q: 'I am not in Vienna — when will you cover my city?',
    a: 'Graz, Salzburg, Innsbruck and Linz come right after Vienna. Berlin, Munich, Prague and Amsterdam follow.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="hero-glow">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-14 text-center md:pt-20">
          <span className="inline-flex rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs font-medium text-brand backdrop-blur-sm">
            How Dormra works
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            One search. Every Vienna student dorm.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Vienna has 70+ dorm buildings across 8+ providers. Each one has its own
            website, its own application process, and rooms that appear and vanish in
            hours. Dormra watches them all so you don&apos;t have to.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5 text-brand" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, desc }) => (
            <article
              key={n}
              className="card-elevated rounded-2xl bg-surface p-6 transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold tracking-wider text-brand">
                  {n}
                </span>
              </div>
              <h3 className="text-base font-medium text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-soft/60">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h2 className="mb-6 text-center text-2xl font-medium text-foreground">
            Frequently asked
          </h2>
          <Accordion className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-medium text-foreground">
          Ready to stop refreshing 8 websites?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Start browsing — set your first alert in under a minute.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} className="h-11 rounded-full px-6 text-sm" render={<Link href="/dorms" />}>
            Browse dorms
          </Button>
          <Button variant="outline" size="lg" nativeButton={false} className="h-11 rounded-full px-6 text-sm" render={<Link href="/signup" />}>
            Create account
          </Button>
        </div>
      </section>
    </main>
  )
}
