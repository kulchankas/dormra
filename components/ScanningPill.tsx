'use client'

import { useEffect, useState } from 'react'
import { DISTRICT_NAMES } from '@/lib/helpers'

const DISTRICTS = Object.values(DISTRICT_NAMES)

export default function ScanningPill() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % DISTRICTS.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Scanning{' '}
      <span
        key={index}
        className="font-medium text-foreground animate-in fade-in slide-in-from-bottom-1 duration-300"
      >
        {DISTRICTS[index]}
      </span>{' '}
      right now
    </span>
  )
}
