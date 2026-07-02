import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-56 rounded-full" />
        <Skeleton className="mt-4 h-8 w-48 rounded-full" />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
