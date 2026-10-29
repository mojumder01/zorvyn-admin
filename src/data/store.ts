/**
 * The demo "database": kept in this browser (localStorage) so changes survive a reload.
 * Every change goes through the actions below, which keep stock and order history consistent.
 */
import { useSyncExternalStore } from 'react';
import { createSeedDatabase, DB_VERSION } from './seed';
import type { Database, DiscountCode, Order, OrderStatus, Product, Settings } from './types';

const STORAGE_KEY = 'zorvyn-admin.db';

function load(): Database {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Database | null;
    if (saved?.version === DB_VERSION) return saved;
  } catch {
    // Unreadable or blocked storage: start from the demo data
  }
  return createSeedDatabase();
}

let db: Database = load();
const listeners = new Set<() => void>();

function commit(next: Database) {
  db = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked: changes still work until the page is closed
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDatabase(): Database {
  return useSyncExternalStore(subscribe, () => db);
}

/** Which statuses an order can move to from its current one. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const actions = {
  setOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order || !NEXT_STATUSES[order.status].includes(status)) return;
    const updated: Order = { ...order, status, history: [...order.history, { status, at: new Date().toISOString(), ...(note ? { note } : {}) }] };
    // A cancelled order puts its items back on the shelf
    const products = status === 'cancelled' ? restock(db.products, order) : db.products;
    commit({ ...db, products, orders: db.orders.map((o) => (o.id === orderId ? updated : o)) });
  },

  saveProduct(product: Product) {
    const exists = db.products.some((p) => p.id === product.id);
    commit({ ...db, products: exists ? db.products.map((p) => (p.id === product.id ? product : p)) : [product, ...db.products] });
  },

  deleteProduct(productId: string) {
    commit({ ...db, products: db.products.filter((p) => p.id !== productId) });
  },

  setStock(productId: string, size: string, units: number) {
    const value = Math.max(0, Math.min(9999, Math.round(units) || 0));
    commit({ ...db, products: db.products.map((p) => (p.id === productId ? { ...p, stock: { ...p.stock, [size]: value } } : p)) });
  },

  saveSettings(settings: Settings) {
    commit({ ...db, settings });
  },

  saveDiscountCodes(discountCodes: DiscountCode[]) {
    commit({ ...db, settings: { ...db.settings, discountCodes } });
  },

  resetDemoData() {
    commit(createSeedDatabase());
  },
};

function restock(products: Product[], order: Order): Product[] {
  return products.map((p) => {
    const lines = order.items.filter((it) => it.productId === p.id && it.size in p.stock);
    if (!lines.length) return p;
    const stock = { ...p.stock };
    for (const line of lines) stock[line.size] += line.quantity;
    return { ...p, stock };
  });
}
