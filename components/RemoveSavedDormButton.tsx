'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { removeSavedDorm } from '@/app/[locale]/dashboard/saved/actions'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export default function RemoveSavedDormButton({ trackerId }: { trackerId: string }) {
  const t = useTranslations('saved')
  const [pending, setPending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirmed) {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 4000)
      return
    }
    setPending(true)
    const result = await removeSavedDorm(trackerId)
    if (result.error) {
      setPending(false)
      setConfirmed(false)
      toast.error(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <Button
      variant={confirmed ? 'destructive' : 'ghost'}
      size={confirmed ? 'sm' : 'icon-sm'}
      onClick={handleClick}
      disabled={pending}
      className={cn('shrink-0', confirmed && 'h-8 rounded-full px-2.5 text-xs')}
      aria-label={confirmed ? t('confirmRemove') : t('remove')}
    >
      <Trash2 className="size-3.5" />
      {confirmed && <span>{t('removeConfirm')}</span>}
    </Button>
  )
}
