import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Garuda – Your Journey, Elevated'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d2b1d 0%, #1a4731 50%, #22613f 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)',
          top: '-100px', right: '-100px', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
          bottom: '-80px', left: '-80px', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', width: '200px', height: '200px',
          borderRadius: '50%', background: 'rgba(245,158,11,0.12)',
          top: '80px', right: '160px', display: 'flex',
        }} />

        {/* Eagle emoji + App name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            fontSize: '96px',
            lineHeight: 1,
            display: 'flex',
          }}>🦅</div>
          <div style={{
            fontSize: '80px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-2px',
            display: 'flex',
          }}>Garuda</div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '32px',
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: '0.5px',
          marginBottom: '48px',
          display: 'flex',
        }}>
          Your Journey, Elevated
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['🗺️ Trip Planning', '💸 Expense Splits', '📸 Gallery', '💬 Group Chat', '✅ Todo Lists'].map(f => (
            <div key={f} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '999px',
              padding: '12px 24px',
              fontSize: '22px',
              color: '#ffffff',
              display: 'flex',
            }}>{f}</div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div style={{
          position: 'absolute',
          bottom: '36px',
          fontSize: '18px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          display: 'flex',
        }}>
          Plan together · Travel better · by iTarunGM
        </div>
      </div>
    ),
    { ...size }
  )
}
