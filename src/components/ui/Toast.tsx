import { useEffect, useSyncExternalStore } from 'react';
import { CircleCheck } from 'lucide-react';

let message = '';
let id = 0;
const listeners = new Set<() => void>();

/** Shows a short confirmation at the bottom of the screen. */
export function toast(text: string) {
  message = text;
  id++;
  listeners.forEach((l) => l());
}

export function Toaster() {
  const current = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => `${id}:${message}`,
  );
  const [key, text] = [current.slice(0, current.indexOf(':')), current.slice(current.indexOf(':') + 1)];

  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => {
      message = '';
      listeners.forEach((l) => l());
    }, 2600);
    return () => clearTimeout(timer);
  }, [key, text]);

  return (
    <div aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {text && (
        <p className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-page shadow-xl">
          <CircleCheck className="size-4 text-good" aria-hidden /> {text}
        </p>
      )}
    </div>
  );
}
