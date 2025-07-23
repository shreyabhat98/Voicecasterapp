'use client';

import { useSearchParams } from 'next/navigation';

export function AudioCard() {
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get('audioUrl');

  if (!audioUrl) return <div>Audio not found</div>;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <img src="/mic.svg" alt="mic" style={{ width: 60, height: 60, marginBottom: 20 }} />
      <p style={{ fontSize: 16, marginBottom: 10 }}>🎧 Voice note from Farcaster</p>
      <audio controls src={audioUrl} style={{ width: '80%' }} />
    </div>
  );
}
