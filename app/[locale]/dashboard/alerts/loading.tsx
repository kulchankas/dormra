import { Skeleton } from '@/components/ui/skeleton'

export default function AlertsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="mt-8 h-8 w-32 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-48 rounded-full" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
