import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get('audioUrl');

  if (!audioUrl) {
    return NextResponse.json({ error: 'Missing audioUrl' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const frameUrl = `${siteUrl}/frame?audioUrl=${encodeURIComponent(audioUrl)}`;
  const imageUrl = `${siteUrl}/voicecaster-frame-preview.png`;

  return new NextResponse(
    `
    <html>
      <head>
        <meta property="og:title" content="🎤 VoiceCaster Audio Note" />
        <meta property="og:description" content="Click to listen to this voice note!" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content="${frameUrl}" />
        <meta property="fc:frame:image" content="${imageUrl}" />
      </head>
      <body></body>
    </html>
    `,
    {
      headers: { 'Content-Type': 'text/html' }
    }
  );
}
