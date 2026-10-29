/** Ranked horizontal bars with the value written next to each one (no hover needed). */
import type { Ranked } from '../../lib/analytics';

export function BarList({ rows, formatValue, formatDetail, color = 'var(--color-series-1)', colors, empty = 'No sales in this period.' }: { rows: Ranked[]; formatValue: (v: number) => string; formatDetail?: (d: number) => string; color?: string; /** Per-row colour by key, so an entity keeps its colour across charts. */ colors?: Record<string, string>; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-ink-3">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {formatValue(r.value)}
              <span className="ml-1.5 font-normal text-ink-3">{formatDetail && r.detail !== undefined ? formatDetail(r.detail) : `${Math.round((r.value / total) * 100)}%`}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-sunken">
            <div
              className="h-2 origin-left animate-grow-x rounded-full"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: `linear-gradient(90deg, color-mix(in oklab, ${colors?.[r.key] ?? color} 65%, transparent), ${colors?.[r.key] ?? color})`, animationDelay: `${i * 70}ms` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
