'use client'

import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase-browser'

export default function LogoutButton({
  className,
  style,
  children = 'Log out',
}: {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  const router = useRouter()

  async function handleLogout() {
    await supabaseAuth.auth.signOut()
    router.push('/')
    router.refresh() // Force server components to re-render with cleared session
  }

  return (
    <button type="button" onClick={handleLogout} className={className} style={style}>
      {children}
    </button>
  )
}
