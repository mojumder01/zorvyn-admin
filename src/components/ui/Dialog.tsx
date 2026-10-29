/** Native <dialog> as a modal: focus trap, Esc and backdrop click come from the browser. */
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={wide ? 'w-[min(760px,calc(100vw-2rem))]' : 'w-[min(480px,calc(100vw-2rem))]'}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-sunken" aria-label="Close">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
