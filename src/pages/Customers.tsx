import { useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { useDatabase } from '../data/store';
import { isSale } from '../lib/analytics';
import { formatDate, taka } from '../lib/format';
import { Link } from '../lib/router';

const PAGE_SIZE = 15;

export function Customers() {
  const db = useDatabase();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const stats = new Map<string, { orders: number; spent: number; last?: string }>();
  for (const o of db.orders) {
    const s = stats.get(o.customerId) ?? { orders: 0, spent: 0 };
    if (isSale(o)) {
      s.orders += 1;
      s.spent += o.total;
    }
    if (!s.last || o.createdAt > s.last) s.last = o.createdAt;
    stats.set(o.customerId, s);
  }
  const term = search.trim().toLowerCase();
  const rows = db.customers
    .filter((c) => !term || c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.city.toLowerCase().includes(term))
    .sort((a, b) => (stats.get(b.id)?.spent ?? 0) - (stats.get(a.id)?.spent ?? 0));

  return (
    <Shell title="Customers">
      <Card
        bodyClass="p-0"
        title={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Name, phone or city"
            label="Search customers"
          />
        }
        action={<span className="text-xs text-ink-3">Sorted by total spent</span>}
      >
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-3">No customers match.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-sunken text-xs text-ink-2">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">City</th>
                  <th className="px-5 py-2.5 text-right font-medium">Orders</th>
                  <th className="px-5 py-2.5 text-right font-medium">Spent</th>
                  <th className="px-5 py-2.5 font-medium">Last order</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => {
                  const s = stats.get(c.id);
                  return (
                    <tr key={c.id} className="border-t border-line hover:bg-sunken/60">
                      <td className="px-5 py-3">
                        <Link to={`/customers/${c.id}`} className="font-medium hover:text-brand hover:underline">
                          {c.name}
                        </Link>
                        <p className="text-xs text-ink-3">{c.phone}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-2">{c.city}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{s?.orders ?? 0}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{taka(s?.spent ?? 0)}</td>
                      <td className="px-5 py-3 text-ink-2">{s?.last ? formatDate(s.last) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
      </Card>
    </Shell>
  );
}
