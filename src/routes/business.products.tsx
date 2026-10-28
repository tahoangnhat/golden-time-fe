import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";
import { BusinessShell, StatusBadge } from "@/components/BusinessShell";
import { ProductThumb } from "@/components/FruitThumb";
import { api, type Fruit, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/products")({ head: () => ({ meta: [{ title: "Sản phẩm — Golden Time Business" }] }), component: Products });

type ProductCategory = "LOCAL" | "IMPORTED" | "SEASONAL" | "PREPARED";
type ProductDraft = { fruitId: number | null; category: ProductCategory; displayName: string; pricePerKg: string; stockKg: string; productOrigin: string; supplierName: string; lotCode: string; traceabilityProof: string; imageUrls: string[] };
const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "LOCAL", label: "Trái cây Việt Nam" },
  { value: "IMPORTED", label: "Trái cây nhập khẩu" },
  { value: "SEASONAL", label: "Trái cây theo mùa" },
  { value: "PREPARED", label: "Trái cây sơ chế" },
];
const emptyDraft = (): ProductDraft => ({ fruitId: null, category: "LOCAL", displayName: "", pricePerKg: "", stockKg: "", productOrigin: "", supplierName: "", lotCode: "", traceabilityProof: "", imageUrls: [] });

function originLabel(category?: string | null) {
  const value = (category ?? "").toLocaleLowerCase("vi");
  if (value.includes("nhập khẩu") || value.includes("import")) return "Trái cây nhập khẩu";
  if (value.includes("nội địa") || value.includes("việt nam") || value.includes("local")) return "Trái cây Việt Nam";
  return category || "Chưa phân loại";
}

function productCategory(product: Pick<ShopProduct, "category" | "seasonal" | "prepared">): ProductCategory {
  if (PRODUCT_CATEGORIES.some((item) => item.value === product.category)) return product.category as ProductCategory;
  if (product.prepared) return "PREPARED";
  if (product.seasonal) return "SEASONAL";
  const value = (product.category ?? "").toLocaleLowerCase("vi");
  return value.includes("nhập khẩu") || value.includes("import") ? "IMPORTED" : "LOCAL";
}

function categoryLabel(category?: string | null) {
  return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? originLabel(category);
}

function categoryEmoji(category: ProductCategory) {
  return category === "LOCAL" ? "🥭" : category === "IMPORTED" ? "🍎" : category === "SEASONAL" ? "🍓" : "🍍";
}

function fruitIdForName(name: string, fruits: Fruit[]) {
  const normalizedName = name.trim().toLocaleLowerCase("vi");
  if (!normalizedName) return null;
  return fruits.find((fruit) => {
    const fruitName = fruit.name.trim().toLocaleLowerCase("vi");
    return normalizedName === fruitName || normalizedName.startsWith(`${fruitName} `);
  })?.id ?? null;
}

