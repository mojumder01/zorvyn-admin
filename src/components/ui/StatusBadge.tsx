import { CircleCheck, CircleX, Clock, PackageCheck, Truck } from 'lucide-react';
import { STATUS_LABEL } from '../../data/labels';
import type { OrderStatus } from '../../data/types';

// Status colour always comes with an icon and a label, never colour alone
const STYLE: Record<OrderStatus, { icon: typeof Clock; dot: string }> = {
  pending: { icon: Clock, dot: 'text-warning' },
  confirmed: { icon: PackageCheck, dot: 'text-series-1' },
  shipped: { icon: Truck, dot: 'text-serious' },
  delivered: { icon: CircleCheck, dot: 'text-good' },
  cancelled: { icon: CircleX, dot: 'text-critical' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { icon: Icon, dot } = STYLE[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 py-0.5 text-xs font-medium text-ink whitespace-nowrap">
      <Icon className={`size-3.5 ${dot}`} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export { STATUS_COLOR } from '../../data/colors';
