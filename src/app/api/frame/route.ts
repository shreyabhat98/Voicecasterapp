// app/api/frame/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const audioUrl = searchParams.get('audioUrl');

  if (!audioUrl) {
    return new Response('Missing audioUrl parameter', { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicecasterapp.vercel.app';
  
  // Create a static image that represents the audio
  const imageUrl = `${siteUrl}/api/audio-image?audioUrl=${encodeURIComponent(audioUrl)}`;
  
  // The video will be generated on-demand when clicked
  const videoUrl = `${siteUrl}/api/audio-video?audioUrl=${encodeURIComponent(audioUrl)}`;

  const frameMetadata = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:video" content="${videoUrl}" />
        <meta property="fc:frame:button:1" content="🎧 Play Voice Note" />
        <meta property="fc:frame:post_url" content="${siteUrl}/api/frame" />
        
        <meta property="og:title" content="🎤 Voice Note from VoiceCaster" />
        <meta property="og:description" content="Tap to play this voice note inline" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${req.url}" />
        
        <title>Voice Note from VoiceCaster</title>
      </head>
      <body>
        <h1>🎤 Voice Note</h1>
        <p>This voice note will play inline!</p>
        <audio controls>
          <source src="${audioUrl}" type="audio/webm">
          Your browser does not support audio.
        </audio>
      </body>
    </html>
  `;

  return new Response(frameMetadata, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function POST(req: NextRequest) {
  return new Response('Frame interaction received', { status: 200 });
}