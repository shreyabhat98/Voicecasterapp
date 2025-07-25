'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { convertAudioToMp4 } from '@/lib/audioToMp4';

export function AudioCard() {
  const searchParams = useSearchParams();
  const audioUrl = searchParams.get('audioUrl');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    let blobUrl: string | null = null;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error('Could not fetch audio file');
        const audioBlob = await res.blob();
        const mp4Blob = await convertAudioToMp4(audioBlob);
        blobUrl = URL.createObjectURL(mp4Blob);
        setVideoUrl(blobUrl);
      } catch (err: any) {
        setError(err.message || 'Video rendering failed');
      } finally {
        setLoading(false);
      }
    })();

    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [audioUrl]);

  if (!audioUrl) return <div>Missing audio URL</div>;
  if (loading) return <div>Rendering MP4 Video… (This may take up to 30s)</div>;
  if (error) return <div style={{ color: 'red' }}>Failed: {error}</div>;
  if (!videoUrl) return <div>Loading…</div>;

  return (
    <div
      style={{
        width: 360,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 18,
        boxShadow: '0 7px 22px rgba(107,70,193,0.09)',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <video
        src={videoUrl}
        controls
        style={{
          width: '100%',
          maxHeight: 360,
          borderRadius: 16,
          background: '#faf7ff'
        }}
        preload="metadata"
      />
    </div>
  );
}
