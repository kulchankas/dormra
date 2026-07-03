import { ImageResponse } from 'next/og'

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const
export const OG_IMAGE_CONTENT_TYPE = 'image/png'

const TAGLINE: Record<string, string> = {
  en: 'Every student dorm in Vienna. One search.',
  de: 'Jedes Studentenheim in Wien. Eine Suche.',
  ru: 'Все общежития Вены. Один поиск.',
}

const BADGE: Record<string, string> = {
  en: 'Vienna student housing',
  de: 'Studentenheime in Wien',
  ru: 'Общежития в Вене',
}

/** Shared brand OG/Twitter card image — coral background, house mark, tagline. */
export function renderOgImage(locale: string) {
  const tagline = TAGLINE[locale] ?? TAGLINE.en
  const badge = BADGE[locale] ?? BADGE.en

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FBEEE9 0%, #F3D9CE 100%)',
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 96,
              height: 96,
              borderRadius: 24,
              background: '#F9E8E2',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 15.5 16 9l8 6.5V23a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 23V15.5Z"
                stroke="#B8381A"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path d="M13.5 24.5v-5h5v5" stroke="#B8381A" strokeWidth="1.75" strokeLinejoin="round" />
              <circle cx="22.5" cy="13" r="1.75" fill="#E85D3B" />
            </svg>
          </div>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#B8381A' }}>Dormra</span>
        </div>
        <span style={{ fontSize: 40, fontWeight: 600, color: '#3D2A24', textAlign: 'center' }}>{tagline}</span>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            padding: '10px 28px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.65)',
            fontSize: 26,
            color: '#8A4A36',
          }}
        >
          {badge}
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  )
}
