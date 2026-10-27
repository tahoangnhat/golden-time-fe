import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { api, type Farm } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/farms")({
  head: () => ({ meta: [{ title: "Xác minh nông trại — Golden Time Admin" }] }),
  component: AdminFarms,
});

function AdminFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [galleryFarm, setGalleryFarm] = useState<Farm | null>(null);
  useEffect(() => { api.adminFarms().then(setFarms).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được nông trại.")); }, []);

  async function decide(farm: Farm, approved: boolean) {
    const reason = reasons[farm.id]?.trim() ?? "";
    if (!approved && !reason) { setError("Nhập lý do từ chối để Business biết cần cập nhật nội dung nào."); return; }
    setBusyId(farm.id); setError(""); setNotice("");
    try {
      const updated = await api.decideFarm(farm.id, approved, reason || undefined);
      setFarms((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(approved ? `Đã xác minh nông trại ${farm.name}.` : `Đã từ chối nông trại ${farm.name}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái nông trại."); }
    finally { setBusyId(null); }
  }

  const pending = farms.filter((farm) => farm.status === "PENDING").length;
  return <AdminShell title="Xác minh nông trại" subtitle={`${pending} hồ sơ đang chờ xác minh`}>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <div className="space-y-4">{farms.map((farm) => <article key={farm.id} className="rounded-2xl border border-border bg-white p-5 gt-shadow-soft">
      <div className="flex flex-wrap items-start gap-4">{farm.imageUrl && <img src={farm.imageUrl} alt={farm.name} className="h-24 w-28 rounded-xl border border-border object-cover" />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">{farm.name}</h2><p className="mt-1 text-sm text-muted-foreground">Doanh nghiệp: {farm.shopName || `#${farm.shopId}`}</p><button type="button" onClick={() => setGalleryFarm(farm)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"><Eye className="h-3.5 w-3.5" />Xem ảnh nông trại và giấy chứng nhận</button></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${farm.status === "APPROVED" ? "bg-green-50 text-green-700" : farm.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{farm.status === "APPROVED" ? "Đã xác minh" : farm.status === "REJECTED" ? "Từ chối" : "Chờ xác minh"}</span></div>
        <div className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2"><p><span className="text-muted-foreground">Địa chỉ / khu vực:</span> {farm.address}</p><p><span className="text-muted-foreground">Người phụ trách:</span> {farm.managerName} · {farm.phone}</p><p><span className="text-muted-foreground">Loại trái cây:</span> {farm.fruitTypes}</p><p><span className="text-muted-foreground">Diện tích:</span> {farm.areaHectares == null ? "Chưa cung cấp" : `${farm.areaHectares} ha`}</p><p className="sm:col-span-2"><span className="text-muted-foreground">Ảnh giấy chứng nhận:</span> {farm.certificationImageUrl ? "Đã tải lên · bấm nút xem hồ sơ ảnh để kiểm tra" : "Chưa cung cấp"}{farm.certifications ? ` · ${farm.certifications}` : ""}</p></div>
      </div></div>
      {farm.status === "PENDING" ? <><label className="mt-4 block"><span className="text-xs font-semibold">Lý do từ chối (bắt buộc khi từ chối)</span><textarea rows={2} maxLength={1000} value={reasons[farm.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [farm.id]: event.target.value }))} className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" /></label>{(!farm.certificationImageUrl || !(farm.imageUrls?.length || farm.imageUrl)) && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Chưa thể xác minh: hồ sơ cần có ảnh giấy chứng nhận và ít nhất một ảnh nông trại.</p>}<div className="mt-3 flex justify-end gap-2"><button disabled={busyId === farm.id} onClick={() => void decide(farm, false)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"><X className="h-4 w-4" />Từ chối</button><button disabled={busyId === farm.id || !farm.certificationImageUrl || !(farm.imageUrls?.length || farm.imageUrl)} onClick={() => void decide(farm, true)} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busyId === farm.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Xác minh</button></div></> : farm.status === "REJECTED" && farm.rejectionReason && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Lý do từ chối: {farm.rejectionReason}</p>}
    </article>)}{farms.length === 0 && !error && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có hồ sơ nông trại.</p>}</div>
    <Dialog open={galleryFarm !== null} onOpenChange={(open) => { if (!open) setGalleryFarm(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader><DialogTitle>Ảnh nông trại và chứng nhận{galleryFarm ? ` · ${galleryFarm.name}` : ""}</DialogTitle><DialogDescription>Hình ảnh và giấy chứng nhận do doanh nghiệp cung cấp trong hồ sơ xác minh.</DialogDescription></DialogHeader>
        {galleryFarm && <div className="space-y-5">{galleryFarm.certificationImageUrl ? <section><h3 className="mb-2 text-sm font-bold">Ảnh giấy chứng nhận</h3><a href={galleryFarm.certificationImageUrl} target="_blank" rel="noreferrer" title="Mở ảnh chứng nhận kích thước đầy đủ"><img src={galleryFarm.certificationImageUrl} alt={`${galleryFarm.name} · giấy chứng nhận`} className="max-h-[60vh] w-full rounded-xl border border-border object-contain bg-muted" /></a></section> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Doanh nghiệp chưa tải ảnh giấy chứng nhận lên.</p>}{(galleryFarm.imageUrls?.length || galleryFarm.imageUrl) ? <section><h3 className="mb-2 text-sm font-bold">Ảnh nông trại</h3><div className="grid gap-3 sm:grid-cols-2">{(galleryFarm.imageUrls?.length ? galleryFarm.imageUrls : galleryFarm.imageUrl ? [galleryFarm.imageUrl] : []).map((imageUrl, index) => <img key={`${imageUrl}-${index}`} src={imageUrl} alt={`${galleryFarm.name} · ảnh ${index + 1}`} className="max-h-[60vh] w-full rounded-xl border border-border object-contain bg-muted" />)}</div></section> : <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">Doanh nghiệp chưa tải ảnh nông trại lên.</p>}</div>}
      </DialogContent>
    </Dialog>
  </AdminShell>;
}
