import Link from 'next/link'

export default function Header() {
  return (
    <header
      className="w-full bg-white flex items-center justify-between"
      style={{ padding: '14px 24px', borderBottom: '1px solid #FFE4D6' }}
    >
      <Link
        href="/"
        className="font-medium flex-shrink-0"
        style={{ color: '#C2401E', fontSize: '18px' }}
      >
        Dormra
      </Link>

      <nav className="flex items-center gap-5" aria-label="Main navigation">
        <Link
          href="/dorms"
          className="transition-colors hover:text-[#1A1410]"
          style={{ fontSize: '13px', color: '#6B5C53' }}
        >
          Browse dorms
        </Link>
        <Link
          href="/how-it-works"
          className="hidden sm:inline transition-colors hover:text-[#1A1410]"
          style={{ fontSize: '13px', color: '#6B5C53' }}
        >
          How it works
        </Link>
        <Link
          href="/login"
          className="hidden sm:inline transition-colors hover:text-[#1A1410]"
          style={{ fontSize: '13px', color: '#6B5C53' }}
        >
          Log in
        </Link>
        <span
          className="rounded-full border text-[12px] flex-shrink-0"
          style={{ borderColor: '#FFE4D6', color: '#6B5C53', padding: '4px 10px' }}
        >
          EN · EUR
        </span>
      </nav>
    </header>
  )
}
