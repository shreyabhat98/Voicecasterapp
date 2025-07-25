// lib/audioToMp4.ts

import FFmpegWasm from '@ffmpeg/ffmpeg';

// Support both CommonJS and ESM flavors for all toolchains
const createFFmpeg = typeof FFmpegWasm === 'function'
  ? // Some setups export the createFFmpeg function itself as default
    FFmpegWasm
  : (FFmpegWasm as any).createFFmpeg ?? (FFmpegWasm as any).default?.createFFmpeg;

const fetchFile = (FFmpegWasm as any).fetchFile ?? (FFmpegWasm as any).default?.fetchFile;

if (!createFFmpeg || !fetchFile) {
  throw new Error(
    'Could not import createFFmpeg/fetchFile from @ffmpeg/ffmpeg. Please check your installation and import.'
  );
}

// ======= Your function to create the initial branded WebM video =========
export async function createAudioCanvasVideo(audioBlob: Blob): Promise<Blob> {
  const canvas = document.createElement('canvas');
  if (typeof canvas.captureStream !== 'function') throw new Error('No captureStream');
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  // === BRANDING SECTION (update as desired) ===
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 50;
  const micSize = 120;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#e9ddff');
  gradient.addColorStop(1, '#f7f2ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d8c6f1';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  function drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  ctx.fillStyle = '#6b46c1';
  drawRoundedRect(centerX - micSize / 3, centerY - micSize / 2, (micSize * 2) / 3, micSize, 25);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const y = centerY - micSize / 3 + i * 15;
    ctx.beginPath();
    ctx.moveTo(centerX - micSize / 4, y);
    ctx.lineTo(centerX + micSize / 4, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#6b46c1';
  drawRoundedRect(centerX - micSize / 2.5, centerY + micSize / 3, (micSize * 2) / 2.5, 25, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.rect(centerX - 4, centerY + micSize / 2, 8, 50);
  ctx.fill();
  ctx.fillStyle = '#2e2e2e';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎧 Voice Note', centerX, centerY + micSize + 80);
  ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Tap to play', centerX, centerY + micSize + 110);
  ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('via VoiceCaster', centerX, centerY + micSize + 140);

  // ===== END BRANDING SECTION =====

  // Audio decode
  const audioArrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass: typeof AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
  const duration = audioBuffer.duration;
  const canvasStream = canvas.captureStream(1);
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  const audioDestination = audioContext.createMediaStreamDestination();
  audioSource.connect(audioDestination);
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
  audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
  return await new Promise((resolve, reject) => {
    const chunks: Blob[] = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(combinedStream, { mimeType });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => { audioContext.close(); resolve(new Blob(chunks, { type: mimeType })); };
    recorder.onerror = e => { audioContext.close(); reject(new Error('MediaRecorder failed')); };
    recorder.start(1000);
    audioSource.start(0);
    setTimeout(() => {
      audioSource.stop();
      setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 500);
    }, Math.max(100, duration * 1000));
  });
}

/**
 * Convert branded canvas+audio video (WebM) to real MP4 for Farcaster/social use.
 */
export async function convertAudioToMp4(audioBlob: Blob): Promise<Blob> {
  // 1 - Build branded webm video
  const webmBlob = await createAudioCanvasVideo(audioBlob);

  // 2 - Convert webm to mp4 with ffmpeg.wasm
  const ffmpeg = createFFmpeg({ log: false });
  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
  await ffmpeg.run(
    '-i', 'input.webm',
    '-c:v', 'libx264',
    '-b:v', '2M',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-movflags', '+faststart',
    'output.mp4'
  );
  const mp4Data = ffmpeg.FS('readFile', 'output.mp4');
  return new Blob([mp4Data.buffer], { type: 'video/mp4' });
}
