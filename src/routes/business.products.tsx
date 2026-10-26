import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";
import { BusinessShell, StatusBadge } from "@/components/BusinessShell";
import { ProductThumb } from "@/components/FruitThumb";
import { api, type Fruit, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/products")({ head: () => ({ meta: [{ title: "Sản phẩm — Golden Time Business" }] }), component: Products });

type ProductDraft = { fruitId: number | null; displayName: string; seasonal: boolean; prepared: boolean; pricePerKg: string; stockKg: string; onSale: boolean; imageUrl: string };
const emptyDraft = (): ProductDraft => ({ fruitId: null, displayName: "", seasonal: false, prepared: false, pricePerKg: "", stockKg: "", onSale: true, imageUrl: "" });

function originLabel(category?: string | null) {
  const value = (category ?? "").toLocaleLowerCase("vi");
  if (value.includes("nhập khẩu") || value.includes("import")) return "Trái cây nhập khẩu";
  if (value.includes("nội địa") || value.includes("việt nam") || value.includes("local")) return "Trái cây Việt Nam";
  return category || "Chưa phân loại";
}

function statusLabel(status: string) {
  return ({ ON_SALE: "Đang bán", OUT_OF_STOCK: "Hết hàng", HIDDEN: "Đã ẩn", LOW_STOCK: "Sắp hết" } as Record<string, string>)[status] ?? status;
}

function Products() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [productList, fruitList] = await Promise.all([api.shopProducts(), api.fruits()]);
      setProducts(productList);
      setFruits(fruitList);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function beginCreate() {
    const firstFruit = fruits[0];
    setEditingId(null);
    setDraft({ ...emptyDraft(), fruitId: firstFruit?.id ?? null, displayName: firstFruit?.name ?? "" });
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function beginEdit(product: ShopProduct) {
    setEditingId(product.id);
    setDraft({ fruitId: product.fruitId, displayName: product.displayName, seasonal: product.seasonal, prepared: product.prepared, pricePerKg: String(product.pricePerKg), stockKg: String(product.stockKg), onSale: product.status !== "HIDDEN", imageUrl: product.imageUrl ?? "" });
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const image = await api.uploadShopProductImage(file);
      setDraft((current) => ({ ...current, imageUrl: image.url }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được ảnh sản phẩm.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.fruitId) return setError("Hãy chọn loại trái cây.");
    if (!draft.imageUrl) return setError("Hãy tải ảnh sản phẩm lên trước khi lưu.");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { fruitId: draft.fruitId, displayName: draft.displayName.trim(), seasonal: draft.seasonal, prepared: draft.prepared, pricePerKg: Number(draft.pricePerKg), stockKg: Number(draft.stockKg), onSale: draft.onSale, imageUrl: draft.imageUrl };
      const saved = editingId === null ? await api.createShopProduct(payload) : await api.updateShopProduct(editingId, payload);
      setProducts((current) => [saved, ...current.filter((product) => product.id !== saved.id)]);
      setFormOpen(false);
      setNotice(editingId === null ? "Đã đăng sản phẩm. Khách có thể mua nếu cửa hàng đang hoạt động và còn hàng." : "Đã cập nhật sản phẩm.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được sản phẩm.");
    } finally { setSaving(false); }
  }

  async function toggleVisibility(product: ShopProduct) {
    const onSale = product.status === "HIDDEN";
    if (!product.imageUrl) return beginEdit(product);
    try {
      const saved = await api.updateShopProduct(product.id, { fruitId: product.fruitId, displayName: product.displayName, seasonal: product.seasonal, prepared: product.prepared, pricePerKg: product.pricePerKg, stockKg: Number(product.stockKg), onSale, imageUrl: product.imageUrl });
      setProducts((current) => current.map((item) => item.id === saved.id ? saved : item));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không đổi được trạng thái bán."); }
  }

  const actions = <button type="button" onClick={beginCreate} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white gt-shadow"><Plus className="h-4 w-4" /> Thêm sản phẩm</button>;
  return <BusinessShell title="Sản phẩm cửa hàng" subtitle={`${products.length} sản phẩm trong dữ liệu cửa hàng`} actions={actions}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

    {formOpen && <form onSubmit={saveProduct} className="mb-5 rounded-2xl border border-border bg-white p-4 sm:p-6 gt-shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-bold">{editingId === null ? "Thêm sản phẩm mới" : "Sửa sản phẩm"}</h2><p className="mt-1 text-xs text-muted-foreground">Sản phẩm có ảnh, giá và tồn kho sẽ hiển thị cho khách khi cửa hàng hoạt động.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Đóng biểu mẫu" className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
        <div className="grid gap-3 sm:grid-cols-2 content-start">
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Loại trái cây</span><select required value={draft.fruitId ?? ""} onChange={(event) => { const fruitId = Number(event.target.value); const fruit = fruits.find((item) => item.id === fruitId); setDraft((current) => ({ ...current, fruitId, displayName: fruit?.name ?? current.displayName })); }} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"><option value="" disabled>Chọn loại trái cây</option>{fruits.map((fruit) => <option key={fruit.id} value={fruit.id}>{fruit.emoji} {fruit.name}</option>)}</select><span className="mt-1 block text-[10px] text-muted-foreground">Nhóm nguồn gốc: {originLabel(fruits.find((fruit) => fruit.id === draft.fruitId)?.category)}</span></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tên hiển thị</span><input required maxLength={255} value={draft.displayName} onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))} placeholder="Ví dụ: Táo Fuji New Zealand" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm"><input type="checkbox" checked={draft.seasonal} onChange={(event) => setDraft((current) => ({ ...current, seasonal: event.target.checked }))} className="h-4 w-4 accent-primary" />Trái cây theo mùa</label>
          <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm"><input type="checkbox" checked={draft.prepared} onChange={(event) => setDraft((current) => ({ ...current, prepared: event.target.checked }))} className="h-4 w-4 accent-primary" />Trái cây sơ chế</label>
          <p className="-mt-2 text-[10px] text-muted-foreground sm:col-span-2">Cập nhật mục “Theo mùa” khi mùa vụ thay đổi. Sản phẩm có thể vừa theo mùa vừa sơ chế.</p>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Giá bán / kg (đ)</span><input required type="number" min="1" step="1" value={draft.pricePerKg} onChange={(event) => setDraft((current) => ({ ...current, pricePerKg: event.target.value }))} placeholder="49000" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tồn kho (kg)</span><input required type="number" min="0" max="99999999.99" step="0.01" value={draft.stockKg} onChange={(event) => setDraft((current) => ({ ...current, stockKg: event.target.value }))} placeholder="10" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="flex items-center gap-2 self-end rounded-xl border border-border px-3 py-3 text-sm sm:col-span-2"><input type="checkbox" checked={draft.onSale} onChange={(event) => setDraft((current) => ({ ...current, onSale: event.target.checked }))} className="h-4 w-4 accent-primary" />Cho phép khách mua sản phẩm này</label>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Ảnh sản phẩm</p>
          <ProductThumb emoji={fruits.find((item) => item.id === draft.fruitId)?.emoji ?? "🍎"} imageUrl={draft.imageUrl} size="md" alt={draft.displayName} className="mt-1 !h-36 !w-full !rounded-xl bg-muted object-cover" />
          <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
          <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-60"><ImagePlus className="h-4 w-4" />{uploadingImage ? "Đang tải ảnh…" : draft.imageUrl ? "Đổi ảnh" : "Tải ảnh lên"}</button>
          <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG hoặc WebP · tối đa 10 MB</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">Hủy</button><button type="submit" disabled={saving || uploadingImage || !draft.imageUrl} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button></div>
    </form>}

    <div className="overflow-x-auto rounded-2xl border border-border bg-white gt-shadow-soft"><table className="w-full min-w-[820px] text-sm"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="p-3 text-left">Sản phẩm</th><th className="p-3 text-left">Loại</th><th className="p-3 text-right">Giá / kg</th><th className="p-3 text-right">Tồn (kg)</th><th className="p-3 text-left">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-border">
      {products.map((product) => <tr key={product.id}><td className="p-3"><div className="flex items-center gap-3"><ProductThumb emoji={product.emoji} imageUrl={product.imageUrl} size="sm" alt={product.displayName} /><span className="font-semibold">{product.displayName}</span></div></td><td className="p-3"><span>{originLabel(product.category)}</span>{(product.seasonal || product.prepared) && <div className="mt-1 flex gap-1">{product.seasonal && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-800">Theo mùa</span>}{product.prepared && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-800">Sơ chế</span>}</div>}</td><td className="p-3 text-right font-bold">{product.pricePerKg.toLocaleString("vi-VN")}đ</td><td className="p-3 text-right">{Number(product.stockKg).toLocaleString("vi-VN")}</td><td className="p-3"><StatusBadge status={statusLabel(product.status)} /></td><td className="p-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => beginEdit(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold"><Pencil className="h-3 w-3" /> Sửa</button><button type="button" onClick={() => void toggleVisibility(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold">{product.status === "HIDDEN" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{product.status === "HIDDEN" ? "Bật bán" : "Ẩn"}</button></div></td></tr>)}
      {!loading && products.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Cửa hàng chưa có sản phẩm. Bấm “Thêm sản phẩm” để bắt đầu đăng bán.</td></tr>}
      {loading && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground"><LoaderCircle className="mx-auto h-5 w-5 animate-spin" /></td></tr>}
    </tbody></table></div>
  </BusinessShell>;
}
