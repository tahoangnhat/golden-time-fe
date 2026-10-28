import { createFileRoute } from "@tanstack/react-router";
import { Check, ExternalLink, Image as ImageIcon, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell, SectionCard } from "@/components/AdminShell";
import { api, type ShopBatch } from "@/lib/api";

export const Route = createFileRoute("/admin/traceability")({ component: AdminTraceability });

const reviewLabel: Record<ShopBatch["reviewStatus"], string> = { PENDING_REVIEW: "Chờ xác minh", VERIFIED: "Đã xác minh", NEEDS_CORRECTION: "Yêu cầu Business chỉnh sửa" };
const operationLabel: Record<string, string> = { IN_PROGRESS: "Đang hoàn thiện", READY: "Sẵn sàng bán", IN_TRANSIT: "Đang vận chuyển", DELIVERED: "Đã giao", RECALLED: "Thu hồi" };

function AdminTraceability() {
  const [batches, setBatches] = useState<ShopBatch[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  useEffect(() => { api.adminTraceability().then(setBatches).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được lô hàng.")); }, []);
  async function decide(batch: ShopBatch, approved: boolean) {
    const note = notes[batch.batchCode]?.trim() ?? "";
    if (!approved && !note) { setError(`Hãy nhập nội dung cần sửa cho lô ${batch.batchCode}.`); return; }
    setBusyCode(batch.batchCode); setError("");
    try {
      const updated = await api.decideBatch(batch.batchCode, approved, note || undefined);
      setBatches((current) => current.map((item) => item.batchCode === batch.batchCode ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được quyết định xác minh."); }
    finally { setBusyCode(null); }
  }
  async function updateOperation(batch: ShopBatch, batchStatus: string) {
    setBusyCode(batch.batchCode); setError("");
    try {
      const updated = await api.adminUpdateBatchStatus(batch.batchCode, batchStatus, "Cập nhật trạng thái vận hành từ khu vực quản trị.");
      setBatches((current) => current.map((item) => item.batchCode === batch.batchCode ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái vận hành."); }
    finally { setBusyCode(null); }
  }
  const orderedBatches = [...batches].sort((left, right) => {
    const priority = (status: string) => status === "PENDING_REVIEW" ? 0 : status === "NEEDS_CORRECTION" ? 1 : 2;
    return priority(left.reviewStatus) - priority(right.reviewStatus) || right.createdAt.localeCompare(left.createdAt);
  });
  const pendingCount = batches.filter((batch) => batch.reviewStatus === "PENDING_REVIEW").length;
  return <AdminShell title="Truy xuất nguồn gốc" subtitle={`${pendingCount} hồ sơ đang chờ xác minh · ${batches.length} lô trong hệ thống`}>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title="Hồ sơ lô hàng và bằng chứng">
      <div className="space-y-4 p-4">
        {orderedBatches.map((batch) => <article key={batch.batchCode} className="rounded-2xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{batch.product}</h2><p className="mt-1 font-mono text-xs text-muted-foreground">{batch.batchCode}</p><p className="mt-1 text-sm">Business: <strong>{batch.shopName || "—"}</strong> · Farm: <strong>{batch.farmName || "—"}</strong></p><p className="text-xs text-muted-foreground">{batch.origin || ""}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${batch.reviewStatus === "VERIFIED" ? "bg-green-100 text-green-800" : batch.reviewStatus === "NEEDS_CORRECTION" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-800"}`}>{reviewLabel[batch.reviewStatus]}</span></div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-muted-foreground">Số lượng</dt><dd>{batch.quantityKg == null ? "—" : `${batch.quantityKg} kg`}</dd></div><div><dt className="text-xs text-muted-foreground">Thu hoạch</dt><dd>{batch.harvestDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Đóng gói</dt><dd>{batch.packagingDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Kiểm định</dt><dd>{batch.qualityResult || "Chưa cập nhật"}{batch.qualityScore != null && ` · ${batch.qualityScore}/100`}</dd></div><div><dt className="text-xs text-muted-foreground">Ghi chú kiểm định</dt><dd>{batch.qualityNote || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Vận chuyển</dt><dd>{batch.transportInfo || batch.transportDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Trạng thái vận hành</dt><dd>{operationLabel[batch.batchStatus] ?? batch.batchStatus}</dd></div></dl>
          <div className="mt-4"><p className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4" /> Bằng chứng gửi ở lần {batch.reviewVersion || 1} ({batch.evidenceUrls?.length ?? 0} ảnh)</p>
            {batch.evidenceUrls?.length ? <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">{batch.evidenceUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="group relative"><img src={url} alt={`Bằng chứng ${index + 1} của ${batch.batchCode}`} className="h-28 w-full rounded-lg border border-border object-cover" /><span className="absolute bottom-1 right-1 rounded bg-white/90 p-1 text-xs"><ExternalLink className="h-3 w-3" /></span></a>)}</div> : <p className="mt-2 text-xs text-muted-foreground">Lô cũ chưa lưu bằng chứng ảnh.</p>}
          </div>
          {batch.reviewStatus === "PENDING_REVIEW" && <div className="mt-4 rounded-xl bg-muted/40 p-3"><label className="block text-xs font-semibold">Nội dung yêu cầu chỉnh sửa <span className="font-normal text-muted-foreground">(bắt buộc khi trả hồ sơ)</span><textarea rows={2} maxLength={2000} value={notes[batch.batchCode] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [batch.batchCode]: event.target.value }))} placeholder="Nêu rõ thông tin hoặc bằng chứng Business cần bổ sung…" className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" /></label>{(!batch.evidenceUrls?.length || !batch.productId || !batch.shopId || !batch.farmId || batch.farmStatus !== "APPROVED") && <p className="mt-2 text-xs text-amber-800">Cần có bằng chứng ảnh và liên kết Business, sản phẩm, Farm đã duyệt để xác minh.</p>}<div className="mt-3 flex flex-wrap justify-end gap-2"><button disabled={busyCode === batch.batchCode} onClick={() => void decide(batch, false)} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50">{busyCode === batch.batchCode ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Yêu cầu sửa</button><button disabled={busyCode === batch.batchCode || !batch.evidenceUrls?.length || !batch.productId || !batch.shopId || !batch.farmId || batch.farmStatus !== "APPROVED"} onClick={() => void decide(batch, true)} className="inline-flex items-center gap-2 rounded-lg gt-gradient px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Xác minh lô</button></div></div>}
          {batch.reviewStatus === "NEEDS_CORRECTION" && batch.reviewNote && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><strong>Nội dung đã gửi Business:</strong> {batch.reviewNote}</p>}
          {batch.reviewStatus === "VERIFIED" && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-green-800">Khách hàng có thể xem trang truy xuất và quét QR của lô này.</p><label className="flex items-center gap-2 text-xs font-semibold">Trạng thái vận hành<select aria-label={`Trạng thái vận hành ${batch.batchCode}`} disabled={busyCode === batch.batchCode} value={batch.batchStatus} onChange={(event) => void updateOperation(batch, event.target.value)} className="h-9 rounded-lg border border-border bg-white px-2"><option value="IN_PROGRESS">Đang hoàn thiện</option><option value="READY">Sẵn sàng bán</option><option value="IN_TRANSIT">Đang vận chuyển</option><option value="DELIVERED">Đã giao</option><option value="RECALLED">Thu hồi</option></select></label></div>}
        </article>)}
        {!error && orderedBatches.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Chưa có hồ sơ lô hàng.</p>}
      </div>
    </SectionCard>
  </AdminShell>;
}
