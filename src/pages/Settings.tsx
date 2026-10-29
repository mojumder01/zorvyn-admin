import { useState, type FormEvent } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Field, Input } from '../components/ui/Field';
import { toast } from '../components/ui/Toast';
import { actions, useDatabase } from '../data/store';
import type { Settings as StoreSettings } from '../data/types';

export function Settings() {
  const db = useDatabase();
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <Shell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <StoreForm key={JSON.stringify(db.settings)} settings={db.settings} />
        <DiscountCodes />
      </div>
      <Card title="Demo data">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm text-ink-2">Everything you change is saved in this browser only. Reset to bring back the original products, customers and 90 days of orders.</p>
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-4" aria-hidden /> Reset demo data
          </Button>
        </div>
      </Card>
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?">
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink-2">All your changes to orders, products, stock and settings are replaced with the original demo data.</p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.resetDemoData();
                setResetOpen(false);
                toast('Demo data reset');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </Shell>
  );
}

function StoreForm({ settings }: { settings: StoreSettings }) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.supportPhone);
  const [inside, setInside] = useState(String(settings.deliveryFee.insideDhaka));
  const [outside, setOutside] = useState(String(settings.deliveryFee.outsideDhaka));
  const [lowAt, setLowAt] = useState(String(settings.lowStockAt));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    const fee = (v: string) => /^\d{1,4}$/.test(v.trim());
    if (!storeName.trim()) found.storeName = 'Enter the store name.';
    if (!fee(inside)) found.inside = 'Enter a fee from 0 to 9999.';
    if (!fee(outside)) found.outside = 'Enter a fee from 0 to 9999.';
    if (!/^\d{1,3}$/.test(lowAt.trim())) found.lowAt = 'Enter a number from 0 to 999.';
    setErrors(found);
    if (Object.keys(found).length) return;
    actions.saveSettings({
      ...settings,
      storeName: storeName.trim(),
      supportPhone: phone.trim(),
      deliveryFee: { insideDhaka: Number(inside), outsideDhaka: Number(outside) },
      lowStockAt: Number(lowAt),
    });
    toast('Settings saved');
  };

  return (
    <Card title="Store">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Store name" htmlFor="s-name" error={errors.storeName}>
          <Input id="s-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} aria-invalid={!!errors.storeName} />
        </Field>
        <Field label="Support phone" htmlFor="s-phone">
          <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Delivery inside Dhaka (৳)" htmlFor="s-inside" error={errors.inside}>
            <Input id="s-inside" inputMode="numeric" value={inside} onChange={(e) => setInside(e.target.value)} aria-invalid={!!errors.inside} />
          </Field>
          <Field label="Delivery outside Dhaka (৳)" htmlFor="s-outside" error={errors.outside}>
            <Input id="s-outside" inputMode="numeric" value={outside} onChange={(e) => setOutside(e.target.value)} aria-invalid={!!errors.outside} />
          </Field>
        </div>
        <Field label="Low-stock alert at (units)" htmlFor="s-low" error={errors.lowAt} hint="Sizes with this many units or fewer show as low stock.">
          <Input id="s-low" inputMode="numeric" value={lowAt} onChange={(e) => setLowAt(e.target.value)} aria-invalid={!!errors.lowAt} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Save settings
          </Button>
        </div>
      </form>
    </Card>
  );
}

function DiscountCodes() {
  const db = useDatabase();
  const codes = db.settings.discountCodes;
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('10');
  const [error, setError] = useState('');

  const add = (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    const pct = Number(percent);
    if (!/^[A-Z0-9]{3,16}$/.test(value)) return setError('Use 3–16 letters or numbers.');
    if (codes.some((c) => c.code === value)) return setError('This code already exists.');
    if (!Number.isInteger(pct) || pct < 1 || pct > 90) return setError('Discount must be 1–90%.');
    actions.saveDiscountCodes([...codes, { code: value, percent: pct, active: true }]);
    setCode('');
    setError('');
    toast(`${value} added`);
  };

  return (
    <Card title="Discount codes" bodyClass="p-0">
      <ul className="divide-y divide-line">
        {codes.map((c) => (
          <li key={c.code} className="flex items-center gap-3 px-5 py-3 text-sm">
            <span className="rounded-md bg-sunken px-2 py-1 font-mono text-xs font-semibold">{c.code}</span>
            <span className="flex-1 text-ink-2">{c.percent}% off</span>
            <label className="relative inline-flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" role="switch" checked={c.active} onChange={() => actions.saveDiscountCodes(codes.map((x) => (x.code === c.code ? { ...x, active: !x.active } : x)))} className="peer sr-only" aria-label={`${c.code} active`} />
              <span className="relative h-5 w-9 rounded-full bg-line transition peer-checked:bg-good peer-focus-visible:ring-2 peer-focus-visible:ring-brand after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
              {c.active ? 'Active' : 'Off'}
            </label>
            <Button variant="ghost" size="sm" onClick={() => actions.saveDiscountCodes(codes.filter((x) => x.code !== c.code))} aria-label={`Delete ${c.code}`}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} noValidate className="flex flex-wrap items-end gap-2 border-t border-line px-5 py-4">
        <div className="min-w-32 flex-1">
          <Field label="New code" htmlFor="d-code" error={error}>
            <Input id="d-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. PUJA10" aria-invalid={!!error} />
          </Field>
        </div>
        <div className="w-24">
          <Field label="% off" htmlFor="d-pct">
            <Input id="d-pct" inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" className={error ? 'mb-6' : ''}>
          <Plus className="size-4" aria-hidden /> Add
        </Button>
      </form>
    </Card>
  );
}
