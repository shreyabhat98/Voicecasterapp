import { Suspense } from 'react';
import { AudioCard } from './player';

export default function FramePage() {
  return (
    <Suspense>
      <AudioCard />
    </Suspense>
  );
}
