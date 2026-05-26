'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAlert } from '@/app/dashboard/alerts/actions'
import { useRouter } from 'next/navigation'

export default function DeleteAlertButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirmed) {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 3000)
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
      size="icon-sm"
      onClick={handleClick}
      disabled={pending}
      aria-label={confirmed ? 'Confirm delete' : 'Delete alert'}
    >
      <Trash2 className="size-3.5" />
      {confirmed && <span className="ml-1 text-xs">Confirm?</span>}
    </Button>
  )
}
