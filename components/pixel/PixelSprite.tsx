import { cn } from '@/lib/utils'

/** Renders a tiny pixel grid as crisp SVG rects. */
export function PixelSprite({
  grid,
  colors,
  className,
  'aria-label': ariaLabel,
}: {
  grid: string[]
  colors: Record<string, string>
  className?: string
  'aria-label'?: string
}) {
  const width = grid[0]?.length ?? 0
  const height = grid.length

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('pixel-crisp shrink-0', className)}
      shapeRendering="crispEdges"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = colors[ch]
          if (!fill) return null
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
        }),
      )}
    </svg>
  )
}

const BRAND = '#B8381A'
const ACCENT = '#E85D3B'
const SOFT = '#F9E8E2'
const MUTED = '#6B5E56'
const DARK = '#14110F'
const SKY = '#D4E8F7'
const LEAF = '#5A9E6F'
const TRAM = '#E85D3B'

/** Vienna dorm — pixel placeholder when no photo. */
export function PixelDormBuilding({ className }: { className?: string }) {
  return (
    <PixelSprite
      className={className}
      aria-label="Pixel dorm building illustration"
      colors={{
        b: BRAND,
        a: ACCENT,
        s: SOFT,
        m: MUTED,
        d: DARK,
        k: SKY,
        w: '#FFFFFF',
      }}
      grid={[
        '........kkkkkkkk........',
        '.......kkkkkkkkkk.......',
        '......kkkkkkkkkkkk......',
        '........bbbbbb..........',
        '.......bbbbbbbb.........',
        '......bbbbbbbbbb........',
        '.....bbbbbbbbbbbb.......',
        '....bbbbwwbbwwbbbb......',
        '....bbwwbbwwbbwwbb......',
        '....bbbbwwbbwwbbbb......',
        '....bbbbbbbbbbbbbb......',
        '....bbbbbbbbbbbbbb......',
        '....bbbbbbbbbbbbbb......',
        '....bbwwbbbbwwbbbb......',
        '....bbwwbbbbwwbbbb......',
        '....bbbbbbbbbbbbbb......',
        '....bbbbbbbbbbbbbb......',
        '.....bbbbbbbbbbbb.......',
        '......bbbbbbbbbb........',
        '.......bbbbbbbb.........',
        '........bbbbbb..........',
        '.........aaaa...........',
        '.........aaaa...........',
      ]}
    />
  )
}

export function PixelTram({ className }: { className?: string }) {
  return (
    <PixelSprite
      className={className}
      aria-label="Pixel tram"
      colors={{ t: TRAM, d: DARK, w: '#FFFFFF', r: '#C9B5A6' }}
      grid={[
        '..tttttttt..',
        '.ttwwwwwwtt.',
        'ttwwwwwwwwtt',
        'ttwwwwwwwwtt',
        'tttttttttttt',
        '.rr....rr...',
        '.rr....rr...',
      ]}
    />
  )
}

export function PixelTree({ className }: { className?: string }) {
  return (
    <PixelSprite
      className={className}
      aria-label="Pixel tree"
      colors={{ l: LEAF, d: MUTED }}
      grid={[
        '....ll....',
        '...llll...',
        '..llllll..',
        '...llll...',
        '....ll....',
        '....dd....',
        '....dd....',
      ]}
    />
  )
}

export function PixelCoffee({ className }: { className?: string }) {
  return (
    <PixelSprite
      className={className}
      aria-label="Pixel coffee cup"
      colors={{ c: MUTED, d: DARK, s: SOFT }}
      grid={[
        '...cccc...',
        '..cccccc..',
        '..cssssc..',
        '..cssssc..',
        '..cccccc..',
        '...cccc...',
        '....dd....',
      ]}
    />
  )
}

export function PixelBook({ className }: { className?: string }) {
  return (
    <PixelSprite
      className={className}
      aria-label="Pixel book"
      colors={{ b: BRAND, a: ACCENT, w: '#FFFFFF' }}
      grid={[
        '..bbbb....',
        '..bwwb....',
        '..bwwb....',
        '..bwwb....',
        '..baab....',
        '..bbbb....',
      ]}
    />
  )
}

export type PixelAccent = 'tram' | 'tree' | 'coffee' | 'book'

export function pickPixelAccent(seed: string): PixelAccent {
  const accents: PixelAccent[] = ['tram', 'tree', 'coffee', 'book']
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i) * (i + 1)) % accents.length
  return accents[hash]!
}

export function PixelAccentIcon({ accent, className }: { accent: PixelAccent; className?: string }) {
  switch (accent) {
    case 'tram':
      return <PixelTram className={className} />
    case 'tree':
      return <PixelTree className={className} />
    case 'coffee':
      return <PixelCoffee className={className} />
    case 'book':
      return <PixelBook className={className} />
  }
}

/** L-shaped pixel corner bracket for photo frames. */
export function PixelCorner({
  className,
  position,
}: {
  className?: string
  position: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const rotation =
    position === 'tr' ? 'rotate-90' : position === 'br' ? 'rotate-180' : position === 'bl' ? '-rotate-90' : ''

  return (
    <PixelSprite
      className={cn(rotation, className)}
      colors={{ p: BRAND, a: ACCENT }}
      grid={[
        'pppp...',
        'paa...',
        'p.....',
        'p.....',
        'p.....',
      ]}
    />
  )
}
