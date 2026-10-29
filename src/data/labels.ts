import type { Category, DeliveryArea, OrderStatus, PaymentMethod } from './types';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const CATEGORY_LABEL: Record<Category, string> = { sneakers: 'Sneakers', jeans: 'Jeans', women: 'Women', kids: 'Kids' };
export const PAYMENT_LABEL: Record<PaymentMethod, string> = { cod: 'Cash on delivery', bkash: 'bKash', nagad: 'Nagad' };
export const AREA_LABEL: Record<DeliveryArea, string> = { insideDhaka: 'Inside Dhaka', outsideDhaka: 'Outside Dhaka' };
