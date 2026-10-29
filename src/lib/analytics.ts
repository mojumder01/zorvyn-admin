/** Numbers for the dashboard and reports. Cancelled orders never count as sales. */
import { CATEGORY_LABEL, PAYMENT_LABEL } from '../data/labels';
import type { Database, Order, Product } from '../data/types';
import { addDays, dayKey, startOfDay } from './format';

export const isSale = (o: Order) => o.status !== 'cancelled';

export interface Period {
  from: Date; // inclusive, start of day
  to: Date; // exclusive
}

/** The last `days` days including today, and the same length just before it. */
export function periodsFor(days: number, now = new Date()): { current: Period; previous: Period } {
  const to = addDays(startOfDay(now), 1);
  const from = addDays(to, -days);
  return { current: { from, to }, previous: { from: addDays(from, -days), to: from } };
}

export const inPeriod = (o: Order, p: Period) => {
  const t = new Date(o.createdAt).getTime();
  return t >= p.from.getTime() && t < p.to.getTime();
};

export function summary(orders: Order[]) {
  const sales = orders.filter(isSale);
  const revenue = sales.reduce((sum, o) => sum + o.total, 0);
  return {
    revenue,
    orders: sales.length,
    averageOrder: sales.length ? revenue / sales.length : 0,
    units: sales.reduce((sum, o) => sum + o.items.reduce((n, it) => n + it.quantity, 0), 0),
    cancelled: orders.length - sales.length,
  };
}

export interface DayPoint {
  date: Date;
  revenue: number;
  orders: number;
}

/** One point per day in the period, including days with no sales. */
export function dailySeries(orders: Order[], period: Period): DayPoint[] {
  const byDay = new Map<string, DayPoint>();
  for (let d = period.from; d < period.to; d = addDays(d, 1)) byDay.set(dayKey(d), { date: d, revenue: 0, orders: 0 });
  for (const o of orders) {
    if (!isSale(o) || !inPeriod(o, period)) continue;
    const point = byDay.get(dayKey(new Date(o.createdAt)));
    if (point) {
      point.revenue += o.total;
      point.orders += 1;
    }
  }
  return [...byDay.values()];
}

export interface Ranked {
  key: string;
  label: string;
  value: number;
  /** Secondary number shown next to the value, e.g. units sold. */
  detail?: number;
}

/** Items revenue (before delivery and discount) per product. */
export function topProducts(orders: Order[], products: Product[], limit = 5): Ranked[] {
  const totals = new Map<string, Ranked>();
  for (const o of orders) {
    if (!isSale(o)) continue;
    for (const it of o.items) {
      const row = totals.get(it.productId) ?? { key: it.productId, label: products.find((p) => p.id === it.productId)?.name ?? it.name, value: 0, detail: 0 };
      row.value += it.price * it.quantity;
      row.detail! += it.quantity;
      totals.set(it.productId, row);
    }
  }
  return [...totals.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

export function salesByCategory(orders: Order[], products: Product[]): Ranked[] {
  const totals = new Map<string, number>();
  for (const o of orders) {
    if (!isSale(o)) continue;
    for (const it of o.items) {
      const category = products.find((p) => p.id === it.productId)?.category;
      if (category) totals.set(category, (totals.get(category) ?? 0) + it.price * it.quantity);
    }
  }
  return [...totals.entries()]
    .map(([key, value]) => ({ key, label: CATEGORY_LABEL[key as keyof typeof CATEGORY_LABEL], value }))
    .sort((a, b) => b.value - a.value);
}

export function salesByCity(orders: Order[], limit = 6): Ranked[] {
  const totals = new Map<string, Ranked>();
  for (const o of orders) {
    if (!isSale(o)) continue;
    const row = totals.get(o.city) ?? { key: o.city, label: o.city, value: 0, detail: 0 };
    row.value += o.total;
    row.detail! += 1;
    totals.set(o.city, row);
  }
  return [...totals.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

export function paymentSplit(orders: Order[]): Ranked[] {
  const totals = new Map<string, Ranked>();
  for (const o of orders) {
    if (!isSale(o)) continue;
    const row = totals.get(o.payment) ?? { key: o.payment, label: PAYMENT_LABEL[o.payment], value: 0, detail: 0 };
    row.value += o.total;
    row.detail! += 1;
    totals.set(o.payment, row);
  }
  return [...totals.values()].sort((a, b) => b.value - a.value);
}

export interface MonthPoint {
  date: Date;
  revenue: number;
  orders: number;
}

export function monthlySeries(orders: Order[]): MonthPoint[] {
  const months = new Map<string, MonthPoint>();
  for (const o of orders) {
    if (!isSale(o)) continue;
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point = months.get(key) ?? { date: new Date(d.getFullYear(), d.getMonth(), 1), revenue: 0, orders: 0 };
    point.revenue += o.total;
    point.orders += 1;
    months.set(key, point);
  }
  return [...months.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface LowStockRow {
  product: Product;
  size: string;
  units: number;
}

export function lowStock(db: Database): LowStockRow[] {
  return db.products
    .filter((p) => p.active)
    .flatMap((product) => Object.entries(product.stock).map(([size, units]) => ({ product, size, units })))
    .filter((row) => row.units <= db.settings.lowStockAt)
    .sort((a, b) => a.units - b.units);
}

export const totalStock = (p: Product) => Object.values(p.stock).reduce((sum, n) => sum + n, 0);
