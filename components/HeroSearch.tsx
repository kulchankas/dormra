'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
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
    router.push('/dorms')
  }

  return (
    <>
      {/* ── Desktop pill search bar ── */}
      <div
        className="hidden md:flex items-center w-full max-w-[560px]"
        role="search"
        aria-label="Search dorms"
        style={{
          borderRadius: 'var(--radius-pill)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 0 0 4px color-mix(in oklch, var(--color-border) 60%, transparent)',
          padding: '5px',
        }}
      >
        {/* Where */}
        <div className="flex-1 px-3.5 py-2 text-left">
          <p className="text-[10px] font-medium leading-none text-foreground mb-1">Where</p>
          <p className="text-xs leading-none text-muted-foreground">Vienna</p>
        </div>

        <div className="self-stretch my-1" style={{ width: 1, background: 'var(--color-border)' }} />

        {/* Move-in date — shadcn Popover + Calendar */}
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  'flex-1 px-3.5 py-2 text-left bg-transparent border-none cursor-pointer',
                  'rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                )}
                aria-label={selectedDate ? `Move-in date: ${format(selectedDate, 'dd MMM yyyy')}` : 'Select move-in date'}
              />
            }
          >
            <p className="text-[10px] font-medium leading-none text-foreground mb-1">Move-in date</p>
            <p className={cn('text-xs leading-none', selectedDate ? 'text-foreground' : 'text-muted-foreground')}>
              {selectedDate ? format(selectedDate, 'd MMM yyyy') : 'Add date'}
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

        <div className="self-stretch my-1" style={{ width: 1, background: 'var(--color-border)' }} />

        {/* Max budget */}
        <div className="flex-1 px-3.5 py-2 text-left">
          <label htmlFor="hero-budget" className="block text-[10px] font-medium leading-none text-foreground mb-1">
            Max budget
          </label>
          <div className="flex items-center gap-0.5">
            <span className="text-xs leading-none text-muted-foreground">€</span>
            <input
              id="hero-budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={budget}
              onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Any"
              className="block w-full bg-transparent outline-none text-xs leading-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 grid place-items-center text-white rounded-full size-10 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ background: 'var(--color-brand)' }}
          aria-label="Search dorms"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* ── Mobile: collapsed button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden w-full max-w-[560px] font-medium text-sm text-white rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center gap-2"
        style={{
          background: 'var(--color-brand)',
          padding: '13px 24px',
          boxShadow: '0 0 0 4px color-mix(in oklch, var(--color-border) 60%, transparent)',
        }}
      >
        <Search className="size-4" aria-hidden="true" />
        Search dorms
      </button>

      {/* ── Mobile Sheet ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-10 pt-5 md:hidden" showCloseButton={false}>
          <SheetHeader className="mb-4 flex-row items-center justify-between p-0">
            <SheetTitle>Find your dorm</SheetTitle>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Close search" />
              }
            >
              <X className="size-4" />
            </SheetClose>
          </SheetHeader>

          <div className="space-y-3">
            <div className="rounded-xl border border-border p-3.5">
              <p className="text-xs font-medium text-foreground mb-1">Where</p>
              <p className="text-sm text-muted-foreground">Vienna</p>
            </div>

            {/* Mobile date: Calendar inside a Popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="w-full rounded-xl border border-border p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                }
              >
                <Label className="text-xs font-medium pointer-events-none">Move-in date</Label>
                <p className={cn('mt-1 text-sm', selectedDate ? 'text-foreground' : 'text-muted-foreground')}>
                  {selectedDate ? format(selectedDate, 'd MMM yyyy') : 'Add date'}
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

            <div className="rounded-xl border border-border p-3.5">
              <Label htmlFor="mobile-budget" className="text-xs font-medium">Max budget</Label>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm text-muted-foreground">€</span>
                <Input
                  id="mobile-budget"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Any amount"
                  className="h-6 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <Button
              onClick={() => { setMobileOpen(false); handleSearch() }}
              className="h-11 w-full rounded-full text-sm"
              size="lg"
            >
              Search
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
