/**
 * Demo data: the Zorvyn catalogue, 60 customers and about 90 days of orders ending today.
 * Generated from a fixed seed, so "Reset demo data" always gives the same shop.
 */
import { createRandom } from '../lib/random';
import { addDays, startOfDay } from '../lib/format';
import type { Customer, Database, DeliveryArea, Order, OrderItem, OrderStatus, Product, Settings } from './types';

export const DB_VERSION = 1;
const DAYS = 90;

const SHOE_SIZES = ['39', '40', '41', '42', '43', '44'];
const JEAN_SIZES = ['30', '32', '34', '36', '38'];
const WOMEN_SIZES = ['S', 'M', 'L', 'XL'];
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];

export const SIZES_BY_CATEGORY = { sneakers: SHOE_SIZES, jeans: JEAN_SIZES, women: WOMEN_SIZES, kids: KIDS_SIZES } as const;

const CATALOGUE: Omit<Product, 'stock' | 'active' | 'createdAt'>[] = [
  { id: 'glide-knit-runner', sku: 'ZV-SNK-001', name: 'Glide Knit Runner', category: 'sneakers', price: 3490, oldPrice: 4290, colour: 'Black / Grey', image: 'products/glide-knit-runner.jpg', description: 'A light, breathable knit runner with a cushioned sole for all-day city walking.' },
  { id: 'aero-mesh-trainer', sku: 'ZV-SNK-002', name: 'Aero Mesh Trainer', category: 'sneakers', price: 3190, colour: 'Light Grey / Red', image: 'products/aero-mesh-trainer.jpg', description: 'A mesh trainer with a supportive heel and a bold red accent.' },
  { id: 'wave-street-runner', sku: 'ZV-SNK-003', name: 'Wave Street Runner', category: 'sneakers', price: 2990, colour: 'Grey / Navy', image: 'products/wave-street-runner.jpg', description: 'An everyday runner with a wave-pattern sole.' },
  { id: 'classic-straight-jeans', sku: 'ZV-JNS-001', name: 'Classic Straight Jeans', category: 'jeans', price: 2450, colour: 'Light Wash', image: 'products/classic-straight-jeans.jpg', description: 'A timeless straight-leg jean in a soft light wash.' },
  { id: 'tapered-indigo-jeans', sku: 'ZV-JNS-002', name: 'Tapered Indigo Jeans', category: 'jeans', price: 2650, colour: 'Dark Indigo', image: 'products/tapered-indigo-jeans.jpg', description: 'A sharp tapered jean in deep indigo.' },
  { id: 'floral-garden-dress', sku: 'ZV-WMN-001', name: 'Floral Garden Dress', category: 'women', price: 2190, colour: 'Navy & Black floral', image: 'products/floral-garden-dress.jpg', description: 'A flowing floral dress with a fitted waist.' },
  { id: 'golden-check-lehenga', sku: 'ZV-KID-001', name: 'Golden Check Lehenga Set', category: 'kids', price: 2890, oldPrice: 3290, colour: 'Leaf Green / Gold', image: 'products/golden-check-lehenga.jpg', description: 'A festive two-piece set with an embroidered top and a checked skirt.' },
  { id: 'princess-satin-gown', sku: 'ZV-KID-002', name: 'Princess Satin Gown', category: 'kids', price: 4490, colour: 'Ice Blue / Peach', image: 'products/princess-satin-gown.jpg', description: 'A fairy-tale satin gown with a gathered skirt.' },
];

/** How often each product is ordered, relative to the others. */
const POPULARITY: Record<string, number> = {
  'glide-knit-runner': 22, 'classic-straight-jeans': 20, 'aero-mesh-trainer': 15, 'tapered-indigo-jeans': 13,
  'wave-street-runner': 11, 'floral-garden-dress': 9, 'golden-check-lehenga': 7, 'princess-satin-gown': 3,
};

