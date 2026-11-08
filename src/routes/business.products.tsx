import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";
import { BusinessShell, StatusBadge } from "@/components/BusinessShell";
import { ProductThumb } from "@/components/FruitThumb";
import { api, type Farm, type Fruit, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/products")({ head: () => ({ meta: [{ title: "Sản phẩm — Golden Time Business" }] }), component: Products });

type ProductCategory = "LOCAL" | "IMPORTED" | "SEASONAL" | "PREPARED";
type ProductDraft = { fruitId: number | null; category: ProductCategory; displayName: string; pricePerKg: string; stockKg: string; farmId: string; orderDate: string; transportDays: string; receivedDate: string; evidenceImageUrl: string; imageUrls: string[] };
const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "LOCAL", label: "Trái cây Việt Nam" },
  { value: "IMPORTED", label: "Trái cây nhập khẩu" },
  { value: "SEASONAL", label: "Trái cây theo mùa" },
  { value: "PREPARED", label: "Trái cây sơ chế" },
];
const emptyDraft = (): ProductDraft => ({ fruitId: null, category: "LOCAL", displayName: "", pricePerKg: "", stockKg: "", farmId: "", orderDate: "", transportDays: "", receivedDate: "", evidenceImageUrl: "", imageUrls: [] });

function bangkokDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number) {
  if (!date || !Number.isInteger(days)) return "";
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

function displayDate(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

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
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [productList, fruitList, farmList] = await Promise.all([api.shopProducts(), api.fruits(), api.shopFarms()]);
      setProducts(productList);
      setFruits(fruitList);
      setFarms(farmList);
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
    setDraft({ fruitId: product.fruitId, category: productCategory(product), displayName: product.displayName, pricePerKg: String(product.pricePerKg), stockKg: String(product.stockKg), farmId: product.farmId == null ? "" : String(product.farmId), orderDate: product.orderDate ?? "", transportDays: product.orderDate && product.transportDate ? String(Math.max(1, daysBetween(product.orderDate, product.transportDate))) : "", receivedDate: product.receivedDate ?? "", evidenceImageUrl: product.evidenceImageUrl ?? "", imageUrls: product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [] });
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

  async function uploadEvidence(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Ảnh bằng chứng phải là tệp PNG, JPG hoặc WebP."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Ảnh bằng chứng không được vượt quá 10 MB."); return; }
    setUploadingEvidence(true);
    setError("");
    try {
      const image = await api.uploadShopProductTraceabilityEvidence(file);
      setDraft((current) => ({ ...current, evidenceImageUrl: image.url }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được ảnh bằng chứng.");
    } finally {
      setUploadingEvidence(false);
      if (evidenceInputRef.current) evidenceInputRef.current.value = "";
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.displayName.trim()) return setError("Hãy nhập tên sản phẩm.");
    if (!draft.farmId || !farms.some((farm) => farm.id === Number(draft.farmId) && farm.status === "APPROVED")) return setError("Hãy chọn nông trại đã được admin xác minh.");
    const today = bangkokDate();
    const transportDays = Number(draft.transportDays);
    if (!draft.orderDate || !draft.transportDays || !draft.receivedDate) return setError("Hãy nhập đủ ngày đặt hàng, thời gian vận chuyển và ngày nhận hàng.");
    if (draft.orderDate >= today) return setError("Ngày đặt hàng phải nằm trong quá khứ.");
    if (!Number.isInteger(transportDays) || transportDays < 1 || transportDays > 3650) return setError("Thời gian vận chuyển phải từ 1 đến 3650 ngày.");
    if (draft.receivedDate > today) return setError("Ngày nhận hàng không được ở tương lai.");
    if (draft.receivedDate < draft.orderDate) return setError("Ngày nhận hàng không thể trước ngày đặt hàng.");
    if (!draft.evidenceImageUrl) return setError("Hãy tải lên một ảnh giấy tờ hoặc thông tin chứng minh để admin kiểm chứng.");
    if (!draft.imageUrls.length) return setError("Hãy tải ít nhất một ảnh sản phẩm lên trước khi lưu.");
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { fruitId: fruitIdForName(draft.displayName, fruits) ?? draft.fruitId, category: draft.category, displayName: draft.displayName.trim(), pricePerKg: Number(draft.pricePerKg), stockKg: Number(draft.stockKg), onSale: true, farmId: Number(draft.farmId), orderDate: draft.orderDate, transportDays, receivedDate: draft.receivedDate, evidenceImageUrl: draft.evidenceImageUrl, imageUrl: draft.imageUrls[0], imageUrls: draft.imageUrls };
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

  const today = bangkokDate();
  const estimatedReceivedDate = draft.orderDate && draft.transportDays ? addDays(draft.orderDate, Number(draft.transportDays)) : "";
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
          <div className="sm:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"><h3 className="text-sm font-bold text-emerald-950">Thông tin truy xuất nguồn gốc</h3><p className="mt-1 text-xs text-muted-foreground">Chọn nông trại đã được admin xác minh, nhập hành trình giao nhận và gửi ảnh bằng chứng để admin đối chiếu.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="text-xs font-semibold text-muted-foreground">Nông trại đã được admin xác minh *</span><select required value={draft.farmId} onChange={(event) => setDraft((current) => ({ ...current, farmId: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"><option value="">Chọn nông trại</option>{farms.filter((farm) => farm.status === "APPROVED").map((farm) => <option key={farm.id} value={farm.id}>{farm.name} · {farm.address}</option>)}</select>{!farms.some((farm) => farm.status === "APPROVED") && <span className="mt-1 block text-xs text-amber-800">Bạn chưa có nông trại được xác minh. <Link to="/business/farms" className="font-semibold underline">Khai báo nông trại</Link> và chờ admin duyệt.</span>}</label>
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Ngày đặt hàng *</span><input required type="date" max={addDays(today, -1)} value={draft.orderDate} onChange={(event) => setDraft((current) => ({ ...current, orderDate: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /><span className="mt-1 block text-[10px] text-muted-foreground">Chỉ chọn ngày trước hôm nay.</span></label>
            <div className="block"><label className="text-xs font-semibold text-muted-foreground" htmlFor="product-transport-days">Thời gian vận chuyển (ngày) *</label><div className="mt-1 flex items-center gap-2"><input id="product-transport-days" required type="number" min="1" max="3650" step="1" value={draft.transportDays} onChange={(event) => setDraft((current) => ({ ...current, transportDays: event.target.value }))} placeholder="Ví dụ: 3" className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /></div><span className="mt-1 block text-[10px] text-muted-foreground">{estimatedReceivedDate ? `Dự kiến nhận hàng: ${displayDate(estimatedReceivedDate)}` : "Nhập ngày đặt hàng và số ngày để xem ngày dự kiến nhận."}</span></div>
            <label className="block"><span className="text-xs font-semibold text-muted-foreground">Ngày nhận hàng thực tế *</span><input required type="date" min={draft.orderDate || undefined} max={today} value={draft.receivedDate} onChange={(event) => setDraft((current) => ({ ...current, receivedDate: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm" /><span className="mt-1 block text-[10px] text-muted-foreground">Ngày nhận phải là hôm nay hoặc trước đó.</span></label>
            <div className="block"><span className="text-xs font-semibold text-muted-foreground">Ảnh giấy tờ / bằng chứng * (1 ảnh)</span><input ref={evidenceInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => uploadEvidence(event.target.files?.[0])} /><button type="button" onClick={() => evidenceInputRef.current?.click()} disabled={uploadingEvidence} className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold disabled:opacity-60"><ImagePlus className="h-4 w-4" />{uploadingEvidence ? "Đang tải ảnh…" : draft.evidenceImageUrl ? "Thay ảnh bằng chứng" : "Tải ảnh bằng chứng"}</button><span className="mt-1 block text-[10px] text-muted-foreground">PNG, JPG hoặc WebP · tối đa 10 MB · ảnh sẽ được admin kiểm chứng</span></div>
          </div>{draft.evidenceImageUrl && <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-white p-2"><a href={draft.evidenceImageUrl} target="_blank" rel="noreferrer"><img src={draft.evidenceImageUrl} alt="Ảnh bằng chứng truy xuất nguồn gốc" className="h-16 w-20 rounded-md object-cover" /></a><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-emerald-800">Đã tải ảnh bằng chứng</p><a href={draft.evidenceImageUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Xem ảnh</a></div><button type="button" onClick={() => setDraft((current) => ({ ...current, evidenceImageUrl: "" }))} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label="Xóa ảnh bằng chứng"><X className="h-4 w-4" /></button></div>}{editingId !== null && products.find((product) => product.id === editingId)?.reviewNote && <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs text-amber-900"><strong>Admin yêu cầu bổ sung:</strong> {products.find((product) => product.id === editingId)?.reviewNote}</p>}</div>
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
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">Hủy</button><button type="submit" disabled={saving || uploadingImage || uploadingEvidence || !draft.imageUrls.length || !farms.some((farm) => farm.status === "APPROVED")} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Đang lưu…" : "Lưu sản phẩm"}</button></div>
    </form>}

    <div className="overflow-x-auto rounded-2xl border border-border bg-white gt-shadow-soft"><table className="w-full min-w-[820px] text-sm"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="p-3 text-left">Sản phẩm</th><th className="p-3 text-left">Danh mục</th><th className="p-3 text-right">Giá / kg</th><th className="p-3 text-right">Tồn (kg)</th><th className="p-3 text-left">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-border">
      {products.map((product) => <tr key={product.id}><td className="p-3"><div className="flex items-center gap-3"><ProductThumb emoji={product.emoji} imageUrl={product.imageUrl} size="sm" alt={product.displayName} /><span className="font-semibold">{product.displayName}</span></div></td><td className="p-3">{categoryLabel(product.category)}</td><td className="p-3 text-right font-bold">{product.pricePerKg.toLocaleString("vi-VN")}đ</td><td className="p-3 text-right">{Number(product.stockKg).toLocaleString("vi-VN")}</td><td className="p-3"><StatusBadge status={statusLabel(product.status, product.approvalStatus)} />{product.reviewNote && <p className="mt-1 max-w-48 text-[10px] text-amber-800">{product.reviewNote}</p>}</td><td className="p-3 text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => beginEdit(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold"><Pencil className="h-3 w-3" /> Sửa</button><button type="button" disabled={product.approvalStatus !== "APPROVED"} title={product.approvalStatus !== "APPROVED" ? "Chỉ bật bán sau khi admin duyệt" : undefined} onClick={() => void toggleVisibility(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{product.approvalStatus !== "APPROVED" ? <LoaderCircle className="h-3 w-3" /> : product.status === "HIDDEN" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{product.approvalStatus !== "APPROVED" ? "Chờ duyệt" : product.status === "HIDDEN" ? "Bật bán" : "Ẩn"}</button></div></td></tr>)}
      {!loading && products.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Cửa hàng chưa có sản phẩm. Bấm “Thêm sản phẩm” để bắt đầu đăng bán.</td></tr>}
      {loading && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground"><LoaderCircle className="mx-auto h-5 w-5 animate-spin" /></td></tr>}
    </tbody></table></div>
  </BusinessShell>;
}
