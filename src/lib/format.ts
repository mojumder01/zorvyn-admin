const number = new Intl.NumberFormat('en-IN');
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

export const taka = (amount: number) => `৳${number.format(Math.round(amount))}`;
export const count = (value: number) => number.format(value);
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
export const formatShortDate = (date: Date) => shortDate.format(date);
export const formatMonth = (date: Date) => monthFormat.format(date);

/** Compact taka for chart axes: ৳12.5k, ৳1.2L (lakh). */
export function compactTaka(amount: number): string {
  if (amount >= 100_000) return `৳${(amount / 100_000).toFixed(amount >= 1_000_000 ? 0 : 1)}L`;
  if (amount >= 1_000) return `৳${(amount / 1_000).toFixed(amount >= 10_000 ? 0 : 1)}k`;
  return `৳${Math.round(amount)}`;
}

/** "+12.5%" / "−3.0%" change between two periods; null when there is nothing to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
export const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
