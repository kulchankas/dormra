import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full md:grid md:grid-cols-2">
      {/* ── Brand panel ── */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-brand-foreground md:flex"
        aria-hidden="true"
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5 blur-3xl" />

        <Link
          href="/"
          aria-hidden={false}
          className="relative z-10 inline-flex items-center gap-2 text-lg font-medium"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Sparkles className="size-4" />
          </span>
          Dormra
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="max-w-md text-3xl font-medium leading-tight">
            Every Vienna student dorm.
            <br />
            One search.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-brand-foreground/85">
            Stop refreshing 8 websites a day. Set your criteria once — Dormra watches
            every provider and pings you the moment a matching room opens up.
          </p>
        </div>

        <p className="relative z-10 text-xs text-brand-foreground/70">
          Trusted by students from BOKU, TU Wien, WU and more.
        </p>
      </aside>

      {/* ── Mobile brand banner ── */}
      <div className="bg-brand md:hidden">
        <div className="flex items-center justify-between px-5 py-4 text-brand-foreground">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium">
            <span className="grid size-7 place-items-center rounded-md bg-white/15">
              <Sparkles className="size-3.5" />
            </span>
            Dormra
          </Link>
          <Link href="/dorms" className="text-xs text-brand-foreground/85 hover:underline">
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
