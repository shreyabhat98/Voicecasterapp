'use client';
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';

export default function FramePage() {
  const params = useSearchParams();
  const audioUrl = params.get('audioUrl');

  if (!audioUrl) return (
    <main style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #e5d8f5, #f0e7fa)',
      textAlign: 'center'
    }}>
      <p>❌ No audio URL provided</p>
    </main>
  );

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e5d8f5, #f0e7fa)',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <img src="/mic.svg" alt="mic" width="80" style={{ marginBottom: '1rem' }} />
      <audio controls src={audioUrl} style={{ width: '90%', maxWidth: '300px' }} />
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#333' }}>🎤 VoiceCaster Frame</p>
    </main>
  );
}