const FIRST_NAMES = ['Rafi', 'Nusrat', 'Tanvir', 'Farhana', 'Arif', 'Sadia', 'Mehedi', 'Tasnim', 'Imran', 'Jannat', 'Sabbir', 'Mim', 'Rakib', 'Sumaiya', 'Hasan', 'Anika', 'Fahim', 'Tahmina', 'Nayeem', 'Ritu', 'Shakil', 'Lamia', 'Rifat', 'Afsana', 'Zubair', 'Nadia', 'Sakib', 'Maliha', 'Tanjim', 'Shirin'];
const LAST_NAMES = ['Ahmed', 'Hossain', 'Islam', 'Rahman', 'Khan', 'Chowdhury', 'Akter', 'Uddin', 'Sarkar', 'Talukder', 'Mia', 'Begum', 'Kabir', 'Haque', 'Siddique'];
const DHAKA_AREAS = ['Dhanmondi', 'Mirpur', 'Uttara', 'Gulshan', 'Mohammadpur', 'Banani', 'Bashundhara', 'Motijheel', 'Badda', 'Farmgate'];
const OTHER_CITIES = ['Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Cumilla', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj'];

export const DEFAULT_SETTINGS: Settings = {
  storeName: 'Zorvyn',
  supportPhone: '01700-000000',
  deliveryFee: { insideDhaka: 70, outsideDhaka: 130 },
  lowStockAt: 5,
  discountCodes: [
    { code: 'WELCOME10', percent: 10, active: true },
    { code: 'EID15', percent: 15, active: true },
    { code: 'FLASH20', percent: 20, active: false },
  ],
};

export function createSeedDatabase(now = new Date()): Database {
  const random = createRandom(20261029);
  const today = startOfDay(now);
  const firstDay = addDays(today, -(DAYS - 1));
  const at = (day: Date, hour: number, minute: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute).toISOString();

  const products: Product[] = CATALOGUE.map((item, i) => ({
    ...item,
    stock: Object.fromEntries(SIZES_BY_CATEGORY[item.category].map((size) => [size, random.int(0, 9) < 2 ? random.int(0, 4) : random.int(6, 28)])),
    active: true,
    createdAt: at(addDays(firstDay, -120 + i * 12), 11, 0),
  }));

  const usedPhones = new Set<string>();
  const customers: Customer[] = Array.from({ length: 60 }, (_, i) => {
    const name = `${random.pick(FIRST_NAMES)} ${random.pick(LAST_NAMES)}`;
    const inDhaka = random.next() < 0.6;
    const city = inDhaka ? 'Dhaka' : random.pick(OTHER_CITIES);
    let phone = '';
    do phone = `01${random.pick(['3', '5', '6', '7', '8', '9'])}${String(random.int(10_000_000, 99_999_999))}`;
    while (usedPhones.has(phone));
    usedPhones.add(phone);
    const joined = addDays(firstDay, random.int(-200, DAYS - 5));
    return {
      id: `C${String(1001 + i)}`,
      name,
      phone,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}${random.int(1, 99)}@example.com`,
      city,
      address: inDhaka ? `House ${random.int(1, 120)}, Road ${random.int(1, 30)}, ${random.pick(DHAKA_AREAS)}` : `${random.int(1, 300)} ${random.pick(['Station Road', 'College Road', 'Main Road', 'Court Para', 'New Market'])}`,
      joinedAt: at(joined, 10, 0),
    };
  });

  const orders: Order[] = [];
  let orderNumber = 10001;
  for (let d = 0; d < DAYS; d++) {
    const day = addDays(firstDay, d);
    const age = DAYS - 1 - d; // days before today
    // Sales grow over the quarter, with a Friday/Saturday bump
    const weekend = day.getDay() === 5 || day.getDay() === 6 ? 2 : 0;
    const perDay = random.int(2, 5) + Math.floor(d / 30) + weekend;
    for (let n = 0; n < perDay; n++) {
      const customer = random.pick(customers);
      const area: DeliveryArea = customer.city === 'Dhaka' ? 'insideDhaka' : 'outsideDhaka';
      const items: OrderItem[] = [];
      const lines = random.weighted({ 1: 70, 2: 24, 3: 6 });
      for (let l = 0; l < Number(lines); l++) {
        const productId = random.weighted(POPULARITY);
        const product = products.find((p) => p.id === productId)!;
        const size = random.pick(SIZES_BY_CATEGORY[product.category]);
        const existing = items.find((it) => it.productId === productId && it.size === size);
        if (existing) existing.quantity += 1;
        else items.push({ productId, name: product.name, size, price: product.price, quantity: random.next() < 0.88 ? 1 : 2 });
      }
      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      const discountCode = random.next() < 0.14 ? random.pick(['WELCOME10', 'EID15']) : undefined;
      const percent = DEFAULT_SETTINGS.discountCodes.find((c) => c.code === discountCode)?.percent ?? 0;
      const discount = Math.round((subtotal * percent) / 100);
      const deliveryFee = DEFAULT_SETTINGS.deliveryFee[area];
      let placed = new Date(at(day, random.int(9, 22), random.int(0, 59)));
      // Today's orders can't be in the future
      if (placed > now) placed = new Date(now.getTime() - random.int(5, 8 * 60) * 60_000);
      const status = statusForAge(age, random.next());
      orders.push({
        id: `ZV-${orderNumber++}`,
        customerId: customer.id,
        items,
        subtotal,
        discount,
        deliveryFee,
        total: subtotal - discount + deliveryFee,
        area,
        address: customer.address,
        city: customer.city,
        payment: random.weighted({ cod: 68, bkash: 24, nagad: 8 }),
        discountCode,
        status,
        history: historyFor(status, placed, random.int(2, 20), now),
        createdAt: placed.toISOString(),
      });
    }
  }
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
  // A customer joined no later than their first order
  for (const o of orders) {
    const c = customers.find((x) => x.id === o.customerId)!;
    if (o.createdAt < c.joinedAt) c.joinedAt = o.createdAt;
  }

  return { version: DB_VERSION, products, customers, orders, settings: structuredClone(DEFAULT_SETTINGS) };
}

/** Older orders are mostly delivered; today's are still waiting. */
function statusForAge(age: number, roll: number): OrderStatus {
  if (age === 0) return roll < 0.65 ? 'pending' : 'confirmed';
  if (age <= 2) return roll < 0.15 ? 'pending' : roll < 0.55 ? 'confirmed' : roll < 0.95 ? 'shipped' : 'cancelled';
  if (age <= 5) return roll < 0.45 ? 'shipped' : roll < 0.93 ? 'delivered' : 'cancelled';
  return roll < 0.92 ? 'delivered' : 'cancelled';
}

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

function historyFor(status: OrderStatus, placed: Date, stepHours: number, now: Date) {
  // Steps never land in the future: recent orders get squeezed into the time since they were placed
  const hoursLater = (h: number) => new Date(Math.min(placed.getTime() + h * 3_600_000, now.getTime() - 60_000)).toISOString();
  if (status === 'cancelled') {
    return [
      { status: 'pending' as const, at: placed.toISOString() },
      { status: 'cancelled' as const, at: hoursLater(stepHours), note: 'Customer could not be reached' },
    ];
  }
  return FLOW.slice(0, FLOW.indexOf(status) + 1).map((s, i) => ({ status: s, at: i === 0 ? placed.toISOString() : hoursLater(stepHours * i * 1.5) }));
}
