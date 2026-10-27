import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, LoaderCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type Farm } from "@/lib/api";

export const Route = createFileRoute("/business/farms")({
  head: () => ({ meta: [{ title: "Nông trại — Golden Time Business" }] }),
  component: Farms,
});

type Draft = { name: string; address: string; managerName: string; phone: string; fruitTypes: string; areaHectares: string; certifications: string; imageUrl: string };
const emptyDraft = (): Draft => ({ name: "", address: "", managerName: "", phone: "", fruitTypes: "", areaHectares: "", certifications: "", imageUrl: "" });

function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try { setFarms(await api.shopFarms()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được danh sách nông trại."); }
  }
  useEffect(() => { void load(); }, []);

  function create() {
    setEditingId(null); setDraft(emptyDraft()); setError(""); setNotice(""); setFormOpen(true);
  }
  function edit(farm: Farm) {
    setEditingId(farm.id);
    setDraft({ name: farm.name, address: farm.address, managerName: farm.managerName, phone: farm.phone,
      fruitTypes: farm.fruitTypes, areaHectares: farm.areaHectares == null ? "" : String(farm.areaHectares),
      certifications: farm.certifications ?? "", imageUrl: farm.imageUrl ?? "" });
    setError(""); setNotice(""); setFormOpen(true);
  }
  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try { const image = await api.uploadFarmImage(file); setDraft((current) => ({ ...current, imageUrl: image.url })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được ảnh nông trại."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const payload = { name: draft.name.trim(), address: draft.address.trim(), managerName: draft.managerName.trim(),
      phone: draft.phone.trim(), fruitTypes: draft.fruitTypes.trim(),
      areaHectares: draft.areaHectares.trim() ? Number(draft.areaHectares) : null,
      certifications: draft.certifications.trim(), imageUrl: draft.imageUrl };
    try {
      const saved = editingId == null ? await api.createFarm(payload) : await api.updateFarm(editingId, payload);
      setFarms((current) => [saved, ...current.filter((farm) => farm.id !== saved.id)]);
      setFormOpen(false); setNotice(editingId == null ? "Đã gửi thông tin nông trại cho Admin xác minh." : "Đã cập nhật nông trại. Thông tin đã được gửi lại để Admin xác minh.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không lưu được nông trại."); }
    finally { setBusy(false); }
  }
  async function remove(farm: Farm) {
    if (!window.confirm(`Xóa nông trại “${farm.name}”?`)) return;
    try { await api.deleteFarm(farm.id); setFarms((current) => current.filter((item) => item.id !== farm.id)); setNotice("Đã xóa nông trại."); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không xóa được nông trại."); }
  }

  return <BusinessShell title="Nông trại nguồn" subtitle="Khai báo nguồn trái cây của doanh nghiệp; chỉ nông trại được Admin xác minh mới dùng được cho lô hàng." actions={<button onClick={create} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Thêm nông trại</button>}>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {formOpen && <form onSubmit={save} className="mb-5 rounded-2xl border border-border bg-white p-5 gt-shadow-soft">
      <div className="mb-4 flex items-start justify-between"><div><h2 className="font-bold">{editingId == null ? "Khai báo nông trại" : "Cập nhật nông trại"}</h2><p className="mt-1 text-xs text-muted-foreground">Khi sửa hồ sơ, trạng thái xác minh sẽ trở lại chờ duyệt.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Đóng" className="rounded-lg p-2 hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="text-xs font-semibold">Tên nông trại</span><input required maxLength={255} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Khu vực / địa chỉ</span><input required maxLength={512} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Người phụ trách</span><input required maxLength={255} value={draft.managerName} onChange={(e) => setDraft({ ...draft, managerName: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Số điện thoại người phụ trách</span><input required type="tel" maxLength={32} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Loại trái cây được trồng</span><input required maxLength={2000} value={draft.fruitTypes} onChange={(e) => setDraft({ ...draft, fruitTypes: e.target.value })} placeholder="Ví dụ: Xoài cát, thanh long" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold">Diện tích (ha, không bắt buộc)</span><input type="number" min="0.01" step="0.01" value={draft.areaHectares} onChange={(e) => setDraft({ ...draft, areaHectares: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <label className="block sm:col-span-2"><span className="text-xs font-semibold">Chứng nhận (không bắt buộc)</span><input maxLength={2000} value={draft.certifications} onChange={(e) => setDraft({ ...draft, certifications: e.target.value })} placeholder="VietGAP, GlobalGAP…" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        <div className="sm:col-span-2"><span className="text-xs font-semibold">Ảnh nông trại (không bắt buộc)</span><div className="mt-2 flex items-center gap-3">{draft.imageUrl && <img src={draft.imageUrl} alt="Nông trại" className="h-16 w-20 rounded-lg border border-border object-cover" />}<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"><ImagePlus className="h-4 w-4" />{uploading ? "Đang tải…" : "Tải ảnh lên"}</button></div></div>
      </div>
      <button disabled={busy || uploading} className="mt-4 inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{busy ? "Đang lưu…" : "Gửi để xác minh"}</button>
    </form>}
    <div className="grid gap-3 md:grid-cols-2">{farms.map((farm) => <article key={farm.id} className="rounded-2xl border border-border bg-white p-5 gt-shadow-soft">
      <div className="flex gap-3">{farm.imageUrl && <img src={farm.imageUrl} alt={farm.name} className="h-16 w-16 rounded-xl object-cover" />}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className="font-bold">{farm.name}</h2><p className="mt-1 text-xs text-muted-foreground">{farm.address}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${farm.status === "APPROVED" ? "bg-green-50 text-green-700" : farm.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{farm.status === "APPROVED" ? "Đã xác minh" : farm.status === "REJECTED" ? "Cần cập nhật" : "Chờ xác minh"}</span></div></div></div>
      <p className="mt-3 text-sm"><span className="text-muted-foreground">Trái cây:</span> {farm.fruitTypes}</p><p className="mt-1 text-sm"><span className="text-muted-foreground">Phụ trách:</span> {farm.managerName} · {farm.phone}</p><p className="mt-1 text-sm"><span className="text-muted-foreground">Chứng nhận:</span> {farm.certifications || "Chưa cung cấp"}{farm.areaHectares != null && ` · ${farm.areaHectares} ha`}</p>
      {farm.rejectionReason && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">Lý do từ chối: {farm.rejectionReason}</p>}
      <div className="mt-4 flex gap-2"><button onClick={() => edit(farm)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"><Pencil className="h-3.5 w-3.5" /> Sửa</button><button onClick={() => void remove(farm)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" /> Xóa</button></div>
    </article>)}{farms.length === 0 && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground md:col-span-2">Chưa có nông trại. Thêm nguồn trái cây để gửi Admin xác minh.</p>}</div>
  </BusinessShell>;
}
