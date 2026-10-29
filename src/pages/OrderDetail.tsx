import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Field, Textarea } from '../components/ui/Field';
import { STATUS_COLOR, StatusBadge } from '../components/ui/StatusBadge';
import { toast } from '../components/ui/Toast';
import { AREA_LABEL, PAYMENT_LABEL, STATUS_LABEL } from '../data/labels';
import { actions, NEXT_STATUSES, useDatabase } from '../data/store';
import type { OrderStatus } from '../data/types';
import { formatDateTime, taka } from '../lib/format';
import { Link } from '../lib/router';
import { NotFound } from './NotFound';

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Confirm order',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel order',
};

export function OrderDetail({ id }: { id: string }) {
  const db = useDatabase();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const order = db.orders.find((o) => o.id === id);
  if (!order) return <NotFound what="Order" back="/orders" />;
  const customer = db.customers.find((c) => c.id === order.customerId);
  const next = NEXT_STATUSES[order.status];
  const productImage = (pid: string) => db.products.find((p) => p.id === pid)?.image;

  const move = (status: OrderStatus, note?: string) => {
    actions.setOrderStatus(order.id, status, note);
    toast(`${order.id} is now ${STATUS_LABEL[status].toLowerCase()}`);
  };

  return (
    <Shell
      title={`Order ${order.id}`}
      actions={
        <>
          <Link to="/orders" className="mr-auto inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Orders
          </Link>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden /> Print invoice
          </Button>
          {next
            .filter((s) => s !== 'cancelled')
            .map((s) => (
              <Button key={s} variant="primary" onClick={() => move(s)}>
                {ACTION_LABEL[s]}
              </Button>
            ))}
          {next.includes('cancelled') && (
            <Button variant="danger" onClick={() => setCancelOpen(true)}>
              Cancel order
            </Button>
          )}
        </>
      }
    >
      <div className="print-area grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={
              <span className="flex flex-wrap items-center gap-3">
                <span className="hidden print:inline">{db.settings.storeName} · Invoice </span>
                {order.id} <StatusBadge status={order.status} />
              </span>
            }
            action={<span className="text-xs text-ink-3">Placed {formatDateTime(order.createdAt)}</span>}
            bodyClass="p-0"
          >
            <ul className="divide-y divide-line">
              {order.items.map((it) => (
                <li key={`${it.productId}-${it.size}`} className="flex items-center gap-4 px-5 py-3">
                  {productImage(it.productId) ? <img src={productImage(it.productId)} alt="" className="size-14 rounded-lg bg-sunken object-cover" /> : <div className="size-14 rounded-lg bg-sunken" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-ink-3">
                      Size {it.size} · {taka(it.price)} × {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{taka(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd className="tabular-nums">{taka(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-2">Discount ({order.discountCode})</dt>
                  <dd className="tabular-nums">−{taka(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-2">Delivery ({AREA_LABEL[order.area]})</dt>
                <dd className="tabular-nums">{taka(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{taka(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Timeline" className="no-print">
            <ol className="space-y-4">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[h.status] }} aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{STATUS_LABEL[h.status]}</p>
                    <p className="text-xs text-ink-3">{formatDateTime(h.at)}</p>
                    {h.note && <p className="mt-1 text-sm text-ink-2">“{h.note}”</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            {customer ? (
              <div className="space-y-1 text-sm">
                <Link to={`/customers/${customer.id}`} className="font-medium hover:text-brand hover:underline">
                  {customer.name}
                </Link>
                <p className="text-ink-2">{customer.phone}</p>
                <p className="text-ink-2">{customer.email}</p>
              </div>
            ) : (
              <p className="text-sm text-ink-3">Customer not found.</p>
            )}
          </Card>
          <Card title="Delivery">
            <div className="space-y-1 text-sm">
              <p>{order.address}</p>
              <p className="text-ink-2">{order.city}</p>
              <p className="text-ink-3">{AREA_LABEL[order.area]}</p>
            </div>
          </Card>
          <Card title="Payment">
            <div className="space-y-1 text-sm">
              <p>{PAYMENT_LABEL[order.payment]}</p>
              <p className="text-ink-2">{order.payment === 'cod' ? (order.status === 'delivered' ? 'Collected on delivery' : 'Collect on delivery') : 'Paid online'}</p>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} title={`Cancel ${order.id}?`}>
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            move('cancelled', reason.trim() || undefined);
            setCancelOpen(false);
            setReason('');
          }}
        >
          <p className="text-sm text-ink-2">The items go back into stock. This can't be undone.</p>
          <Field label="Reason (optional)" htmlFor="cancel-reason">
            <Textarea id="cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer changed their mind" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCancelOpen(false)}>Keep order</Button>
            <Button type="submit" variant="danger">
              Cancel order
            </Button>
          </div>
        </form>
      </Dialog>
    </Shell>
  );
}
