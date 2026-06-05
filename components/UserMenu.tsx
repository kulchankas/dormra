'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase-browser'

export default function UserMenu({ displayName }: { displayName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await supabaseAuth.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 transition-colors hover:text-[#1A1410]"
        style={{ fontSize: '13px', color: '#6B5C53', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {displayName}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#fff',
            border: '1px solid #FFE4D6',
            borderRadius: '12px',
            padding: '6px',
            minWidth: '148px',
            boxShadow: '0 4px 16px rgba(26, 20, 16, 0.08)',
            zIndex: 50,
          }}
        >
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center rounded-[8px] transition-colors hover:bg-[#FFF8F4]"
            style={{ fontSize: '13px', color: '#1A1410', padding: '8px 12px', textDecoration: 'none' }}
          >
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left flex items-center rounded-[8px] transition-colors hover:bg-[#FFF8F4]"
            style={{ fontSize: '13px', color: '#1A1410', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
