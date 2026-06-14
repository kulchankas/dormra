import type { ReactNode } from 'react'

/**
 * "Trusted by students from" logo wall.
 *
 * These are ORIGINAL emblem marks (not the universities' official trademarked
 * logos) so the wall works immediately without any licensing concerns. To use
 * real logos: drop SVG/PNG files in /public/logos and replace each `emblem`
 * with <Image src="/logos/xxx.svg" .../>.
 */

type Uni = {
  name: string
  /** small original emblem shown left of the wordmark */
  emblem: ReactNode
  /** wordmark typographic treatment */
  wordmark: ReactNode
}

const stroke = 'currentColor'

const UNIVERSITIES: Uni[] = [
  {
    name: 'Universität Wien',
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

function LogoGroup({ clone = false }: { clone?: boolean }) {
  return (
    <ul
      aria-hidden={clone || undefined}
      data-marquee-clone={clone ? '' : undefined}
      className="flex shrink-0 items-center gap-x-9 pr-9 md:gap-x-12 md:pr-12"
    >
      {UNIVERSITIES.map(({ name, emblem, wordmark }) => (
        <li
          key={name}
          title={name}
          className="flex items-center gap-2.5 whitespace-nowrap text-muted-foreground/50 grayscale transition-all duration-200 hover:text-brand hover:grayscale-0"
        >
          {emblem}
          {wordmark}
        </li>
      ))}
    </ul>
  )
}

export default function UniversityLogos() {
  return (
    <div
      className="marquee-mask relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="marquee-track">
        <LogoGroup />
        <LogoGroup clone />
      </div>
    </div>
  )
}
