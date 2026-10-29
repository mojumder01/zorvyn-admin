import { useEffect, useState } from 'react';

/** False on the first paint, true right after, so CSS transitions play when a chart appears. */
export function useAnimateIn(key?: unknown): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(frame);
  }, [key]);
  return on;
}
