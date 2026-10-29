import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Shell } from '../components/layout/Shell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { Select } from '../components/ui/Field';
import { SearchInput } from '../components/ui/SearchInput';
import { toast } from '../components/ui/Toast';
import { CATEGORY_LABEL } from '../data/labels';
import { actions, useDatabase } from '../data/store';
import type { Category, Product } from '../data/types';
import { totalStock } from '../lib/analytics';
import { taka } from '../lib/format';
import { ProductForm } from './ProductForm';

export function Products() {
  const db = useDatabase();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const term = search.trim().toLowerCase();
  const rows = db.products.filter((p) => (category === 'all' || p.category === category) && (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)));

  return (
    <Shell
      title="Products"
      actions={
        <Button variant="primary" onClick={() => setEditing('new')} className="ml-auto">
          <Plus className="size-4" aria-hidden /> Add product
        </Button>
      }
    >
      <Card
        bodyClass="p-0"
        title={
          <div className="flex flex-wrap gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Name or SKU" label="Search products" />
            <Select value={category} onChange={(e) => setCategory(e.target.value as Category | 'all')} aria-label="Category" className="w-auto!">
              <option value="all">All categories</option>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </div>
        }
        action={<span className="text-xs text-ink-3">{rows.length} products</span>}
      >
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-3">No products match.</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sunken text-xs text-ink-2">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Product</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 text-right font-medium">Price</th>
                  <th className="px-5 py-2.5 text-right font-medium">In stock</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const units = totalStock(p);
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt="" className="size-12 rounded-lg bg-sunken object-cover" />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-ink-3">
                              {p.sku} · {p.colour}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-2">{CATEGORY_LABEL[p.category]}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        <span className="font-semibold">{taka(p.price)}</span>
                        {p.oldPrice && <s className="ml-1.5 text-xs text-ink-3">{taka(p.oldPrice)}</s>}
                      </td>
                      <td className={`px-5 py-3 text-right tabular-nums ${units === 0 ? 'font-semibold text-critical' : ''}`}>{units === 0 ? 'Sold out' : units}</td>
                      <td className="px-5 py-3">
                        <label className="relative inline-flex cursor-pointer items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={p.active}
                            onChange={() => {
                              actions.saveProduct({ ...p, active: !p.active });
                              toast(`${p.name} is now ${p.active ? 'hidden' : 'visible'} in the store`);
                            }}
                            className="peer sr-only"
                            aria-label={`Show ${p.name} in the store`}
                          />
                          <span className="relative h-5 w-9 rounded-full bg-line transition peer-checked:bg-good peer-focus-visible:ring-2 peer-focus-visible:ring-brand after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                          {p.active ? 'Active' : 'Hidden'}
                        </label>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add product' : `Edit ${editing?.name ?? ''}`} wide>
        {editing !== null && (
          <ProductForm
            key={editing === 'new' ? 'new' : editing.id}
            product={editing === 'new' ? null : editing}
            products={db.products}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              actions.saveProduct(p);
              toast(editing === 'new' ? `${p.name} added` : `${p.name} saved`);
              setEditing(null);
            }}
          />
        )}
      </Dialog>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)} title={`Delete ${deleting?.name ?? ''}?`}>
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink-2">The product is removed from the catalogue. Past orders keep their item names.</p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleting(null)}>Keep it</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleting) {
                  actions.deleteProduct(deleting.id);
                  toast(`${deleting.name} deleted`);
                }
                setDeleting(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </Shell>
  );
}
