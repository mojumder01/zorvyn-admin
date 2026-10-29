import { useState } from 'react';
import { AlertTriangle, ArrowRight, Banknote, Package, ReceiptText, ShoppingBag } from 'lucide-react';
import { AreaChart } from '../components/charts/AreaChart';
import { BarChart } from '../components/charts/BarChart';
import { BarList } from '../components/charts/BarList';
import { DonutChart } from '../components/charts/DonutChart';
import { Shell } from '../components/layout/Shell';
import { Card } from '../components/ui/Card';
import { RangePicker, type Range } from '../components/ui/RangePicker';
import { StatTile } from '../components/ui/StatTile';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CATEGORY_COLOR, PAYMENT_COLOR, STATUS_COLOR } from '../data/colors';
import { STATUS_LABEL } from '../data/labels';
import { useDatabase } from '../data/store';
import type { Category, OrderStatus, PaymentMethod } from '../data/types';
import { dailySeries, inPeriod, lowStock, ordersByHour, paymentSplit, periodsFor, salesByCategory, statusCounts, summary, topProducts } from '../lib/analytics';
import { compactTaka, count, formatDate, formatDateTime, formatShortDate, percentChange, taka } from '../lib/format';
import { Link } from '../lib/router';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;

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
  const statuses = statusCounts(now);
  const productCategory = new Map(db.products.map((p) => [p.id, p.category]));
  const customerName = (id: string) => db.customers.find((c) => c.id === id)?.name ?? 'Unknown';

  return (
    <Shell title="Dashboard" actions={<RangePicker value={range} onChange={setRange} />}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile label="Revenue" value={taka(a.revenue)} change={percentChange(a.revenue, b.revenue)} icon={Banknote} color="var(--color-series-1)" trend={series.map((p) => p.revenue)} />
        <StatTile label="Orders" value={count(a.orders)} change={percentChange(a.orders, b.orders)} icon={ShoppingBag} color="var(--color-series-2)" trend={series.map((p) => p.orders)} delay={60} />
        <StatTile label="Average order" value={taka(a.averageOrder)} change={percentChange(a.averageOrder, b.averageOrder)} icon={ReceiptText} color="var(--color-series-3)" trend={series.map((p) => (p.orders ? p.revenue / p.orders : 0))} delay={120} />
        <StatTile label="Items sold" value={count(a.units)} change={percentChange(a.units, b.units)} icon={Package} color="var(--color-series-7)" trend={series.map((p) => p.units)} delay={180} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={`Revenue trend · ${formatShortDate(current.from)} – ${formatShortDate(new Date(current.to.getTime() - 1))}`} className="xl:col-span-2">
          <AreaChart
            title="Revenue per day"
            valueLabel="Revenue"
            height={340}
            animateKey={range}
            points={series.map((p) => ({ label: formatDate(p.date.toISOString()), tick: formatShortDate(p.date), value: p.revenue, note: `${p.orders} order${p.orders === 1 ? '' : 's'}` }))}
            formatValue={taka}
            formatAxis={compactTaka}
          />
        </Card>
        <Card title="Orders by status">
          <DonutChart
            title="Orders by status"
            animateKey={range}
            totalLabel="orders"
            formatValue={count}
            segments={STATUSES.map((s) => ({ key: s, name: STATUS_LABEL[s], label: <StatusBadge status={s} />, value: statuses[s], color: STATUS_COLOR[s] }))}
          />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Sales by category">
          <DonutChart
            title="Sales by category"
            animateKey={range}
            totalLabel="item sales"
            formatValue={compactTaka}
            segments={salesByCategory(now, db.products).map((r) => ({ key: r.key, name: r.label, label: r.label, value: r.value, color: CATEGORY_COLOR[r.key as Category] }))}
          />
        </Card>
        <Card title="Payment methods">
          <DonutChart
            title="Payment methods"
            animateKey={range}
            totalLabel="order value"
            formatValue={compactTaka}
            segments={paymentSplit(now).map((r) => ({ key: r.key, name: r.label, label: r.label, value: r.value, color: PAYMENT_COLOR[r.key as PaymentMethod] }))}
          />
        </Card>
        <Card title="Busiest hours" action={<span className="text-xs text-ink-3">Orders placed</span>} className="md:col-span-2 xl:col-span-1">
          <BarChart
            title="Orders by hour of day"
            valueLabel="Orders"
            xLabel="Hour"
            noteLabel="Share"
            height={200}
            color="var(--color-series-7)"
            animateKey={range}
            points={ordersByHour(now).map((h) => ({ label: `${hourLabel(h.hour)}–${hourLabel(h.hour + 1)}`, tick: hourLabel(h.hour), value: h.orders, note: a.orders ? `${Math.round((h.orders / a.orders) * 100)}%` : '0%' }))}
            formatValue={(v) => `${v} order${v === 1 ? '' : 's'}`}
            formatAxis={(v) => String(v)}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Top products" action={<span className="text-xs text-ink-3">Item sales · units · colour = category</span>}>
          <BarList
            key={range}
            rows={topProducts(now, db.products, 7)}
            formatValue={taka}
            formatDetail={(d) => `${d} sold`}
            colors={Object.fromEntries(db.products.map((p) => [p.id, CATEGORY_COLOR[productCategory.get(p.id)!]]))}
          />
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
            <ul className="divide-y divide-line">
              {low.slice(0, 7).map(({ product, size, units }) => (
                <li key={`${product.id}-${size}`} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <img src={product.image} alt="" className="size-9 rounded-lg bg-white object-cover" />
                  <span className="min-w-0 flex-1 truncate">
                    {product.name} <span className="text-ink-3">· size {size}</span>
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${units === 0 ? 'bg-critical/12 text-critical' : 'bg-warning/15 text-ink'}`}>{units === 0 ? 'Out of stock' : `${units} left`}</span>
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
              <tr key={o.id} className="border-t border-line hover:bg-sunken/60">
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
