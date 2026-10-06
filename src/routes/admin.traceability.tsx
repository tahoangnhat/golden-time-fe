import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, AdminTable, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminTrace } from "@/lib/api";

export const Route = createFileRoute("/admin/traceability")({ component: AdminTraceability });

function AdminTraceability() {
  const [batches, setBatches] = useState<AdminTrace[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.adminTraceability().then(setBatches).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được lô hàng.")); }, []);
  return <AdminShell title="Truy xuất nguồn gốc" subtitle={`${batches.length} mã lô có trong cơ sở dữ liệu`}>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title="Hồ sơ lô hàng">
      <AdminTable head={<><th className="py-2 pr-3">Mã lô</th><th className="py-2 pr-3">Sản phẩm</th><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3">Nhà cung cấp</th><th className="py-2 pr-3">Khu vực</th><th className="py-2 pr-3">Ngày thu hoạch</th><th className="py-2 pr-3">Ngày nhập</th><th className="py-2 pr-3">Chứng nhận</th><th className="py-2 pr-3">Xác nhận</th></>}>
        {batches.map((batch) => <tr key={batch.batchCode}><td className="py-3 pr-3 font-mono text-xs">{batch.batchCode}</td><td className="py-3 pr-3 font-semibold">{batch.product}</td><td className="py-3 pr-3">{batch.shop || "—"}</td><td className="py-3 pr-3">{batch.supplier || "—"}</td><td className="py-3 pr-3">{batch.area || "—"}</td><td className="py-3 pr-3">{batch.harvestDate || "—"}</td><td className="py-3 pr-3">{batch.intakeDate || "—"}</td><td className="py-3 pr-3">{batch.certificates || "—"}</td><td className="py-3 pr-3"><StatusBadge status={batch.certified ? "Đã xác minh" : "Chưa xác minh"} /></td></tr>)}
        {!error && batches.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Chưa có hồ sơ lô hàng.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
