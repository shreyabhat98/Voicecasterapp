import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const audioUrl = searchParams.get('audioUrl');

  if (!audioUrl) {
    return new Response('Missing audioUrl', { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicecasterapp.vercel.app';
  const imageUrl = `${siteUrl}/mic.svg`; // or your own frame OG image

  const ogMetadata = `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:audio" content="${audioUrl}" />
        <meta property="fc:frame:post_url" content="${siteUrl}/frame" />
        <meta property="og:title" content="Voice Note from VoiceCaster" />
        <meta property="og:description" content="🎙️ Listen to this audio directly on Farcaster" />
        <meta property="og:image" content="${imageUrl}" />
      </head>
      <body></body>
    </html>
  `;

  return new Response(ogMetadata, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
