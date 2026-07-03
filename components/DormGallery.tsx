'use client'

import { useState, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DormImage from '@/components/DormImage'
import { cn } from '@/lib/utils'

export default function DormGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations('dormCard')
  const [index, setIndex] = useState(0)
  const hasMultiple = images.length > 1

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') go(-1)
    if (e.key === 'ArrowRight') go(1)
  }

  return (
    <div
      className="relative h-full w-full outline-none"
      role={hasMultiple ? 'group' : undefined}
      aria-roledescription={hasMultiple ? 'carousel' : undefined}
      aria-label={hasMultiple ? t('galleryAria', { name: alt }) : undefined}
      tabIndex={hasMultiple ? 0 : undefined}
      onKeyDown={hasMultiple ? handleKeyDown : undefined}
    >
      <DormImage src={images[index]} alt={`${alt} — ${index + 1}/${images.length}`} priority sizes="(max-width: 768px) 100vw, 768px" />

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('galleryPrev')}
            className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('galleryNext')}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t('galleryGoTo', { index: i + 1 })}
                aria-current={i === index}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80',
                )}
              />
            ))}
          </div>

          <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  )
}
