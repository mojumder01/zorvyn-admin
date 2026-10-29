/**
 * Donut chart with an animated sweep. Hovering or focusing a segment (or its legend row)
 * shows its value in the centre; the legend always lists every value and share.
 */
import { useState, type ReactNode } from 'react';
import { useAnimateIn } from './useAnimateIn';

export interface DonutSegment {
  key: string;
  label: ReactNode;
  /** Plain-text name for screen readers and the centre label. */
  name: string;
  value: number;
  color: string;
}

const SIZE = 176;
const STROKE = 24;
const R = (SIZE - STROKE) / 2 - 4;
const C = 2 * Math.PI * R;

export function DonutChart({ segments, formatValue, totalLabel, title, animateKey }: { segments: DonutSegment[]; formatValue: (v: number) => string; totalLabel: string; title: string; animateKey?: unknown }) {
  const [active, setActive] = useState<string | null>(null);
  const on = useAnimateIn(animateKey);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const current = segments.find((s) => s.key === active);
  let offset = 0;

  if (total === 0) return <p className="text-sm text-ink-3">No data in this period.</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${title}: ${segments.map((s) => `${s.name} ${formatValue(s.value)}`).join(', ')}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--color-sunken)" strokeWidth={STROKE} />
          {segments.map((s, i) => {
            const len = (s.value / total) * C;
            // 2px surface gap between segments
            const visible = Math.max(0, len - (segments.length > 1 ? 2 : 0));
            const dash = `${on ? visible : 0} ${C}`;
            const el = (
              <circle
                key={s.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={active === s.key ? STROKE + 6 : STROKE}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                opacity={active && active !== s.key ? 0.35 : 1}
                style={{ transition: `stroke-dasharray 0.9s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.12}s, stroke-width 0.2s, opacity 0.2s` }}
                onPointerEnter={() => setActive(s.key)}
                onPointerLeave={() => setActive(null)}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center" aria-live="polite">
          <div>
            <div className="text-lg font-bold tabular-nums">{formatValue(current?.value ?? total)}</div>
            <div className="max-w-24 truncate text-xs text-ink-3">{current ? `${current.name} · ${Math.round((current.value / total) * 100)}%` : totalLabel}</div>
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-0.5">
        {segments.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition ${active === s.key ? 'bg-sunken' : 'hover:bg-sunken/70'}`}
              onPointerEnter={() => setActive(s.key)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(s.key)}
              onBlur={() => setActive(null)}
            >
              <span className="size-3 shrink-0 rounded-[3px]" style={{ background: s.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <span className="font-semibold tabular-nums">{formatValue(s.value)}</span>
              <span className="w-9 text-right text-xs text-ink-3 tabular-nums">{Math.round((s.value / total) * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
