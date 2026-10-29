import type { ReactNode } from 'react';

export function Card({ title, action, children, className = '', bodyClass = 'p-5' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-panel shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
