import { useState, useEffect } from 'react';
import { formatTimer, now } from '../lib/utils';

export function useTimer(startTime: string | null | undefined) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) { setElapsed(0); return; }
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const totalSec = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { elapsed, hours, minutes, seconds, display: formatTimer(elapsed) };
}
