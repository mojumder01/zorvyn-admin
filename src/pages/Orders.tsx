import { useState } from 'react';
import { Download } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AREA_LABEL, PAYMENT_LABEL, STATUS_LABEL } from '../data/labels';
import { useDatabase } from '../data/store';
import type { OrderStatus } from '../data/types';
import { downloadCsv } from '../lib/csv';
import { dayKey, formatDateTime, taka } from '../lib/format';
import { Link, navigate, useQuery } from '../lib/router';

const TABS: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAGE_SIZE = 15;

export function Orders() {
  const db = useDatabase();
  const query = useQuery();
  const status = (TABS as string[]).includes(query.get('status') ?? '') ? (query.get('status') as OrderStatus | 'all') : 'all';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const customers = new Map(db.customers.map((c) => [c.id, c]));
  const term = search.trim().toLowerCase();
  const filtered = db.orders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    if (!term) return true;
    const c = customers.get(o.customerId);
    return o.id.toLowerCase().includes(term) || !!c?.name.toLowerCase().includes(term) || !!c?.phone.includes(term.replace(/\D/g, '') || '#');
  });
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    downloadCsv(`zorvyn-orders-${dayKey(new Date())}.csv`, [
      ['Order', 'Placed', 'Status', 'Customer', 'Phone', 'City', 'Area', 'Payment', 'Items', 'Subtotal', 'Discount', 'Delivery', 'Total'],
      ...filtered.map((o) => {
        const c = customers.get(o.customerId);
        return [o.id, o.createdAt.slice(0, 16).replace('T', ' '), STATUS_LABEL[o.status], c?.name ?? '', c?.phone ?? '', o.city, AREA_LABEL[o.area], PAYMENT_LABEL[o.payment], o.items.map((it) => `${it.name} (${it.size}) x${it.quantity}`).join('; '), o.subtotal, o.discount, o.deliveryFee, o.total];
      }),
    ]);
  };

  return (
    <Shell title="Orders">
      <div className="no-print flex gap-1 overflow-x-auto rounded-xl border border-line bg-panel p-1" role="tablist" aria-label="Order status">
        {TABS.map((t) => {
          const n = t === 'all' ? db.orders.length : db.orders.filter((o) => o.status === t).length;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={status === t}
              onClick={() => {
                navigate(t === 'all' ? '/orders' : `/orders?status=${t}`);
                setPage(1);
              }}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${status === t ? 'bg-ink text-page' : 'text-ink-2 hover:bg-sunken hover:text-ink'}`}
            >
              {t === 'all' ? 'All' : STATUS_LABEL[t]}
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${status === t ? 'bg-page/20' : 'bg-sunken'}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <Card
        bodyClass="p-0"
        title={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Order ID, customer or phone"
            label="Search orders"
          />
        }
        action={
          <Button size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="size-4" aria-hidden /> Export CSV
          </Button>
        }
      >
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-3">No orders match.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sunken text-xs text-ink-2">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Placed</th>
                  <th className="px-5 py-2.5 font-medium">Payment</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Items</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((o) => {
                  const c = customers.get(o.customerId);
                  return (
                    <tr key={o.id} className="border-t border-line hover:bg-sunken/60">
                      <td className="px-5 py-3 font-medium whitespace-nowrap">
                        <Link to={`/orders/${o.id}`} className="hover:text-brand hover:underline">
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <div>{c?.name}</div>
                        <div className="text-xs text-ink-3">{o.city}</div>
                      </td>
                      <td className="px-5 py-3 text-ink-2">{formatDateTime(o.createdAt)}</td>
                      <td className="px-5 py-3 text-ink-2">{PAYMENT_LABEL[o.payment]}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{o.items.reduce((n, it) => n + it.quantity, 0)}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{taka(o.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
      </Card>
    </Shell>
  );
}
