import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerUser } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? ''
  const firstName = fullName.split(' ')[0] || user.email?.split('@')[0] || 'there'

  const placeholderCards = [
    { title: 'Your alerts', icon: '🔔' },
    { title: 'Saved dorms', icon: '🏠' },
    { title: 'Application tracker', icon: '📋' },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#FFF8F4' }}>
      <div className="mx-auto px-6 py-12" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-medium" style={{ fontSize: '28px', color: '#1A1410', marginBottom: '6px' }}>
            Welcome, {firstName}
          </h1>
          <p style={{ fontSize: '15px', color: '#6B5C53' }}>Your Dormra dashboard</p>
        </div>

        {/* Placeholder feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '48px' }}>
          {placeholderCards.map(({ title, icon }) => (
            <div
              key={title}
              style={{
                background: '#fff',
                border: '1px solid #FFE4D6',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{icon}</div>
              <h2 className="font-medium" style={{ fontSize: '15px', color: '#1A1410', marginBottom: '6px' }}>
                {title}
              </h2>
              <p style={{ fontSize: '13px', color: '#6B5C53' }}>Coming soon</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div
          style={{
            borderTop: '1px solid #FFE4D6',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/dorms"
            className="text-[13px] hover:underline"
            style={{ color: '#C2401E' }}
          >
            Browse dorms →
          </Link>

          <LogoutButton
            className="text-[13px] rounded-[8px] transition-colors hover:bg-[#D5D5D5]"
            style={{
              background: '#E5E5E5',
              color: '#1A1410',
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </main>
  )
}
