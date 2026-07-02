'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
  className?: string
}

/**
 * Card/detail photo with a soft blurred backdrop so wide or low-res
 * provider banners crop cleanly without looking broken.
 */
export default function DormImage({ src, alt, priority = false, sizes, className }: Props) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        aria-hidden
        className="absolute inset-0 scale-110 object-cover blur-2xl opacity-60 saturate-110"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="absolute inset-0 object-cover object-[center_38%] transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10"
        aria-hidden="true"
      />
    </div>
  )
}