function statusLabel(status: string, approvalStatus: string) {
  if (approvalStatus === "PENDING_REVIEW") return "Chờ admin duyệt";
  if (approvalStatus === "NEEDS_CORRECTION") return "Cần bổ sung hồ sơ";
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
    setEditingId(null);
    setDraft(emptyDraft());
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  function beginEdit(product: ShopProduct) {
    setEditingId(product.id);
    setDraft({ fruitId: product.fruitId, category: productCategory(product), displayName: product.displayName, pricePerKg: String(product.pricePerKg), stockKg: String(product.stockKg), productOrigin: product.productOrigin ?? "", supplierName: product.supplierName ?? "", lotCode: product.lotCode ?? "", traceabilityProof: product.traceabilityProof ?? "", imageUrls: product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [] });
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  async function uploadImages(files?: FileList | null) {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    if (draft.imageUrls.length + selected.length > 10) { setError("Mỗi sản phẩm có thể lưu tối đa 10 ảnh."); if (imageInputRef.current) imageInputRef.current.value = ""; return; }
    setUploadingImage(true);
    setError("");
    try {
      const images = await Promise.all(selected.map((file) => api.uploadShopProductImage(file)));
      setDraft((current) => ({ ...current, imageUrls: [...current.imageUrls, ...images.map((image) => image.url)] }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được ảnh sản phẩm.");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.displayName.trim()) return setError("Hãy nhập tên sản phẩm.");
    if (!draft.productOrigin.trim()) return setError("Hãy nhập xuất xứ sản phẩm.");
    if (!draft.supplierName.trim()) return setError("Hãy nhập nhà cung cấp hoặc nhà sản xuất.");
    if (!draft.lotCode.trim()) return setError("Hãy nhập mã lô sản phẩm.");
    if (!draft.traceabilityProof.trim()) return setError("Hãy nhập giấy tờ hoặc thông tin chứng minh nguồn gốc.");
    if (!draft.imageUrls.length) return setError("Hãy tải ít nhất một ảnh sản phẩm lên trước khi lưu.");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { fruitId: fruitIdForName(draft.displayName, fruits) ?? draft.fruitId, category: draft.category, displayName: draft.displayName.trim(), pricePerKg: Number(draft.pricePerKg), stockKg: Number(draft.stockKg), onSale: true, productOrigin: draft.productOrigin.trim(), supplierName: draft.supplierName.trim(), lotCode: draft.lotCode.trim(), traceabilityProof: draft.traceabilityProof.trim(), imageUrl: draft.imageUrls[0], imageUrls: draft.imageUrls };
      const saved = editingId === null ? await api.createShopProduct(payload) : await api.updateShopProduct(editingId, payload);
      setProducts((current) => [saved, ...current.filter((product) => product.id !== saved.id)]);
      setFormOpen(false);
      setNotice(saved.approvalStatus === "PENDING_REVIEW" ? "Đã gửi hồ sơ sản phẩm cho admin duyệt. Sản phẩm sẽ được mở bán sau khi được duyệt." : "Đã cập nhật sản phẩm.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được sản phẩm.");
    } finally { setSaving(false); }
  }

  async function toggleVisibility(product: ShopProduct) {
    const onSale = product.status === "HIDDEN";
    if (product.approvalStatus !== "APPROVED") return;
    try {
      const saved = await api.updateShopProductVisibility(product.id, onSale);
      setProducts((current) => current.map((item) => item.id === saved.id ? saved : item));
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không đổi được trạng thái bán."); }
  }

  const actions = <button type="button" onClick={beginCreate} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white gt-shadow"><Plus className="h-4 w-4" /> Thêm sản phẩm</button>;
  return <BusinessShell title="Sản phẩm cửa hàng" subtitle={`${products.length} sản phẩm trong dữ liệu cửa hàng`} actions={actions}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

    {formOpen && <form onSubmit={saveProduct} className="mb-5 rounded-2xl border border-border bg-white p-4 sm:p-6 gt-shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-bold">{editingId === null ? "Thêm sản phẩm mới" : "Sửa sản phẩm"}</h2><p className="mt-1 text-xs text-muted-foreground">Sản phẩm mới hoặc vừa chỉnh sửa sẽ chờ admin duyệt trước khi được mở bán.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Đóng biểu mẫu" className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
        <div className="grid gap-3 sm:grid-cols-2 content-start">
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Danh mục sản phẩm</span><select required value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as ProductCategory }))} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm">{PRODUCT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select><span className="mt-1 block text-[10px] text-muted-foreground">Chọn danh mục để khách lọc sản phẩm; nhập tên cụ thể ở ô bên cạnh.</span></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tên hiển thị</span><input required maxLength={255} value={draft.displayName} onChange={(event) => { const displayName = event.target.value; setDraft((current) => ({ ...current, displayName, fruitId: fruitIdForName(displayName, fruits) })); }} placeholder="Ví dụ: Xoài cát Hòa Lộc, Táo Fuji New Zealand" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Giá bán / kg (đ)</span><input required type="number" min="1" step="1" value={draft.pricePerKg} onChange={(event) => setDraft((current) => ({ ...current, pricePerKg: event.target.value }))} placeholder="49000" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tồn kho (kg)</span><input required type="number" min="0" max="99999999.99" step="0.01" value={draft.stockKg} onChange={(event) => setDraft((current) => ({ ...current, stockKg: event.target.value }))} placeholder="10" className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <div className="sm:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><h3 className="text-sm font-bold text-emerald-950">Thông tin truy xuất nguồn gốc</h3><p className="mt-1 text-xs text-muted-foreground">Các thông tin này được gửi cho admin kiểm tra trước khi sản phẩm được bán.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Xuất xứ *</span><input required maxLength={512} value={draft.productOrigin} onChange={(event) => setDraft((current) => ({ ...current, productOrigin: event.target.value }))} placeholder="Ví dụ: Hòa Lộc, Tiền Giang" className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Nhà cung cấp / nhà sản xuất *</span><input required maxLength={255} value={draft.supplierName} onChange={(event) => setDraft((current) => ({ ...current, supplierName: event.target.value }))} placeholder="Tên đơn vị cung cấp hoặc nhà vườn" className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Mã lô *</span><input required maxLength={128} value={draft.lotCode} onChange={(event) => setDraft((current) => ({ ...current, lotCode: event.target.value }))} placeholder="Ví dụ: XOAI-2026-1029" className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /></label>
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Giấy tờ / thông tin chứng minh *</span><textarea required maxLength={4000} rows={2} value={draft.traceabilityProof} onChange={(event) => setDraft((current) => ({ ...current, traceabilityProof: event.target.value }))} placeholder="Số chứng nhận, giấy kiểm định hoặc đường dẫn hồ sơ" className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" /></label>
          </div>{editingId !== null && products.find((product) => product.id === editingId)?.reviewNote && <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs text-amber-900"><strong>Admin yêu cầu bổ sung:</strong> {products.find((product) => product.id === editingId)?.reviewNote}</p>}</div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Ảnh sản phẩm</p>
          <ProductThumb emoji={categoryEmoji(draft.category)} imageUrl={draft.imageUrls[0]} size="md" alt={draft.displayName} className="mt-1 !h-36 !w-full !rounded-xl bg-muted object-cover" />
          <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(event) => uploadImages(event.target.files)} />
          <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-60"><ImagePlus className="h-4 w-4" />{uploadingImage ? "Đang tải ảnh…" : "Tải nhiều ảnh lên"}</button>
          <p className="mt-1 text-[10px] text-muted-foreground">Chọn nhiều ảnh cùng lúc · PNG, JPG hoặc WebP · tối đa 10 MB/ảnh</p>
          {!!draft.imageUrls.length && <div className="mt-3 grid grid-cols-4 gap-2">{draft.imageUrls.map((imageUrl, index) => <div key={`${imageUrl}-${index}`} className="relative"><img src={imageUrl} alt={`Ảnh sản phẩm ${index + 1}`} className="h-14 w-full rounded-lg border border-border object-cover" /><button type="button" aria-label={`Xóa ảnh ${index + 1}`} onClick={() => setDraft((current) => ({ ...current, imageUrls: current.imageUrls.filter((_, imageIndex) => imageIndex !== index) }))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-red-700 shadow"><X className="h-3 w-3" /></button></div>)}</div>}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">Hủy</button><button type="submit" disabled={saving || uploadingImage || !draft.imageUrls.length} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button></div>
    </form>}

    <div className="overflow-x-auto rounded-2xl border border-border bg-white gt-shadow-soft"><table className="w-full min-w-[820px] text-sm"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="p-3 text-left">Sản phẩm</th><th className="p-3 text-left">Danh mục</th><th className="p-3 text-right">Giá / kg</th><th className="p-3 text-right">Tồn (kg)</th><th className="p-3 text-left">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-border">
      {products.map((product) => <tr key={product.id}><td className="p-3"><div className="flex items-center gap-3"><ProductThumb emoji={product.emoji} imageUrl={product.imageUrl} size="sm" alt={product.displayName} /><span className="font-semibold">{product.displayName}</span></div></td><td className="p-3">{categoryLabel(product.category)}</td><td className="p-3 text-right font-bold">{product.pricePerKg.toLocaleString("vi-VN")}đ</td><td className="p-3 text-right">{Number(product.stockKg).toLocaleString("vi-VN")}</td><td className="p-3"><StatusBadge status={statusLabel(product.status, product.approvalStatus)} />{product.reviewNote && <p className="mt-1 max-w-48 text-[10px] text-amber-800">{product.reviewNote}</p>}</td><td className="p-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => beginEdit(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold"><Pencil className="h-3 w-3" /> Sửa</button><button type="button" disabled={product.approvalStatus !== "APPROVED"} title={product.approvalStatus !== "APPROVED" ? "Chỉ bật bán sau khi admin duyệt" : undefined} onClick={() => void toggleVisibility(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{product.approvalStatus !== "APPROVED" ? <LoaderCircle className="h-3 w-3" /> : product.status === "HIDDEN" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{product.approvalStatus !== "APPROVED" ? "Chờ duyệt" : product.status === "HIDDEN" ? "Bật bán" : "Ẩn"}</button></div></td></tr>)}
      {!loading && products.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Cửa hàng chưa có sản phẩm. Bấm “Thêm sản phẩm” để bắt đầu đăng bán.</td></tr>}
      {loading && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground"><LoaderCircle className="mx-auto h-5 w-5 animate-spin" /></td></tr>}
    </tbody></table></div>
  </BusinessShell>;
}
