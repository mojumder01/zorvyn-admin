import { useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart } from '../components/charts/BarChart';
import { BarList } from '../components/charts/BarList';
import { Shell } from '../components/layout/Shell';
import { Card } from '../components/ui/Card';
import { RangePicker, type Range } from '../components/ui/RangePicker';
import { StatTile } from '../components/ui/StatTile';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDatabase } from '../data/store';
import type { OrderStatus } from '../data/types';
import { dailySeries, inPeriod, lowStock, periodsFor, summary, topProducts } from '../lib/analytics';
import { compactTaka, count, formatDate, formatDateTime, formatShortDate, percentChange, taka } from '../lib/format';
import { Link } from '../lib/router';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function Dashboard() {
  const db = useDatabase();
  const [range, setRange] = useState<Range>(30);
  const { current, previous } = periodsFor(range);
  const now = db.orders.filter((o) => inPeriod(o, current));
  const before = db.orders.filter((o) => inPeriod(o, previous));
  const a = summary(now);
  const b = summary(before);
  const series = dailySeries(db.orders, current);
  const low = lowStock(db);
  const customerName = (id: string) => db.customers.find((c) => c.id === id)?.name ?? 'Unknown';

  return (
    <Shell title="Dashboard" actions={<RangePicker value={range} onChange={setRange} />}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile label="Revenue" value={taka(a.revenue)} change={percentChange(a.revenue, b.revenue)} />
        <StatTile label="Orders" value={count(a.orders)} change={percentChange(a.orders, b.orders)} />
        <StatTile label="Average order" value={taka(a.averageOrder)} change={percentChange(a.averageOrder, b.averageOrder)} />
        <StatTile label="Items sold" value={count(a.units)} change={percentChange(a.units, b.units)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`Revenue per day · ${formatShortDate(current.from)} – ${formatShortDate(new Date(current.to.getTime() - 1))}`} className="xl:col-span-2">
          <BarChart
            title="Revenue per day"
            valueLabel="Revenue"
            points={series.map((p) => ({ label: formatDate(p.date.toISOString()), tick: formatShortDate(p.date), value: p.revenue, note: `${p.orders} order${p.orders === 1 ? '' : 's'}` }))}
            formatValue={taka}
            formatAxis={compactTaka}
          />
        </Card>
        <Card title="Orders by status">
          <ul className="space-y-2.5">
            {STATUSES.map((s) => {
              const n = now.filter((o) => o.status === s).length;
              return (
                <li key={s} className="flex items-center justify-between gap-3">
                  <StatusBadge status={s} />
                  <Link to={`/orders?status=${s}`} className="text-sm font-semibold tabular-nums hover:text-brand">
                    {count(n)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-ink-3">Cancelled orders are not counted in revenue.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Top products" action={<span className="text-xs text-ink-3">Item sales · units</span>}>
          <BarList rows={topProducts(now, db.products)} formatValue={taka} formatDetail={(d) => `${d} sold`} />
        </Card>
        <Card
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" aria-hidden /> Low stock
            </span>
          }
          action={
            <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              Inventory <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          }
          bodyClass="p-0"
        >
          {low.length === 0 ? (
            <p className="p-5 text-sm text-ink-3">Every size has more than {db.settings.lowStockAt} units.</p>
          ) : (
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {low.slice(0, 8).map(({ product, size, units }) => (
                <li key={`${product.id}-${size}`} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <img src={product.image} alt="" className="size-9 rounded-lg bg-sunken object-cover" />
                  <span className="min-w-0 flex-1 truncate">
                    {product.name} <span className="text-ink-3">· size {size}</span>
                  </span>
                  <span className={`font-semibold tabular-nums ${units === 0 ? 'text-critical' : ''}`}>{units === 0 ? 'Out of stock' : `${units} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Recent orders"
        action={
          <Link to="/orders" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            All orders <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
        bodyClass="relative overflow-x-auto"
      >
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs text-ink-3">
            <tr>
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-5 py-2.5 font-medium">Customer</th>
              <th className="px-5 py-2.5 font-medium">Placed</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {db.orders.slice(0, 6).map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-5 py-2.5 font-medium whitespace-nowrap">
                  <Link to={`/orders/${o.id}`} className="hover:text-brand hover:underline">
                    {o.id}
                  </Link>
                </td>
                <td className="px-5 py-2.5">{customerName(o.customerId)}</td>
                <td className="px-5 py-2.5 text-ink-2">{formatDateTime(o.createdAt)}</td>
                <td className="px-5 py-2.5">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{taka(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}
