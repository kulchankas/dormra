import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { type Dorm } from '@/lib/helpers'
import { getAvailabilityStatusBulk, availabilityMapToRecord } from '@/lib/availability'
import { parseFiltersFromParams } from '@/lib/dorm-filters'
import DormsDirectory from '@/components/DormsDirectory'

export const metadata: Metadata = {
  title: 'Vienna Student Dorms — Dormra',
  description:
    'Browse and filter student dormitories across Vienna. Compare price, district, deposit, and availability from all major providers in one directory.',
}

export default async function DormsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const initialFilters = parseFiltersFromParams(params)

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
    <DormsDirectory
      dorms={dorms}
      availability={availabilityMapToRecord(availabilityMap)}
      initialFilters={initialFilters}
    />
  )
}
