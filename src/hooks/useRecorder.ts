import { useState, useRef } from 'react';

export function useRecorder() {
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const getSupportedMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    if (MediaRecorder.isTypeSupported('audio/wav')) return 'audio/wav';
    return ''; // fallback to default browser codec
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType();

    mediaRecorder.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const reset = () => {
    setAudioURL(null);
    setRecording(false);
    audioChunks.current = [];
    mediaRecorder.current = null;
  };

  return { audioURL, recording, startRecording, stopRecording, reset };
}
