export type Category = 'sneakers' | 'jeans' | 'women' | 'kids';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad';
export type DeliveryArea = 'insideDhaka' | 'outsideDhaka';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  price: number;
  /** Price before a discount, when the product is on sale. */
  oldPrice?: number;
  colour: string;
  /** Path under public/ or an uploaded image (data URL). */
  image: string;
  description: string;
  /** Units in stock per size, in display order. */
  stock: Record<string, number>;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  joinedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface StatusChange {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  area: DeliveryArea;
  address: string;
  city: string;
  payment: PaymentMethod;
  discountCode?: string;
  status: OrderStatus;
  history: StatusChange[];
  createdAt: string;
}

export interface DiscountCode {
  code: string;
  percent: number;
  active: boolean;
}

export interface Settings {
  storeName: string;
  supportPhone: string;
  deliveryFee: Record<DeliveryArea, number>;
  /** A size at or below this many units counts as low stock. */
  lowStockAt: number;
  discountCodes: DiscountCode[];
}

export interface Database {
  version: number;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  settings: Settings;
}
