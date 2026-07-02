'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  PixelAccentIcon,
  PixelCorner,
  PixelDormBuilding,
  pickPixelAccent,
} from '@/components/pixel/PixelSprite'

interface Props {
  imageUrl: string | null
  name: string
  provider: string
  /** Stable id for picking a decorative pixel accent (slug or id). */
  seed: string
  priority?: boolean
  sizes?: string
  className?: string
  /** Tailwind height/aspect class on the outer frame, e.g. `aspect-video` or `h-[140px]`. */
  frameClassName?: string
}

/**
 * Dorm hero photo with pixel frame accents and a blurred backdrop so
 * low-res provider banners still look intentional.
 */
export default function DormPhoto({
  imageUrl,
  name,
  provider,
  seed,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className,
  frameClassName = 'aspect-video',
}: Props) {
  const accent = pickPixelAccent(seed)

  return (
    <div
      className={cn(
        'dorm-photo-frame relative w-full overflow-hidden bg-brand-soft',
        frameClassName,
        className,
      )}
    >
      {/* Subtle pixel grid — makes compression artifacts feel lo-fi on purpose */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07] dorm-photo-grid" aria-hidden="true" />

      {imageUrl ? (
        <>
          {/* Soft blurred fill behind the sharp image */}
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={sizes}
            aria-hidden
            className="absolute inset-0 scale-110 object-cover blur-2xl opacity-70 saturate-125"
          />
          <Image
            src={imageUrl}
            alt={`${name} dormitory`}
            fill
            sizes={sizes}
            priority={priority}
            className="absolute inset-0 z-[2] object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Warm gradient so badges stay readable on bright banners */}
          <div
            className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[rgb(20_17_15/0.35)] via-transparent to-[rgb(20_17_15/0.12)]"
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="relative z-[2] flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-soft via-surface-soft to-background px-4">
          <PixelDormBuilding className="size-16 opacity-90 md:size-20" />
          <span className="text-xs font-medium text-muted-foreground">{provider}</span>
        </div>
      )}

      {/* Pixel corner brackets */}
      <PixelCorner position="tl" className="absolute left-1.5 top-1.5 z-[4] size-5 opacity-90" />
      <PixelCorner position="tr" className="absolute right-1.5 top-1.5 z-[4] size-5 opacity-90" />
      <PixelCorner position="bl" className="absolute bottom-1.5 left-1.5 z-[4] size-5 opacity-90" />
      <PixelCorner position="br" className="absolute bottom-1.5 right-1.5 z-[4] size-5 opacity-90" />

      {/* Small pixel accent sticker */}
      <div
        className="absolute bottom-2.5 right-2.5 z-[4] rounded-md bg-surface/85 p-1 shadow-sm ring-1 ring-border/60 backdrop-blur-sm"
        aria-hidden="true"
      >
        <PixelAccentIcon accent={accent} className="size-5" />
      </div>
    </div>
  )
}
