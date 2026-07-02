import fs from 'fs'
import path from 'path'
import type { ReactNode } from 'react'

/**
 * "Trusted by students from" conveyor-belt logo wall.
 *
 * HOW TO ADD REAL LOGOS — no code changes needed:
 *   1. Get the official logo (with permission to use it).
 *   2. Save it as /public/logos/<slug>.svg  (png/webp/jpg also work).
 *      Use the `slug` shown in each entry below, e.g. "uni-wien.svg".
 *   3. Refresh. The component detects the file and renders it automatically,
 *      replacing the original placeholder emblem below.
 *
 * The placeholder emblems are ORIGINAL marks (not the universities' real
 * trademarked logos) so the wall works immediately and licence-free.
 */

type Uni = {
  name: string
  /** file name (without extension) to look for in /public/logos */
  slug: string
  emblem: ReactNode
  wordmark: ReactNode
}

const stroke = 'currentColor'

const UNIVERSITIES: Uni[] = [
  {
    name: 'Universität Wien',
    slug: 'uni-wien',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke={stroke} strokeWidth="1.5" />
        <path d="M11 11v7a5 5 0 0 0 10 0v-7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    wordmark: (
      <span className="font-serif text-base leading-none tracking-tight md:text-lg">
        Universität <span className="font-semibold">Wien</span>
      </span>
    ),
  },
  {
    name: 'TU Wien',
    slug: 'tu-wien',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <rect x="3" y="3" width="26" height="26" rx="3" stroke={stroke} strokeWidth="1.5" />
        <path d="M9 11h14M16 11v11" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    wordmark: (
      <span className="text-base font-bold leading-none tracking-tight md:text-lg">
        TU<span className="font-light">Wien</span>
      </span>
    ),
  },
  {
    name: 'WU Wien',
    slug: 'wu-wien',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <path d="M5 7l4 18 7-12 7 12 4-18" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
    wordmark: (
      <span className="text-base font-extrabold leading-none tracking-[0.12em] md:text-lg">
        WU
        <span className="ml-1 align-top text-[10px] font-medium tracking-normal">WIEN</span>
      </span>
    ),
  },
  {
    name: 'BOKU',
    slug: 'boku',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <path d="M16 28V13" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 16c0-4 3-7 9-8-1 6-4 9-9 9zM16 19c0-3-2.5-5.5-8-6 .8 5 3.5 7 8 7z" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
    wordmark: (
      <span className="text-base font-semibold leading-none tracking-[0.25em] md:text-lg">
        BOKU
      </span>
    ),
  },
  {
    name: 'MedUni Wien',
    slug: 'meduni-wien',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke={stroke} strokeWidth="1.5" />
        <path d="M16 9v14M9 16h14" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    wordmark: (
      <span className="font-serif text-base italic leading-none md:text-lg">
        Med<span className="not-italic font-semibold">Uni</span> Wien
      </span>
    ),
  },
  {
    name: 'FH Campus Wien',
    slug: 'fh-campus-wien',
    emblem: (
      <svg viewBox="0 0 32 32" fill="none" className="size-7" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="7" stroke={stroke} strokeWidth="1.5" />
        <path d="M11 22V11h7M11 16.5h5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    wordmark: (
      <span className="text-base font-medium leading-none tracking-tight md:text-lg">
        FH Campus <span className="font-semibold">Wien</span>
      </span>
    ),
  },
]

/** Repeat each half enough times to cover ultrawide viewports without gaps. */
const REPEATS_PER_HALF = 4

// ── Detect dropped-in logo files at render time (server component) ──────────
const LOGO_DIR = path.join(process.cwd(), 'public', 'logos')
const EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg']

function findLogoSrc(slug: string): string | null {
  for (const ext of EXTENSIONS) {
    try {
      if (fs.existsSync(path.join(LOGO_DIR, `${slug}.${ext}`))) {
        return `/logos/${slug}.${ext}`
      }
    } catch {
      /* ignore fs errors, fall back to placeholder */
    }
  }
  return null
}

function LogoMark({ uni }: { uni: Uni }) {
  const src = findLogoSrc(uni.slug)
  if (src) {
    return (
      // Plain <img>: works for any dropped-in file (svg/png) with no Next config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={uni.name}
        className="h-7 w-auto max-w-[140px] object-contain object-left md:h-8 md:max-w-[160px]"
      />
    )
  }
  return (
    <>
      {uni.emblem}
      {uni.wordmark}
    </>
  )
}

function buildHalfStrip() {
  return Array.from({ length: REPEATS_PER_HALF }, () => UNIVERSITIES).flat()
}

export default function UniversityLogos() {
  const halfStrip = buildHalfStrip()
  const trackItems = [...halfStrip, ...halfStrip]

  return (
    <div className="marquee-mask relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="marquee-track gap-x-9 md:gap-x-12">
        {trackItems.map((uni, index) => {
          const isClone = index >= halfStrip.length
          return (
            <div
              key={`${uni.slug}-${index}`}
              data-marquee-clone={isClone ? '' : undefined}
              aria-hidden={isClone || undefined}
              title={uni.name}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-muted-foreground/70 transition-all duration-200 hover:text-foreground hover:opacity-100"
            >
              <LogoMark uni={uni} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
