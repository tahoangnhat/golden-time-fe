import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle, Pencil, Plus, QrCode, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type BatchWritePayload, type Farm, type ShopBatch, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/traceability")({ head: () => ({ meta: [{ title: "Quản lý lô trái cây — Golden Time Business" }] }), component: Traceability });

type Draft = { productId: string; farmId: string; quantityKg: string; harvestDate: string; packagingDate: string; qualityCheckedAt: string; qualityResult: string; qualityScore: string; qualityNote: string; transportDate: string; transportInfo: string; batchStatus: string };
const emptyDraft = (): Draft => ({ productId: "", farmId: "", quantityKg: "", harvestDate: "", packagingDate: "", qualityCheckedAt: "", qualityResult: "", qualityScore: "", qualityNote: "", transportDate: "", transportInfo: "", batchStatus: "IN_PROGRESS" });
const batchStatusLabel: Record<string, string> = { IN_PROGRESS: "Đang hoàn thiện", READY: "Sẵn sàng bán", IN_TRANSIT: "Đang vận chuyển", DELIVERED: "Đã giao", RECALLED: "Thu hồi" };

function Traceability() {
  const [batches, setBatches] = useState<ShopBatch[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const approvedFarms = farms.filter((farm) => farm.status === "APPROVED");
  useEffect(() => {
    Promise.all([api.shopBatches(), api.shopFarms(), api.shopProducts()]).then(([batchRows, farmRows, productRows]) => {
      setBatches(batchRows); setFarms(farmRows); setProducts(productRows);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu lô hàng."));
  }, []);
  function create() {
    setEditingCode(null); setDraft({ ...emptyDraft(), productId: products[0] ? String(products[0].id) : "", farmId: approvedFarms[0] ? String(approvedFarms[0].id) : "" });
    setError(""); setNotice(""); setFormOpen(true);
  }
  function edit(batch: ShopBatch) {
    setEditingCode(batch.batchCode);
    setDraft({ productId: String(batch.productId ?? ""), farmId: String(batch.farmId ?? ""), quantityKg: batch.quantityKg == null ? "" : String(batch.quantityKg),
      harvestDate: batch.harvestDate ?? "", packagingDate: batch.packagingDate ?? "", qualityCheckedAt: batch.qualityCheckedAt ?? "",
      qualityResult: batch.qualityResult ?? "", qualityScore: batch.qualityScore == null ? "" : String(batch.qualityScore),
      qualityNote: batch.qualityNote ?? "", transportDate: batch.transportDate ?? "", transportInfo: batch.transportInfo ?? "", batchStatus: batch.batchStatus });
    setError(""); setNotice(""); setFormOpen(true);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const optional = (value: string) => value.trim() || undefined;
    const payload: BatchWritePayload = { productId: Number(draft.productId), farmId: Number(draft.farmId), quantityKg: Number(draft.quantityKg),
      harvestDate: optional(draft.harvestDate), packagingDate: optional(draft.packagingDate), qualityCheckedAt: optional(draft.qualityCheckedAt),
      qualityResult: optional(draft.qualityResult), qualityScore: draft.qualityScore ? Number(draft.qualityScore) : undefined,
      qualityNote: optional(draft.qualityNote), transportDate: optional(draft.transportDate), transportInfo: optional(draft.transportInfo), batchStatus: draft.batchStatus };
    try {
      const saved = editingCode ? await api.updateBatch(editingCode, payload) : await api.createBatch(payload);
      setBatches((current) => [saved, ...current.filter((batch) => batch.batchCode !== saved.batchCode)]);
      setFormOpen(false); setNotice(editingCode ? "Đã cập nhật thông tin lô và timeline." : "Đã tạo lô hàng cùng mã QR truy xuất duy nhất.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không lưu được lô hàng."); }
    finally { setBusy(false); }
  }
  function qrUrl(code: string) {
    const traceUrl = `${window.location.origin}/trace?batchCode=${encodeURIComponent(code)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(traceUrl)}`;
  }
  const actions = <button disabled={!products.length || !approvedFarms.length} onClick={create} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Tạo lô mới</button>;
  return <BusinessShell title="Lô trái cây & truy xuất" subtitle="Mỗi lô liên kết với một sản phẩm và nông trại đã xác minh." actions={actions}>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {!approvedFarms.length && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Cần có nông trại đã xác minh trước khi tạo lô. <Link to="/business/farms" className="font-bold underline">Quản lý nông trại</Link></p>}
    {!products.length && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Thêm sản phẩm trước khi tạo lô.</p>}
    {formOpen && <form onSubmit={save} className="mb-5 rounded-2xl border border-border bg-white p-5 gt-shadow-soft">
      <div className="mb-4 flex items-start justify-between"><div><h2 className="font-bold">{editingCode ? `Cập nhật lô ${editingCode}` : "Tạo lô trái cây"}</h2><p className="mt-1 text-xs text-muted-foreground">Mã Batch được tạo tự động và dùng làm định danh QR công khai.</p></div><button type="button" aria-label="Đóng" onClick={() => setFormOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block"><span className="text-xs font-semibold">Sản phẩm</span><select required value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm">{products.map((product) => <option key={product.id} value={product.id}>{product.displayName}</option>)}</select></label>
        <label className="block"><span className="text-xs font-semibold">Nông trại đã xác minh</span><select required value={draft.farmId} onChange={(e) => setDraft({ ...draft, farmId: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm">{approvedFarms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}</select></label>
        <label className="block"><span className="text-xs font-semibold">Số lượng (kg)</span><input required type="number" min="0.01" step="0.01" value={draft.quantityKg} onChange={(e) => setDraft({ ...draft, quantityKg: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Ngày thu hoạch</span><input type="date" value={draft.harvestDate} onChange={(e) => setDraft({ ...draft, harvestDate: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Ngày đóng gói</span><input type="date" value={draft.packagingDate} onChange={(e) => setDraft({ ...draft, packagingDate: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Trạng thái lô</span><select value={draft.batchStatus} onChange={(e) => setDraft({ ...draft, batchStatus: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm">{Object.entries(batchStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block"><span className="text-xs font-semibold">Ngày kiểm định</span><input type="date" value={draft.qualityCheckedAt} onChange={(e) => setDraft({ ...draft, qualityCheckedAt: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Kết quả kiểm định</span><input maxLength={64} value={draft.qualityResult} onChange={(e) => setDraft({ ...draft, qualityResult: e.target.value })} placeholder="Đạt / Cần theo dõi…" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Điểm chất lượng (0–100)</span><input type="number" min="0" max="100" value={draft.qualityScore} onChange={(e) => setDraft({ ...draft, qualityScore: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block sm:col-span-2 lg:col-span-3"><span className="text-xs font-semibold">Ghi chú kiểm định</span><textarea rows={2} maxLength={2000} value={draft.qualityNote} onChange={(e) => setDraft({ ...draft, qualityNote: e.target.value })} className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Ngày vận chuyển</span><input type="date" value={draft.transportDate} onChange={(e) => setDraft({ ...draft, transportDate: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block sm:col-span-2"><span className="text-xs font-semibold">Thông tin vận chuyển</span><input maxLength={2000} value={draft.transportInfo} onChange={(e) => setDraft({ ...draft, transportInfo: e.target.value })} placeholder="Đơn vị, phương tiện, điều kiện bảo quản…" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
      </div>
      <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{busy ? "Đang lưu…" : "Lưu lô hàng"}</button>
    </form>}
    <div className="space-y-4">{batches.map((batch) => <article key={batch.batchCode} className="grid gap-4 rounded-2xl border border-border bg-white p-5 gt-shadow-soft md:grid-cols-[1fr_160px]">
      <div><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-extrabold">{batch.product}</h2><p className="mt-1 font-mono text-xs text-muted-foreground">Mã Batch: {batch.batchCode}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{batchStatusLabel[batch.batchStatus] ?? batch.batchStatus}</span></div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3"><div><dt className="text-xs text-muted-foreground">Nông trại</dt><dd>{batch.farmName || "—"} {batch.farmStatus === "APPROVED" && <span className="text-green-700">· Đã xác minh</span>}</dd></div><div><dt className="text-xs text-muted-foreground">Số lượng</dt><dd>{batch.quantityKg ?? "—"} kg</dd></div><div><dt className="text-xs text-muted-foreground">Thu hoạch / đóng gói</dt><dd>{batch.harvestDate || "—"} / {batch.packagingDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Kiểm định</dt><dd>{batch.qualityResult || "Chưa cập nhật"}{batch.qualityScore != null && ` · ${batch.qualityScore}/100`}</dd></div><div><dt className="text-xs text-muted-foreground">Vận chuyển</dt><dd>{batch.transportInfo || "Chưa cập nhật"}</dd></div></dl>
        <button disabled={!batch.farmId} onClick={() => edit(batch)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{batch.farmId ? <><Pencil className="h-3.5 w-3.5" /> Cập nhật lô</> : "Lô cũ · chỉ đọc"}</button>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-2"><img src={qrUrl(batch.batchCode)} alt={`QR truy xuất lô ${batch.batchCode}`} className="h-36 w-36 rounded-lg border border-border" /><div className="flex items-center gap-1 text-xs font-semibold"><QrCode className="h-3.5 w-3.5" /> Mã QR truy xuất</div><a href={`/trace?batchCode=${encodeURIComponent(batch.batchCode)}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline">Mở trang truy xuất</a></div>
    </article>)}{batches.length === 0 && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có lô hàng. Chọn “Tạo lô mới” sau khi thêm sản phẩm và được duyệt Farm.</p>}</div>
  </BusinessShell>;
}
