'use client';
import { useEffect, useState } from 'react';
import sdk from '@/lib/sdk';
import { useRecorder } from '@/hooks/useRecorder';
import { uploadToSupabase } from '@/lib/upload';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [showApp, setShowApp] = useState(false);

  const { audioURL, recording, startRecording, stopRecording, reset } = useRecorder();

  useEffect(() => {
    const splash = setTimeout(() => setShowApp(true), 2000);
    return () => clearTimeout(splash);
  }, []);

  const handlePost = async () => {
    if (!audioURL) return alert('Please record audio first!');
    setUploading(true);

    try {
      const blob = await fetch(audioURL).then(res => res.blob());
      const fileName = `voice-${Date.now()}.wav`;
      const url = await uploadToSupabase(blob, fileName);

      if (!url) throw new Error('Failed to upload to Supabase');

      setPublicUrl(url);

      await sdk.actions.composeCast({
        text: `🎤 Voice cast via VoiceCaster`,
        embeds: [url],
      });

      alert('✅ Cast posted with inline playback!');
      reset();
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  if (!showApp) {
    return (
      <main className="splash">
        <img src="/mic.svg" className="bounce" alt="mic icon" />
      </main>
    );
  }

  return (
    <main className="card">
      <h1>VoiceCaster</h1>
      <p className="subtitle">Record and share your voice effortlessly</p>

      {!audioURL ? (
        recording ? (
          <button className="record-btn" onClick={stopRecording}>
            <img src="/mic.svg" width="24" height="24" alt="mic" /> Stop
          </button>
        ) : (
          <button className="record-btn" onClick={startRecording}>
            <img src="/mic.svg" width="24" height="24" alt="mic" /> Record
          </button>
        )
      ) : (
        <>
          <audio controls src={audioURL} className="audio-player" />
          <div className="button-group">
            <button className="record-btn" onClick={handlePost} disabled={uploading}>
              {uploading ? 'Posting…' : 'Post Voice Cast'}
            </button>
            <button className="record-btn" onClick={reset}>Reset</button>
          </div>
          {publicUrl && (
            <div style={{ marginTop: '16px', wordBreak: 'break-word' }}>
              ✅ Public Link: <a href={publicUrl} target="_blank">{publicUrl}</a>
            </div>
          )}
        </>
      )}
    </main>
  );
}
