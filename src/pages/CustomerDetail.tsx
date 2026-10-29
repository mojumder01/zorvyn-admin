import { ArrowLeft } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDatabase } from '../data/store';
import { summary } from '../lib/analytics';
import { formatDate, formatDateTime, taka } from '../lib/format';
import { Link } from '../lib/router';
import { NotFound } from './NotFound';

export function CustomerDetail({ id }: { id: string }) {
  const db = useDatabase();
  const customer = db.customers.find((c) => c.id === id);
  if (!customer) return <NotFound what="Customer" back="/customers" />;
  const orders = db.orders.filter((o) => o.customerId === id);
  const s = summary(orders);

  return (
    <Shell
      title={customer.name}
      actions={
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Customers
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Contact">
          <dl className="space-y-3 text-sm">
            {[
              ['Phone', customer.phone],
              ['Email', customer.email],
              ['Address', `${customer.address}, ${customer.city}`],
              ['Customer since', formatDate(customer.joinedAt)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="grid grid-cols-3 gap-3 self-start lg:col-span-2">
          {[
            ['Orders', String(s.orders)],
            ['Total spent', taka(s.revenue)],
            ['Average order', taka(s.averageOrder)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
              <p className="text-xs text-ink-2">{k}</p>
              <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <Card title={`Order history (${orders.length})`} bodyClass="relative overflow-x-auto">
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-ink-3">No orders yet.</p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line first:border-0">
                  <td className="px-5 py-3 font-medium whitespace-nowrap">
                    <Link to={`/orders/${o.id}`} className="hover:text-brand hover:underline">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-2">{formatDateTime(o.createdAt)}</td>
                  <td className="px-5 py-3 text-ink-2">{o.items.map((it) => it.name).join(', ')}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{taka(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Shell>
  );
}
