export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-panel p-1" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          aria-pressed={value === r}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${value === r ? 'bg-gradient-to-r from-brand to-brand-2 text-white shadow-sm' : 'text-ink-2 hover:text-ink'}`}
        >
          Last {r} days
        </button>
      ))}
    </div>
  );
}
