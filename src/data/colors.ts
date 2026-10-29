import type { Category, OrderStatus, PaymentMethod } from './types';

/** Each entity keeps one colour in every chart (validated palette slots, in order). */
export const CATEGORY_COLOR: Record<Category, string> = {
  sneakers: 'var(--color-series-1)',
  jeans: 'var(--color-series-2)',
  women: 'var(--color-series-3)',
  kids: 'var(--color-series-4)',
};

export const PAYMENT_COLOR: Record<PaymentMethod, string> = {
  cod: 'var(--color-series-1)',
  bkash: 'var(--color-series-2)',
  nagad: 'var(--color-series-3)',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'var(--color-warning)',
  confirmed: 'var(--color-series-1)',
  shipped: 'var(--color-serious)',
  delivered: 'var(--color-good)',
  cancelled: 'var(--color-critical)',
};
