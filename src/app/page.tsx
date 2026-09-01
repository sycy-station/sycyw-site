'use client';

import { useEffect, useState } from 'react';
import Splash from '@/motion/Splash';
import Stage from '@/components/Stage';

export default function Home() {
  const [ready, setReady] = useState(false);

  // legacy index.html 的 html data-page="stage"（子页样式依赖该标识）
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-page', 'stage');
    root.removeAttribute('data-slug');
    return () => {
      root.removeAttribute('data-page');
      root.removeAttribute('data-slug');
    };
  }, []);

  return (
    <main id="top">
      <Splash onDone={() => setReady(true)} />
      <Stage ready={ready} />
    </main>
  );
}