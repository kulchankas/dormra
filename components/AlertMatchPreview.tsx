'use client'

import { useEffect, useState } from 'react'
import { Loader2, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { countMatches, type UIMatchCriteria } from '@/lib/alertMatch'
import type { Dorm } from '@/lib/helpers'

export default function AlertMatchPreview({ criteria }: { criteria: UIMatchCriteria }) {
  const [dorms, setDorms] = useState<Dorm[] | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .then(({ data }) => setDorms((data ?? []) as Dorm[]))
  }, [])

  if (dorms === null) {
    return (
      <div className="card-elevated flex items-center gap-2 rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking matches…
      </div>
    )
  }

  const count = countMatches(dorms, criteria)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft/40 p-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
        <Home className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {count} dorm{count !== 1 ? 's' : ''} match right now
        </p>
        <p className="text-xs text-muted-foreground">
          Based on current listings · we&apos;ll email you when availability opens.
        </p>
      </div>
    </div>
  )
}
