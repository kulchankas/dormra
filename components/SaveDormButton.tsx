'use client'

import { useState, useTransition, type MouseEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { toggleSavedDorm } from '@/app/[locale]/dashboard/saved/actions'
import { cn } from '@/lib/utils'

export default function SaveDormButton({
  dormId,
  dormName,
  initialSaved,
  size = 'default',
}: {
  dormId: string
  dormName: string
  initialSaved: boolean
  /** 'sm' fits inside compact DormCard grid tiles. */
  size?: 'default' | 'sm'
}) {
  const t = useTranslations('dormDetail')
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: MouseEvent) {
    // DormCard wraps the whole tile in a Link — stop the click from also
    // triggering navigation to the dorm detail page.
    e.preventDefault()
    e.stopPropagation()

    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const result = await toggleSavedDorm(dormId)
      if (result.error) {
        setSaved(!next)
        toast.error(result.error)
        return
      }
      setSaved(result.saved)
      toast.success(result.saved ? t('savedToast', { name: dormName }) : t('unsavedToast', { name: dormName }))
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      aria-label={saved ? t('unsaveAria', { name: dormName }) : t('saveAria', { name: dormName })}
      className={cn(
        'grid place-items-center rounded-full backdrop-blur-sm transition-all disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
        size === 'sm' ? 'size-7' : 'size-9',
        saved
          ? 'bg-brand text-white shadow-sm hover:bg-brand/90'
          : 'bg-white/90 text-foreground hover:bg-white',
      )}
    >
      <Bookmark className={cn(size === 'sm' ? 'size-3.5' : 'size-4', saved && 'fill-current')} aria-hidden="true" />
    </button>
  )
}
