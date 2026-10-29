import { useState } from 'react';
import { Download } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { toast } from '../components/ui/Toast';
import { CATEGORY_LABEL } from '../data/labels';
import { actions, useDatabase } from '../data/store';
import { totalStock } from '../lib/analytics';
import { downloadCsv } from '../lib/csv';
import { dayKey } from '../lib/format';

export function Inventory() {
  const db = useDatabase();
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const limit = db.settings.lowStockAt;

  const term = search.trim().toLowerCase();
  const rows = db.products.filter((p) => (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) && (!lowOnly || Object.values(p.stock).some((n) => n <= limit)));
  const lowCount = db.products.reduce((n, p) => n + Object.values(p.stock).filter((u) => u <= limit).length, 0);

  const save = (productId: string, name: string, size: string, before: number, value: string) => {
    const units = Math.max(0, Math.round(Number(value)) || 0);
    if (units === before) return;
    actions.setStock(productId, size, units);
    toast(`${name} · size ${size}: ${units} in stock`);
  };

  const exportCsv = () =>
    downloadCsv(`zorvyn-stock-${dayKey(new Date())}.csv`, [
      ['SKU', 'Product', 'Category', 'Size', 'Units'],
      ...db.products.flatMap((p) => Object.entries(p.stock).map(([size, units]) => [p.sku, p.name, CATEGORY_LABEL[p.category], size, units])),
    ]);

  return (
    <Shell title="Inventory">
      <Card
        bodyClass="p-0"
        title={
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Name or SKU" label="Search inventory" />
            <label className="flex items-center gap-2 text-sm font-normal">
              <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
              Only low stock ({lowCount} sizes)
            </label>
          </div>
        }
        action={
          <Button size="sm" onClick={exportCsv}>
            <Download className="size-4" aria-hidden /> Export CSV
          </Button>
        }
      >
        <p className="border-b border-line px-5 py-2.5 text-xs text-ink-3">
          Type a new number and press Enter (or leave the box) to save. Sizes with {limit} or fewer units are highlighted.
        </p>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-3">Nothing to show.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                <div className="flex min-w-0 items-center gap-3 md:w-72">
                  <img src={p.image} alt="" className="size-12 shrink-0 rounded-lg bg-sunken object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-ink-3">
                      {p.sku} · {totalStock(p)} units {!p.active && '· hidden'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  {Object.entries(p.stock).map(([size, units]) => {
                    const low = units <= limit;
                    return (
                      <label key={size} className={`flex w-[5.75rem] flex-col rounded-lg border px-2 py-1.5 text-xs ${units === 0 ? 'border-critical/60 bg-critical/10' : low ? 'border-warning/70 bg-warning/10' : 'border-line'}`}>
                        <span className="text-ink-2">
                          {size}
                          {units === 0 ? <span className="ml-1 font-semibold text-critical">· out</span> : low && <span className="ml-1 font-semibold text-ink">· low</span>}
                        </span>
                        <input
                          key={`${p.id}-${size}-${units}`}
                          defaultValue={units}
                          inputMode="numeric"
                          aria-label={`${p.name}, size ${size}, units in stock`}
                          className="w-full bg-transparent text-base font-semibold tabular-nums outline-none"
                          onBlur={(e) => save(p.id, p.name, size, units, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') {
                              e.currentTarget.value = String(units);
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Shell>
  );
}
