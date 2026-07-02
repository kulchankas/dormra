import { PixelCoffee, PixelTram, PixelTree } from '@/components/pixel/PixelSprite'
import { cn } from '@/lib/utils'

/** Floating pixel accents for hero sections — decorative only. */
export default function PixelHeroDecor({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <PixelTram className="pixel-float-slow absolute -left-1 top-[18%] size-8 opacity-40 md:left-[6%] md:size-10 md:opacity-50" />
      <PixelTree className="pixel-float-delay absolute right-[4%] top-[12%] size-7 opacity-35 md:right-[10%] md:size-9 md:opacity-45" />
      <PixelCoffee className="pixel-float absolute bottom-[22%] left-[8%] size-6 opacity-30 md:left-[14%] md:size-8 md:opacity-40" />
      <PixelTree className="pixel-float-slow absolute bottom-[18%] right-[6%] size-6 rotate-12 opacity-25 md:right-[12%] md:size-7" />
    </div>
  )
}
