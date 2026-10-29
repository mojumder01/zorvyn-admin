/**
 * Single-series area chart for a trend over time. The line draws itself in; a crosshair
 * follows the pointer (or arrow keys) and a table view lists every value.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { axisTicks, type BarPoint } from './BarChart';

const DEFAULT_HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 26, left: 52 };

/**
 * Monotone cubic curve (Fritsch–Carlson): smooth, but never overshoots the data,
 * so a day with no sales never dips below zero.
 */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 3) return pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
  const n = pts.length;
  const dx = pts.slice(1).map(([px], i) => px - pts[i][0]);
  const slope = pts.slice(1).map(([, py], i) => (py - pts[i][1]) / dx[i]);
  const m = pts.map((_, i) => (i === 0 ? slope[0] : i === n - 1 ? slope[n - 2] : slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += ` C${(x0 + h).toFixed(1)},${(y0 + m[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - m[i + 1] * h).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}

export function AreaChart({ points, formatValue, formatAxis, title, valueLabel, color = 'var(--color-series-1)', height: HEIGHT = DEFAULT_HEIGHT, animateKey }: { points: BarPoint[]; formatValue: (v: number) => string; formatAxis: (v: number) => string; title: string; valueLabel: string; color?: string; height?: number; animateKey?: unknown }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ticks = axisTicks(Math.max(0, ...points.map((p) => p.value)));
  const max = ticks[ticks.length - 1];
  const plotW = Math.max(1, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const line = smoothPath(points.map((p, i) => [x(i), y(p.value)]));
  const area = `${line} L${x(points.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;
  const every = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 72))));

  const pick = (clientX: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const i = Math.round(((clientX - rect.left - PAD.left) / plotW) * (points.length - 1));
    setActive(Math.max(0, Math.min(points.length - 1, i)));
  };
  const current = active !== null ? points[active] : null;

  return (
    <div>
      <div ref={wrapRef} className="relative" onPointerMove={(e) => pick(e.clientX)} onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg
            key={String(animateKey)}
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
              else return;
              e.preventDefault();
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray={t === 0 ? undefined : '2 4'} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[11px] tabular-nums">
                  {formatAxis(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) =>
              i % every === 0 ? (
                <text key={i} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-3 text-[11px]">
                  {p.tick}
                </text>
              ) : null,
            )}
            <path d={area} fill={`url(#${gradientId})`} className="animate-fade-up" style={{ animationDuration: '1s' }} />
            <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} className="draw-line" />
            {current && active !== null && (
              <g>
                <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-ink-3" strokeDasharray="3 3" />
                <circle cx={x(active)} cy={y(current.value)} r={5} fill={color} stroke="var(--color-panel)" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
        {current && active !== null && (
          <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-lg" style={{ left: Math.min(Math.max(x(active), 80), width - 80) }} role="status">
            <div className="text-sm font-semibold text-ink tabular-nums">{formatValue(current.value)}</div>
            <div className="text-ink-2">{current.label}</div>
            {current.note && <div className="text-ink-3">{current.note}</div>}
          </div>
        )}
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs text-ink-3 hover:text-ink">Show as table</summary>
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-sunken text-ink-2">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
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
