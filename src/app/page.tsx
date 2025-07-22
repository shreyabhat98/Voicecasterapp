'use client';
import { useEffect, useState } from 'react';
import sdk from '@/lib/sdk';
import { useRecorder } from '@/hooks/useRecorder';
import { uploadToSupabase } from '@/lib/upload';

export default function Home() {
  const [fid, setFid] = useState<number | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const { audioURL, recording, startRecording, stopRecording, reset } = useRecorder();

  useEffect(() => {
    const splash = setTimeout(() => setShowApp(true), 2000);
    return () => clearTimeout(splash);
  }, []);

  useEffect(() => {
    const fetchContext = async () => {
      const context = await sdk.context;
      setIsMiniApp(context?.isMiniApp || false);
      setFid(context?.fid || 12345);
    };
    fetchContext();
  }, []);

  const handlePost = async () => {
    if (!audioURL) return alert('Please record audio first!');
    setUploading(true);

    try {
      const blob = await fetch(audioURL).then(res => res.blob());
      const fileName = `voice-${fid}-${Date.now()}.webm`;

      const url = await uploadToSupabase(blob, fileName);
      if (!url) throw new Error('Failed to get public URL');

      setPublicUrl(url);

      await sdk.actions.composeCast({
        text: `🎤 Voice cast via VoiceCaster: ${url}`,
      });

      alert(`✅ Cast posted successfully!\n\n${url}`);
      reset();
    } catch (err) {
      console.error('Post failed:', err);
      alert('Something went wrong. Check console.');
    } finally {
      setUploading(false);
    }
  };

  if (!showApp) {
    return (
      <main className="splash">
        <img src="/mic.svg" className="bounce" alt="Mic Icon" />
      </main>
    );
  }

  return (
    <main className="card">
      <h1>Voice Caster</h1>
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
            <button
              className="record-btn"
              onClick={handlePost}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Post Voice Cast'}
            </button>
            <button className="record-btn" onClick={reset}>Reset</button>
          </div>
          {publicUrl && (
            <div style={{ marginTop: '16px', wordBreak: 'break-all' }}>
              <p>
                ✅ <a href={publicUrl} target="_blank" rel="noopener noreferrer">{publicUrl}</a>
              </p>
              <button
                className="record-btn"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  alert('Copied to clipboard!');
                }}
              >
                Copy Link
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
