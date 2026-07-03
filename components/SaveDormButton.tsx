'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { toggleSavedDorm } from '@/app/[locale]/dashboard/saved/actions'
import { cn } from '@/lib/utils'

export default function SaveDormButton({
  dormId,
  dormName,
  initialSaved,
}: {
  dormId: string
  dormName: string
  initialSaved: boolean
}) {
  const t = useTranslations('dormDetail')
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
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
        'grid size-9 place-items-center rounded-full backdrop-blur-sm transition-all disabled:opacity-60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
        saved
          ? 'bg-brand text-white shadow-sm hover:bg-brand/90'
          : 'bg-white/90 text-foreground hover:bg-white',
      )}
    >
      <Bookmark className={cn('size-4', saved && 'fill-current')} aria-hidden="true" />
    </button>
  )
}
