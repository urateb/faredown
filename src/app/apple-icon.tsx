import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f766e',
        borderRadius: 40,
      }}
    >
      <svg width="112" height="112" viewBox="0 0 32 32">
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
    </div>,
    { ...size },
  );
}
