import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, AdminTable, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminTrace } from "@/lib/api";

export const Route = createFileRoute("/admin/traceability")({ component: AdminTraceability });

function AdminTraceability() {
  const [batches, setBatches] = useState<AdminTrace[]>([]);
  const [error, setError] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  useEffect(() => { api.adminTraceability().then(setBatches).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được lô hàng.")); }, []);
  async function updateStatus(batch: AdminTrace, batchStatus: string) {
    setBusyCode(batch.batchCode); setError("");
    try {
      await api.adminUpdateBatchStatus(batch.batchCode, batchStatus, "Cập nhật từ khu vực quản trị.");
      setBatches((current) => current.map((item) => item.batchCode === batch.batchCode ? { ...item, batchStatus } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái lô."); }
    finally { setBusyCode(null); }
  }
  return <AdminShell title="Truy xuất nguồn gốc" subtitle={`${batches.length} mã lô có trong cơ sở dữ liệu`}>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title="Hồ sơ lô hàng">
      <AdminTable head={<><th className="py-2 pr-3">Mã lô</th><th className="py-2 pr-3">Sản phẩm / Shop</th><th className="py-2 pr-3">Farm</th><th className="py-2 pr-3">Số lượng</th><th className="py-2 pr-3">Thu hoạch</th><th className="py-2 pr-3">Đóng gói</th><th className="py-2 pr-3">Kiểm định</th><th className="py-2 pr-3">Vận chuyển</th><th className="py-2 pr-3">Trạng thái</th></>}>
        {batches.map((batch) => <tr key={batch.batchCode}><td className="py-3 pr-3 font-mono text-xs"><a href={`/trace?batchCode=${encodeURIComponent(batch.batchCode)}`} target="_blank" rel="noreferrer" className="text-primary underline">{batch.batchCode}</a></td><td className="py-3 pr-3"><p className="font-semibold">{batch.product}</p><p className="text-xs text-muted-foreground">{batch.shop || "—"}</p></td><td className="py-3 pr-3">{batch.farm || batch.supplier || "—"}<p className="text-xs text-muted-foreground">{batch.area || ""}</p></td><td className="py-3 pr-3">{batch.quantityKg == null ? "—" : `${batch.quantityKg} kg`}</td><td className="py-3 pr-3">{batch.harvestDate || "—"}</td><td className="py-3 pr-3">{batch.packagingDate || batch.intakeDate || "—"}</td><td className="py-3 pr-3">{batch.qualityResult || "—"}{batch.qualityScore != null && <p className="text-xs text-muted-foreground">{batch.qualityScore}/100</p>}</td><td className="py-3 pr-3">{batch.transportInfo || batch.transportDate || "—"}</td><td className="py-3 pr-3"><StatusBadge status={batch.batchStatus || (batch.certified ? "Đã xác minh" : "Chưa xác minh")} /><select aria-label={`Cập nhật trạng thái lô ${batch.batchCode}`} disabled={busyCode === batch.batchCode} value={batch.batchStatus || "IN_PROGRESS"} onChange={(event) => void updateStatus(batch, event.target.value)} className="mt-2 h-8 max-w-40 rounded-lg border border-border bg-white px-2 text-[11px]"><option value="IN_PROGRESS">Đang hoàn thiện</option><option value="READY">Sẵn sàng bán</option><option value="IN_TRANSIT">Đang vận chuyển</option><option value="DELIVERED">Đã giao</option><option value="RECALLED">Thu hồi</option></select></td></tr>)}
        {!error && batches.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Chưa có hồ sơ lô hàng.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
