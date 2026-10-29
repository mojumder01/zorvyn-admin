import { useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart } from '../components/charts/BarChart';
import { BarList } from '../components/charts/BarList';
import { DonutChart } from '../components/charts/DonutChart';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { RangePicker, type Range } from '../components/ui/RangePicker';
import { CATEGORY_COLOR, PAYMENT_COLOR } from '../data/colors';
import { CATEGORY_LABEL } from '../data/labels';
import { useDatabase } from '../data/store';
import type { Category, PaymentMethod } from '../data/types';
import { inPeriod, monthlySeries, paymentSplit, periodsFor, salesByCategory, salesByCity, salesByWeekday, topProducts } from '../lib/analytics';
import { downloadCsv } from '../lib/csv';
import { compactTaka, dayKey, formatMonth, taka } from '../lib/format';

export function Reports() {
  const db = useDatabase();
  const [range, setRange] = useState<Range>(30);
  const orders = db.orders.filter((o) => inPeriod(o, periodsFor(range).current));
  const months = monthlySeries(db.orders);
  const categoryOf = new Map(db.products.map((p) => [p.id, p.category]));

  const exportProductSales = () => {
    const rows = topProducts(orders, db.products, 1000);
    downloadCsv(`zorvyn-product-sales-last-${range}-days-${dayKey(new Date())}.csv`, [
      ['Product', 'SKU', 'Category', 'Units sold', 'Item sales (BDT)'],
      ...rows.map((r) => {
        const p = db.products.find((x) => x.id === r.key);
        return [r.label, p?.sku ?? '', p ? CATEGORY_LABEL[p.category] : '', r.detail ?? 0, r.value];
      }),
    ]);
  };

  return (
    <Shell title="Reports">
      <Card title="Revenue by month" action={<span className="text-xs text-ink-3">Excludes cancelled · this month so far</span>}>
        <BarChart
          title="Revenue by month"
          valueLabel="Revenue"
          xLabel="Month"
          points={months.map((m) => ({ label: formatMonth(m.date), tick: formatMonth(m.date), value: m.revenue, note: `${m.orders} orders` }))}
          formatValue={taka}
          formatAxis={compactTaka}
        />
      </Card>

      <div className="no-print flex flex-wrap items-center gap-2">
        <RangePicker value={range} onChange={setRange} />
        <Button onClick={exportProductSales} className="ml-auto">
          <Download className="size-4" aria-hidden /> Product sales CSV
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Sales by category">
          <DonutChart
            title="Sales by category"
            animateKey={range}
            totalLabel="item sales"
            formatValue={compactTaka}
            segments={salesByCategory(orders, db.products).map((r) => ({ key: r.key, name: r.label, label: r.label, value: r.value, color: CATEGORY_COLOR[r.key as Category] }))}
          />
        </Card>
        <Card title="Payment methods">
          <DonutChart
            title="Payment methods"
            animateKey={range}
            totalLabel="order value"
            formatValue={compactTaka}
            segments={paymentSplit(orders).map((r) => ({ key: r.key, name: r.label, label: r.label, value: r.value, color: PAYMENT_COLOR[r.key as PaymentMethod] }))}
          />
        </Card>
        <Card title="Revenue by weekday" action={<span className="text-xs text-ink-3">Saturday first</span>}>
          <BarChart
            title="Revenue by weekday"
            valueLabel="Revenue"
            xLabel="Day"
            height={220}
            color="var(--color-series-3)"
            animateKey={range}
            points={salesByWeekday(orders).map((d) => ({ label: d.day, tick: d.day, value: d.revenue, note: `${d.orders} orders` }))}
            formatValue={taka}
            formatAxis={compactTaka}
          />
        </Card>
        <Card title="Top cities" action={<span className="text-xs text-ink-3">Order value · orders</span>}>
          <BarList key={range} rows={salesByCity(orders)} formatValue={taka} formatDetail={(d) => `${d} orders`} color="var(--color-series-7)" />
        </Card>
      </div>

      <Card title="Best-selling products" action={<span className="text-xs text-ink-3">Item sales · units · colour = category</span>}>
        <BarList
          key={range}
          rows={topProducts(orders, db.products, 8)}
          formatValue={taka}
          formatDetail={(d) => `${d} sold`}
          colors={Object.fromEntries(db.products.map((p) => [p.id, CATEGORY_COLOR[categoryOf.get(p.id)!]]))}
        />
      </Card>
    </Shell>
  );
}
