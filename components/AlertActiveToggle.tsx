'use client'

import { useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { toggleAlertActive } from '@/app/[locale]/dashboard/alerts/actions'

export default function AlertActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter()
  const [optimistic, setOptimistic] = useState(active)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    setOptimistic(next)
    startTransition(async () => {
      const result = await toggleAlertActive(id, next)
      if (result.error) {
        setOptimistic(!next)
        toast.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">
        {optimistic ? 'Active' : 'Paused'}
      </span>
      <Switch
        checked={optimistic}
        onCheckedChange={handleChange}
        disabled={isPending}
        aria-label={optimistic ? 'Pause alert' : 'Resume alert'}
      />
    </div>
  )
}
