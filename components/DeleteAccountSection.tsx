'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { deleteAccount } from '@/lib/account-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function DeleteAccountSection({ email }: { email: string }) {
  const t = useTranslations('settings')
  const [confirmText, setConfirmText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase()

  function handleDelete() {
    if (!canDelete) return
    startTransition(async () => {
      const result = await deleteAccount()
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  if (!showForm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2 rounded-full border-destructive/30 px-4 text-destructive hover:bg-destructive/5 hover:text-destructive"
        onClick={() => setShowForm(true)}
      >
        <Trash2 className="size-3.5" />
        {t('deleteAccount')}
      </Button>
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
      <p className="text-sm text-foreground">{t('deleteWarning')}</p>
      <p className="text-xs text-muted-foreground">{t('deleteConfirmHint', { email })}</p>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={email}
        className="h-10 rounded-xl bg-background"
        autoComplete="off"
        aria-label={t('deleteConfirmLabel')}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-9 gap-2 rounded-full px-4"
          disabled={!canDelete || isPending}
          onClick={handleDelete}
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          {t('deleteAccountConfirm')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('h-9 rounded-full px-4')}
          disabled={isPending}
          onClick={() => {
            setShowForm(false)
            setConfirmText('')
          }}
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  )
}
