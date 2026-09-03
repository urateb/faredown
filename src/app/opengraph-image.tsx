import { ImageResponse } from 'next/og';

export const alt = 'Faredown — know whether the fare is actually good';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#eef3f8',
        padding: 72,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32">
            <path
              d="M7 11.5l6.2 5.6 4-3.2L25 20.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="25" cy="20.5" r="2.8" fill="#fff" />
          </svg>
        </div>
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              fontWeight: 600,
              color: '#1c2838',
              letterSpacing: -0.5,
            }}
          >
            <span>fare</span>
            <span style={{ color: '#0f766e' }}>down</span>
          </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: '#1c2838',
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          Know whether the fare is actually good.
        </div>
        <div style={{ fontSize: 28, color: '#5a6d84', maxWidth: 760 }}>
          Live airline prices, the week around your date, then a hand-off to somewhere that sells
          the ticket.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
