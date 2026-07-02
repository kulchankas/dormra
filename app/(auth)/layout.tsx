import Link from 'next/link'
import DormraLogo from '@/components/DormraLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-2">
      {/* ── Brand panel ── */}
      <aside
        className="hero-glow relative hidden flex-col justify-between overflow-hidden border-r border-border/50 bg-surface-soft p-10 md:flex"
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand/5 blur-3xl" />

        <Link href="/" aria-hidden={false} className="relative z-10 transition-opacity hover:opacity-90">
          <DormraLogo size="lg" variant="inverse" />
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="max-w-md text-3xl font-medium leading-tight text-foreground">
            Every Vienna student dorm.
            <br />
            One search.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Stop refreshing 8 websites a day. Set your criteria once — Dormra watches
            every provider and pings you the moment a matching room opens up.
          </p>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          Trusted by students from BOKU, TU Wien, WU and more.
        </p>
      </aside>

      {/* ── Mobile brand banner ── */}
      <div className="border-b border-border/60 bg-surface-soft md:hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <DormraLogo size="sm" variant="muted" />
          </Link>
          <Link href="/dorms" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            Browse dorms →
          </Link>
        </div>
      </div>

      {/* ── Form panel ── */}
      <main className="flex flex-1 items-center justify-center bg-background px-5 py-10 md:px-10 md:py-16">
        <div className="card-elevated w-full max-w-sm rounded-2xl bg-surface p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
