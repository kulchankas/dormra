'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function HeroSearch() {
  const router = useRouter()
  const [moveIn, setMoveIn] = useState('')
  const [budget, setBudget] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

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
          <p
            className="font-medium leading-none"
            style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}
          >
            Where
          </p>
          <p className="leading-none" style={{ fontSize: '12px', color: '#6B5C53' }}>
            Vienna
          </p>
        </div>

        <div className="self-stretch" style={{ width: '1px', margin: '4px 0', background: '#FFE4D6' }} />

        {/* Move-in date */}
        <div className="flex-1 text-left" style={{ padding: '7px 14px' }}>
          <label
            htmlFor="hero-movein"
            className="block font-medium leading-none"
            style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}
          >
            Move-in date
          </label>
          <input
            id="hero-movein"
            type="date"
            value={moveIn}
            onChange={(e) => setMoveIn(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="block w-full bg-transparent outline-none leading-none"
            style={{ fontSize: '12px', color: moveIn ? '#1A1410' : '#6B5C53' }}
          />
        </div>

        <div className="self-stretch" style={{ width: '1px', margin: '4px 0', background: '#FFE4D6' }} />

        {/* Max budget */}
        <div className="flex-1 text-left" style={{ padding: '7px 14px' }}>
          <label
            htmlFor="hero-budget"
            className="block font-medium leading-none"
            style={{ fontSize: '10px', color: '#1A1410', marginBottom: '3px' }}
          >
            Max budget
          </label>
          <div className="flex items-center gap-0.5">
            <span className="leading-none" style={{ fontSize: '12px', color: '#6B5C53' }}>
              €
            </span>
            <input
              id="hero-budget"
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '999px',
            background: '#C2401E',
          }}
          aria-label="Search dorms"
        >
          <SearchIcon />
        </button>
      </div>

      {/* ── Mobile: single button ── */}
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

      {/* ── Mobile modal (placeholder) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative w-full bg-white space-y-3"
            style={{ borderRadius: '24px 24px 0 0', padding: '20px 20px 40px' }}
            role="dialog"
            aria-modal="true"
            aria-label="Search dorms"
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
              <h2 className="font-medium" style={{ fontSize: '16px', color: '#1A1410' }}>
                Find your dorm
              </h2>
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
              <p className="text-xs font-medium" style={{ color: '#1A1410', marginBottom: '2px' }}>
                Where
              </p>
              <p className="text-sm" style={{ color: '#6B5C53' }}>Vienna</p>
            </div>

            <div className="rounded-xl border p-3.5" style={{ borderColor: '#FFE4D6' }}>
              <label
                htmlFor="mobile-hero-movein"
                className="block text-xs font-medium"
                style={{ color: '#1A1410', marginBottom: '2px' }}
              >
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
              <label
                htmlFor="mobile-hero-budget"
                className="block text-xs font-medium"
                style={{ color: '#1A1410', marginBottom: '2px' }}
              >
                Max budget
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm" style={{ color: '#6B5C53' }}>€</span>
                <input
                  id="mobile-hero-budget"
                  type="number"
                  min={0}
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
