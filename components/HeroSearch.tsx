'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function formatDate(d: Date): string {
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

// ─── Calendar popover ─────────────────────────────────────────────────────────

function CalendarPopover({
  selected,
  onSelect,
}: {
  selected: Date | null
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const anchor = selected ?? today
  const [viewYear, setViewYear] = useState(anchor.getFullYear())
  const [viewMonth, setViewMonth] = useState(anchor.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Build Mon-first day grid
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        left: 0,
        zIndex: 50,
        background: '#FFFFFF',
        border: '1px solid #FFE4D6',
        borderRadius: '16px',
        padding: '16px',
        width: '268px',
        boxShadow: '0 4px 24px rgba(26, 20, 16, 0.10)',
      }}
    >
      {/* Month / year header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B5C53', fontSize: '20px', lineHeight: 1, padding: '0 6px' }}
        >
          ‹
        </button>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1410', fontFamily: 'inherit' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B5C53', fontSize: '20px', lineHeight: 1, padding: '0 6px' }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {WEEK_DAYS.map(d => (
          <span key={d} style={{ fontSize: '11px', fontWeight: 500, color: '#6B5C53', textAlign: 'center', padding: '2px 0' }}>
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />
          const date = new Date(viewYear, viewMonth, day)
          const isSelected = selected ? sameDay(date, selected) : false
          const isToday = sameDay(date, today)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
              aria-pressed={isSelected}
              className={[
                'rounded-[8px] border-0 cursor-pointer text-center font-[inherit] transition-colors duration-100',
                isSelected
                  ? 'bg-[#C2401E] text-white font-medium'
                  : isToday
                  ? 'bg-[#FFE4D6] text-[#1A1410] hover:bg-[#F5C9B3]'
                  : 'bg-transparent text-[#1A1410] hover:bg-[#FFE4D6]',
              ].join(' ')}
              style={{ fontSize: '13px', padding: '6px 0', fontFamily: 'inherit' }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ─── Main component ───────────────────────────────────────────────────────────

export default function HeroSearch() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [budget, setBudget] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Ref wraps the date field button + the calendar popover so clicks
  // inside either element don't trigger the outside-click close handler.
  const dateWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!calendarOpen) return
    function onMouseDown(e: MouseEvent) {
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [calendarOpen])

  function handleSearch() {
    router.push('/dorms')
  }

  return (
    <>
      {/* ── Desktop search bar ── */}
      <div
        className="hidden md:flex items-center w-full"
        style={{
          maxWidth: '560px',
          borderRadius: '999px',
          background: '#fff',
          border: '1px solid #FFE4D6',
          boxShadow: '0 0 0 4px rgba(255, 228, 214, 0.35)',
          padding: '5px',
        }}
        role="search"
        aria-label="Search dorms"
      >
        {/* Where */}
        <div className="flex-1 text-left" style={{ padding: '7px 14px' }}>
          <p className="font-medium leading-none" style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}>
            Where
          </p>
          <p className="leading-none" style={{ fontSize: '12px', color: '#6B5C53' }}>Vienna</p>
        </div>

        <div className="self-stretch" style={{ width: '1px', margin: '4px 0', background: '#FFE4D6' }} />

        {/* Move-in date — custom calendar popover */}
        <div ref={dateWrapperRef} className="flex-1 relative">
          <button
            type="button"
            onClick={() => setCalendarOpen(v => !v)}
            className="w-full text-left"
            style={{ padding: '7px 14px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-expanded={calendarOpen}
            aria-haspopup="dialog"
          >
            <p className="font-medium leading-none" style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}>
              Move-in date
            </p>
            <p className="leading-none" style={{ fontSize: '12px', color: selectedDate ? '#1A1410' : '#6B5C53' }}>
              {selectedDate ? formatDate(selectedDate) : 'Add date'}
            </p>
          </button>

          {calendarOpen && (
            <CalendarPopover
              selected={selectedDate}
              onSelect={date => { setSelectedDate(date); setCalendarOpen(false) }}
            />
          )}
        </div>

        <div className="self-stretch" style={{ width: '1px', margin: '4px 0', background: '#FFE4D6' }} />

        {/* Max budget — text input strips non-numeric, shows numeric keyboard on mobile */}
        <div className="flex-1 text-left" style={{ padding: '7px 14px' }}>
          <label htmlFor="hero-budget" className="block font-medium leading-none" style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}>
            Max budget
          </label>
          <div className="flex items-center gap-0.5">
            <span className="leading-none" style={{ fontSize: '12px', color: '#6B5C53' }}>€</span>
            <input
              id="hero-budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={budget}
              onChange={e => setBudget(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Any"
              className="block w-full bg-transparent outline-none leading-none"
              style={{ fontSize: '12px', color: '#1A1410' }}
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 flex items-center justify-center text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B47]"
          style={{ width: '38px', height: '38px', borderRadius: '999px', background: '#C2401E' }}
          aria-label="Search dorms"
        >
          <SearchIcon />
        </button>
      </div>

      {/* ── Mobile: single collapsed button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden w-full font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B47]"
        style={{
          maxWidth: '560px',
          borderRadius: '999px',
          background: '#C2401E',
          fontSize: '14px',
          padding: '13px 24px',
          border: '1px solid #FFE4D6',
          boxShadow: '0 0 0 4px rgba(255, 228, 214, 0.35)',
        }}
      >
        Search dorms
      </button>

      {/* ── Mobile modal ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div
            className="relative w-full bg-white space-y-3"
            style={{ borderRadius: '24px 24px 0 0', padding: '20px 20px 40px' }}
            role="dialog"
            aria-modal="true"
            aria-label="Search dorms"
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <h2 className="font-medium" style={{ fontSize: '16px', color: '#1A1410' }}>Find your dorm</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-full transition-colors hover:bg-[#FFE4D6]"
                style={{ color: '#6B5C53' }}
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="rounded-xl border p-3.5" style={{ borderColor: '#FFE4D6' }}>
              <p className="text-xs font-medium" style={{ color: '#1A1410', marginBottom: '2px' }}>Where</p>
              <p className="text-sm" style={{ color: '#6B5C53' }}>Vienna</p>
            </div>

            <div className="rounded-xl border p-3.5" style={{ borderColor: '#FFE4D6' }}>
              <label htmlFor="mobile-hero-movein" className="block text-xs font-medium" style={{ color: '#1A1410', marginBottom: '2px' }}>
                Move-in date
              </label>
              <input
                id="mobile-hero-movein"
                type="date"
                className="text-sm w-full outline-none bg-transparent"
                style={{ color: '#6B5C53' }}
              />
            </div>

            <div className="rounded-xl border p-3.5" style={{ borderColor: '#FFE4D6' }}>
              <label htmlFor="mobile-hero-budget" className="block text-xs font-medium" style={{ color: '#1A1410', marginBottom: '2px' }}>
                Max budget
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm" style={{ color: '#6B5C53' }}>€</span>
                <input
                  id="mobile-hero-budget"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Any amount"
                  className="text-sm w-full outline-none bg-transparent"
                  style={{ color: '#1A1410' }}
                />
              </div>
            </div>

            <button
              onClick={() => { setMobileOpen(false); handleSearch() }}
              className="w-full font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#C2401E', borderRadius: '999px', padding: '12px', fontSize: '14px' }}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </>
  )
}
