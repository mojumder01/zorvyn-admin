import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Sparkline } from '../charts/Sparkline';

export function StatTile({ label, value, change, icon: Icon, color, trend, delay = 0 }: { label: string; value: string; change: number | null; icon: LucideIcon; color: string; trend?: number[]; delay?: number }) {
  const up = change !== null && change >= 0;
  return (
    <div className="panel relative animate-fade-up overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-sm shadow-slate-900/[0.03]" style={{ animationDelay: `${delay}ms` }}>
      {/* Soft colour wash in the corner */}
      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-15 blur-2xl dark:opacity-25" style={{ background: color }} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm text-ink-2">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="relative mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      <div className="relative mt-2 flex items-end justify-between gap-2">
        {change === null ? (
          <p className="text-xs text-ink-3">No earlier data</p>
        ) : (
          <p className="flex flex-wrap items-center gap-1 text-xs text-ink-2">
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${up ? 'bg-good/12 text-good' : 'bg-critical/12 text-critical'}`}>
              {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
              {up ? '+' : '−'}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="hidden sm:inline">vs previous</span>
          </p>
        )}
        {trend && trend.length > 1 && (
          <div className="hidden shrink-0 sm:block">
            <Sparkline values={trend} color={color} />
          </div>
        )}
      </div>
    </div>
  );
}
