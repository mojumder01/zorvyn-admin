import { useState } from 'react';
import { Download } from 'lucide-react';
import { BarChart } from '../components/charts/BarChart';
import { BarList } from '../components/charts/BarList';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { RangePicker, type Range } from '../components/ui/RangePicker';
import { CATEGORY_LABEL } from '../data/labels';
import { useDatabase } from '../data/store';
import { inPeriod, monthlySeries, paymentSplit, periodsFor, salesByCategory, salesByCity, topProducts } from '../lib/analytics';
import { downloadCsv } from '../lib/csv';
import { compactTaka, dayKey, formatMonth, taka } from '../lib/format';

export function Reports() {
  const db = useDatabase();
  const [range, setRange] = useState<Range>(30);
  const orders = db.orders.filter((o) => inPeriod(o, periodsFor(range).current));
  const months = monthlySeries(db.orders);

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
        <Card title="Sales by category" action={<span className="text-xs text-ink-3">Item sales · share</span>}>
          <BarList rows={salesByCategory(orders, db.products)} formatValue={taka} />
        </Card>
        <Card title="Best-selling products" action={<span className="text-xs text-ink-3">Item sales · units</span>}>
          <BarList rows={topProducts(orders, db.products, 8)} formatValue={taka} formatDetail={(d) => `${d} sold`} />
        </Card>
        <Card title="Top cities" action={<span className="text-xs text-ink-3">Order value · orders</span>}>
          <BarList rows={salesByCity(orders)} formatValue={taka} formatDetail={(d) => `${d} orders`} />
        </Card>
        <Card title="Payment methods" action={<span className="text-xs text-ink-3">Order value · orders</span>}>
          <BarList rows={paymentSplit(orders)} formatValue={taka} formatDetail={(d) => `${d} orders`} />
        </Card>
      </div>
    </Shell>
  );
}
