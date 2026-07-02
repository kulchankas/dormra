'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { deleteAlert } from '@/app/[locale]/dashboard/alerts/actions'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export default function DeleteAlertButton({ id }: { id: string }) {
  const t = useTranslations('dashboard')
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
    const result = await deleteAlert(id)
    if (result.error) {
      setPending(false)
      setConfirmed(false)
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
      className={cn(confirmed && 'h-8 rounded-full px-2.5 text-xs')}
      aria-label={confirmed ? t('confirmDelete') : t('deleteAlert')}
    >
      <Trash2 className="size-3.5" />
      {confirmed && <span>{t('deleteConfirm')}</span>}
    </Button>
  )
}
