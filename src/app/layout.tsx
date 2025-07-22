'use client';
import './globals.css';
import { useEffect } from 'react';
import sdk from '@/lib/sdk';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
