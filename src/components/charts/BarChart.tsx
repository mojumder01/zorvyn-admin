/**
 * Single-series column chart (e.g. revenue per day). Hover or arrow keys show a tooltip for
 * each bar; a table view below lists every value without hovering.
 */
import { useEffect, useId, useRef, useState } from 'react';

export interface BarPoint {
  /** Full label for the tooltip and table, e.g. "12 Oct 2026". */
  label: string;
  /** Short label for the x axis, e.g. "12 Oct". */
  tick: string;
  value: number;
  /** Extra line in the tooltip, e.g. "8 orders". */
  note?: string;
}

const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 52 };

/** Round axis steps (1, 2 or 5 × 10ⁿ) with about four gridlines. */
function axisTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * power).find((v) => v >= rough)!;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

export function BarChart({ points, formatValue, formatAxis, title, valueLabel, xLabel = 'Date' }: { points: BarPoint[]; formatValue: (v: number) => string; formatAxis: (v: number) => string; title: string; valueLabel: string; xLabel?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ticks = axisTicks(Math.max(0, ...points.map((p) => p.value)));
  const max = ticks[ticks.length - 1];
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(1, points.length);
  const gap = slot > 10 ? 2 : 1; // surface gap between bars
  const barW = Math.min(56, Math.max(1, slot - gap)); // few bars (e.g. months) stay slim
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  // Show at most ~8 x labels so they never collide
  const every = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 70))));

  const pick = (clientX: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const i = Math.floor((clientX - rect.left - PAD.left) / slot);
    setActive(i >= 0 && i < points.length ? i : null);
  };

  const current = active !== null ? points[active] : null;
  const tipLeft = active !== null ? Math.min(Math.max(PAD.left + active * slot + slot / 2, 80), width - 80) : 0;

  return (
    <div>
      <div ref={wrapRef} className="relative" onPointerMove={(e) => pick(e.clientX)} onPointerLeave={() => setActive(null)}>
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`${title}. Use the left and right arrow keys to read each value, or open the table below.`}
          tabIndex={0}
          className="block rounded-lg focus-visible:outline-2 focus-visible:outline-brand"
          onFocus={() => setActive((a) => a ?? points.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? points.length) - 1));
            else if (e.key === 'ArrowRight') setActive((a) => Math.min(points.length - 1, (a ?? -1) + 1));
            else if (e.key === 'Home') setActive(0);
            else if (e.key === 'End') setActive(points.length - 1);
            else return;
            e.preventDefault();
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray={t === 0 ? undefined : '2 4'} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px] tabular-nums">
                {formatAxis(t)}
              </text>
            </g>
          ))}
          {points.map((p, i) => {
            const x = PAD.left + i * slot + (slot - barW) / 2;
            const h = Math.max(0, PAD.top + plotH - y(p.value));
            const r = Math.min(4, barW / 2, h);
            const top = PAD.top + plotH - h;
            return (
              <g key={i}>
                {h > 0 && (
                  <path
                    d={`M${x},${PAD.top + plotH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${PAD.top + plotH} Z`}
                    fill="var(--color-series-1)"
                    opacity={active === null || active === i ? 1 : 0.45}
                  />
                )}
                {i % every === 0 && (
                  <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-3 text-[11px]">
                    {p.tick}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {current && (
          <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-lg" style={{ left: tipLeft }} role="status">
            <div className="text-sm font-semibold text-ink tabular-nums">{formatValue(current.value)}</div>
            <div className="text-ink-2">{current.label}</div>
            {current.note && <div className="text-ink-3">{current.note}</div>}
          </div>
        )}
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs text-ink-3 hover:text-ink">Show as table</summary>
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line">
          <table id={tableId} className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-sunken text-ink-2">
              <tr>
                <th className="px-3 py-2 font-medium">{xLabel}</th>
                <th className="px-3 py-2 text-right font-medium">{valueLabel}</th>
                <th className="px-3 py-2 text-right font-medium">Orders</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.label} className="border-t border-line">
                  <td className="px-3 py-1.5">{p.label}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatValue(p.value)}</td>
                  <td className="px-3 py-1.5 text-right text-ink-2 tabular-nums">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
