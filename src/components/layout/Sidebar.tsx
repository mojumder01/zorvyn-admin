import { Boxes, ChartColumn, LayoutDashboard, Settings, Shirt, ShoppingBag, Users } from 'lucide-react';
import { useDatabase } from '../../data/store';
import { Link, usePath } from '../../lib/router';

export const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/products', label: 'Products', icon: Shirt },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reports', label: 'Reports', icon: ChartColumn },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-white shadow-md shadow-brand/30">Z</span>
      Zorvyn <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-brand uppercase">Admin</span>
    </span>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePath();
  const db = useDatabase();
  const pending = db.orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="flex h-full flex-col gap-6 bg-panel/80 p-4 backdrop-blur">
      <div className="px-2 pt-1">
        <Logo />
      </div>
      <nav aria-label="Main">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const current = to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`);
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onNavigate}
                  aria-current={current ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${current ? 'bg-gradient-to-r from-brand/15 to-brand-2/10 text-brand dark:from-brand/25 dark:to-brand-2/15' : 'text-ink-2 hover:bg-sunken hover:text-ink'}`}
                >
                  <Icon className="size-4.5" aria-hidden />
                  <span className="flex-1">{label}</span>
                  {to === '/orders' && pending > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums" aria-label={`${pending} pending`}>
                      {pending}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="mt-auto rounded-xl border border-line bg-gradient-to-br from-brand/10 to-series-7/10 p-3 text-xs leading-relaxed text-ink-2">
        <span className="font-semibold text-ink">Demo admin.</span> Data lives in this browser only. Reset it any time in Settings.
      </p>
    </div>
  );
}
