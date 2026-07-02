'use client'

import { useState, useTransition } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { exportAccountData } from '@/lib/account-actions'
import { Button } from '@/components/ui/button'

export default function ExportAccountDataButton() {
  const t = useTranslations('settings')
  const [isPending, startTransition] = useTransition()
  const [exported, setExported] = useState(false)

  function handleExport() {
    startTransition(async () => {
      const result = await exportAccountData()
      if (result.error || !result.data) {
        toast.error(result.error ?? t('exportFailed'))
        return
      }

      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `dormra-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setExported(true)
      toast.success(t('exportSuccess'))
    })
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2 rounded-full px-4"
        disabled={isPending}
        onClick={handleExport}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        {t('exportData')}
      </Button>
      {exported && (
        <p className="text-xs text-muted-foreground">{t('exportHint')}</p>
      )}
    </div>
  )
}
