import { useState, type FormEvent } from 'react';
import { ImageUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { CATEGORY_LABEL } from '../data/labels';
import { SIZES_BY_CATEGORY } from '../data/seed';
import type { Category, Product } from '../data/types';
import { resizeImage } from '../lib/image';

const SAMPLE_IMAGES = ['glide-knit-runner', 'aero-mesh-trainer', 'wave-street-runner', 'classic-straight-jeans', 'tapered-indigo-jeans', 'floral-garden-dress', 'golden-check-lehenga', 'princess-satin-gown'].map((n) => `products/${n}.jpg`);

const SKU_PREFIX: Record<Category, string> = { sneakers: 'SNK', jeans: 'JNS', women: 'WMN', kids: 'KID' };

function nextSku(category: Category, products: Product[]): string {
  const prefix = `ZV-${SKU_PREFIX[category]}-`;
  const numbers = products.filter((p) => p.sku.startsWith(prefix)).map((p) => Number(p.sku.slice(prefix.length)) || 0);
  return `${prefix}${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
}

type Errors = Partial<Record<'name' | 'sku' | 'price' | 'oldPrice' | 'image' | 'colour', string>>;

export function ProductForm({ product, products, onSave, onCancel }: { product: Product | null; products: Product[]; onSave: (p: Product) => void; onCancel: () => void }) {
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? 'sneakers');
  const [sku, setSku] = useState(product?.sku ?? nextSku('sneakers', products));
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [oldPrice, setOldPrice] = useState(product?.oldPrice ? String(product.oldPrice) : '');
  const [colour, setColour] = useState(product?.colour ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [active, setActive] = useState(product?.active ?? true);
  const [stock, setStock] = useState<Record<string, string>>(() =>
    Object.fromEntries(SIZES_BY_CATEGORY[product?.category ?? 'sneakers'].map((s) => [s, String(product?.stock[s] ?? 0)])),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [uploading, setUploading] = useState(false);

  const changeCategory = (c: Category) => {
    setCategory(c);
    setStock(Object.fromEntries(SIZES_BY_CATEGORY[c].map((s) => [s, stock[s] ?? '0'])));
    if (!product) setSku(nextSku(c, products));
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      setImage(await resizeImage(file));
      setErrors((e) => ({ ...e, image: undefined }));
    } catch (err) {
      setErrors((e) => ({ ...e, image: (err as Error).message }));
    }
    setUploading(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    const priceValue = Number(price);
    const oldValue = oldPrice.trim() ? Number(oldPrice) : undefined;
    if (name.trim().length < 2) found.name = 'Enter a product name.';
    if (!/^[A-Z0-9-]{3,20}$/i.test(sku.trim())) found.sku = 'Use 3–20 letters, numbers or dashes.';
    else if (products.some((p) => p.sku.toLowerCase() === sku.trim().toLowerCase() && p.id !== product?.id)) found.sku = 'Another product already uses this SKU.';
    if (!Number.isFinite(priceValue) || priceValue <= 0) found.price = 'Enter a price above 0.';
    if (oldValue !== undefined && (!Number.isFinite(oldValue) || oldValue <= priceValue)) found.oldPrice = 'The old price must be higher than the price.';
    if (!colour.trim()) found.colour = 'Enter a colour.';
    if (!image) found.image = 'Choose a photo.';
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`product-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    let id = product?.id ?? slug(name);
    if (!product) while (products.some((p) => p.id === id)) id = `${slug(name)}-${Math.floor(Math.random() * 1000)}`;
    onSave({
      id,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      price: Math.round(priceValue),
      ...(oldValue ? { oldPrice: Math.round(oldValue) } : {}),
      colour: colour.trim(),
      description: description.trim(),
      image,
      stock: Object.fromEntries(Object.entries(stock).map(([s, v]) => [s, Math.max(0, Math.round(Number(v)) || 0)])),
      active,
      createdAt: product?.createdAt ?? new Date().toISOString(),
    });
  };

  const invalid = (key: keyof Errors) => ({ 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `product-${key}-error` : undefined });

  return (
    <form onSubmit={submit} noValidate className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Product name" htmlFor="product-name" error={errors.name}>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} {...invalid('name')} />
          </Field>
        </div>
        <Field label="Category" htmlFor="product-category">
          <Select id="product-category" value={category} onChange={(e) => changeCategory(e.target.value as Category)}>
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="SKU" htmlFor="product-sku" error={errors.sku}>
          <Input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} {...invalid('sku')} />
        </Field>
        <Field label="Price (৳)" htmlFor="product-price" error={errors.price}>
          <Input id="product-price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} {...invalid('price')} />
        </Field>
        <Field label="Old price (৳)" htmlFor="product-oldPrice" error={errors.oldPrice} hint="Optional — shows the product as on sale.">
          <Input id="product-oldPrice" inputMode="numeric" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} {...invalid('oldPrice')} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Colour" htmlFor="product-colour" error={errors.colour}>
            <Input id="product-colour" value={colour} onChange={(e) => setColour(e.target.value)} placeholder="e.g. Black / Grey" {...invalid('colour')} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="product-description">
            <Textarea id="product-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Photo</legend>
        <div className="flex flex-wrap items-center gap-2">
          {[...(image && !SAMPLE_IMAGES.includes(image) ? [image] : []), ...SAMPLE_IMAGES].map((src) => (
            <button
              key={src.slice(0, 80)}
              type="button"
              onClick={() => setImage(src)}
              aria-pressed={image === src}
              aria-label={src.startsWith('data:') ? 'Uploaded photo' : `Sample photo ${src.replace(/^products\/|\.jpg$/g, '').replace(/-/g, ' ')}`}
              className={`size-14 overflow-hidden rounded-lg ring-2 ${image === src ? 'ring-brand' : 'ring-transparent hover:ring-line'}`}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
          <label className="flex h-14 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-sm text-ink-2 hover:bg-sunken">
            <ImageUp className="size-4" aria-hidden /> {uploading ? 'Reading…' : 'Upload'}
            <input id="product-image" type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
        {errors.image && (
          <p id="product-image-error" className="mt-1.5 text-xs text-critical">
            {errors.image}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Stock per size</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {Object.keys(stock).map((s) => (
            <label key={s} className="text-xs text-ink-2">
              {s}
              <Input inputMode="numeric" value={stock[s]} onChange={(e) => setStock({ ...stock, [s]: e.target.value.replace(/\D/g, '') })} className="mt-1 text-center" aria-label={`Stock for size ${s}`} />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
        Show this product in the store
      </label>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-line bg-panel px-5 py-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          {product ? 'Save changes' : 'Add product'}
        </Button>
      </div>
    </form>
  );
}
