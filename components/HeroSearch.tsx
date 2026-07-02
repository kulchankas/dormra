'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Search, X, CalendarDays, Euro } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function HeroSearch() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [budget, setBudget] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSearch() {
    const params = new URLSearchParams()
    if (budget) params.set('maxPrice', budget)
    if (selectedDate) params.set('moveIn', format(selectedDate, 'yyyy-MM-dd'))
    const qs = params.toString()
    router.push(qs ? `/dorms?${qs}` : '/dorms')
  }

  const mobileSummary = [
    'Vienna',
    selectedDate ? format(selectedDate, 'd MMM') : 'Any time',
    budget ? `≤ €${budget}` : 'Any budget',
  ].join(' · ')

  return (
    <>
      {/* ── Desktop pill search bar ── */}
      <div
        role="search"
        aria-label="Search dorms"
        className="hidden md:flex items-center w-full max-w-[580px] rounded-pill bg-surface border border-border shadow-[0_0_0_5px_var(--color-brand-soft)] transition-shadow hover:shadow-[0_0_0_5px_var(--color-border)] p-1.5"
      >
        {/* Where */}
        <div className="flex-1 px-4 py-2 rounded-full hover:bg-muted/50 transition-colors cursor-default">
          <p className="text-[10px] font-semibold uppercase tracking-wide leading-none text-muted-foreground mb-1">Where</p>
          <p className="text-sm leading-none font-medium text-foreground">Vienna</p>
        </div>

        <div className="w-px self-stretch my-1.5 bg-border shrink-0" />

        {/* Move-in date */}
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  'flex-1 px-4 py-2 text-left bg-transparent border-none cursor-pointer rounded-full',
                  'hover:bg-muted/50 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                )}
                aria-label={selectedDate ? `Move-in date: ${format(selectedDate, 'dd MMM yyyy')}` : 'Select move-in date'}
              />
            }
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide leading-none text-muted-foreground mb-1">Move in</p>
            <p className={cn('text-sm leading-none font-medium', selectedDate ? 'text-foreground' : 'text-muted-foreground')}>
              {selectedDate ? format(selectedDate, 'd MMM yyyy') : 'Any time'}
            </p>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <div className="w-px self-stretch my-1.5 bg-border shrink-0" />

        {/* Max budget */}
        <div className="flex-1 px-4 py-2 rounded-full hover:bg-muted/50 transition-colors">
          <label htmlFor="hero-budget" className="block text-[10px] font-semibold uppercase tracking-wide leading-none text-muted-foreground mb-1 cursor-pointer">
            Budget
          </label>
          <div className="flex items-center gap-0.5">
            <Euro className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              id="hero-budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={budget}
              onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Any"
              className="block w-full bg-transparent outline-none text-sm leading-none font-medium text-foreground placeholder:text-muted-foreground placeholder:font-normal"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="shrink-0 grid place-items-center text-white bg-brand rounded-full size-11 transition-all hover:bg-brand/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Search dorms"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* ── Mobile: collapsed button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden w-full max-w-[400px] flex items-center gap-3 bg-surface border border-border rounded-pill px-4 py-3 shadow-[0_0_0_4px_var(--color-brand-soft)] hover:shadow-[0_0_0_4px_var(--color-border)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Search dorms"
      >
        <span className="grid place-items-center size-8 rounded-full bg-brand text-white shrink-0">
          <Search className="size-3.5" aria-hidden="true" />
        </span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">Search dorms</p>
          <p className="text-xs text-muted-foreground">{mobileSummary}</p>
        </div>
      </button>

      {/* ── Mobile Sheet ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 pt-5 md:hidden" showCloseButton={false}>
          <SheetHeader className="mb-5 flex-row items-center justify-between p-0">
            <SheetTitle className="text-base">Find your dorm</SheetTitle>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Close search" />
              }
            >
              <X className="size-4" />
            </SheetClose>
          </SheetHeader>

          <div className="space-y-2.5">
            {/* Where */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3.5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Where</p>
                <p className="text-sm font-medium text-foreground">Vienna</p>
              </div>
            </div>

            {/* Mobile date */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                }
              >
                <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Move in</p>
                  <p className={cn('text-sm font-medium', selectedDate ? 'text-foreground' : 'text-muted-foreground')}>
                    {selectedDate ? format(selectedDate, 'd MMM yyyy') : 'Any time'}
                  </p>
                </div>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedDate(undefined) }}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    aria-label="Clear date"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: new Date() }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            {/* Mobile budget */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3.5">
              <Euro className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label htmlFor="mobile-budget" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground pointer-events-none">Budget</Label>
                <div className="flex items-center gap-1 mt-0.5">
                  <Input
                    id="mobile-budget"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={budget}
                    onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
                    placeholder="Any amount"
                    className="h-5 border-0 p-0 text-sm font-medium shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => { setMobileOpen(false); handleSearch() }}
              className="h-12 w-full rounded-full text-sm"
              size="lg"
            >
              <Search className="size-4" />
              Search dorms
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
