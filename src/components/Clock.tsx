'use client';

import { useEffect, useState } from 'react';

const FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export default function Clock({ className = '' }: { className?: string }) {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => setTime(FORMATTER.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span className={`clock${className ? ` ${className}` : ''}`}>{time}</span>;
}
