import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Dorm } from '@/lib/helpers'
import { getAvailabilityStatusBulk, availabilityMapToRecord } from '@/lib/availability'
import DormsDirectory from '@/components/DormsDirectory'
import DormsLoading from './loading'

export const metadata: Metadata = {
  title: 'Vienna Student Dorms — Dormra',
  description:
    'Browse and filter student dormitories across Vienna. Compare price, district, deposit, and availability from all major providers in one directory.',
}

export default async function DormsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dorms')
    .select('*')
    .eq('active', true)

  const dorms = (data ?? []) as Dorm[]
  const availabilityMap = await getAvailabilityStatusBulk(
    dorms.map((d) => d.id),
    supabase,
  )

  return (
    <Suspense fallback={<DormsLoading />}>
      <DormsDirectory
        dorms={dorms}
        availability={availabilityMapToRecord(availabilityMap)}
      />
    </Suspense>
  )
}
