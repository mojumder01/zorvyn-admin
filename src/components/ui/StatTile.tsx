import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function StatTile({ label, value, change }: { label: string; value: string; change: number | null }) {
  const up = change !== null && change >= 0;
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {change === null ? (
        <p className="mt-1 text-xs text-ink-3">No earlier data</p>
      ) : (
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-2">
          <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-good' : 'text-critical'}`}>
            {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
            {up ? '+' : '−'}
            {Math.abs(change).toFixed(1)}%
          </span>
          vs previous period
        </p>
      )}
    </div>
  );
}
