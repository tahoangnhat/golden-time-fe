import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopTrace } from "@/lib/api";

export const Route = createFileRoute("/business/traceability")({ head: () => ({ meta: [{ title: "Truy xuất nguồn gốc — Golden Time Business" }] }), component: Traceability });

function Traceability() {
  const [batches, setBatches] = useState<ShopTrace[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.shopTraceability().then(setBatches).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được mã lô.")); }, []);
  return <BusinessShell title="Truy xuất nguồn gốc" subtitle="Mã lô liên kết với sản phẩm của cửa hàng">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="space-y-3">{batches.map((batch) => <article key={batch.batchCode} className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-extrabold">{batch.product}</p><p className="mt-1 text-xs text-muted-foreground font-mono">Mã lô: {batch.batchCode}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${batch.certified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{batch.certified ? "Đã xác nhận" : "Chưa xác nhận"}</span></div><dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-muted-foreground">Nhà cung cấp</dt><dd>{batch.supplier || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Khu vực</dt><dd>{batch.origin || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Ngày thu hoạch</dt><dd>{batch.harvestDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Ngày nhập</dt><dd>{batch.intakeDate || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Chứng nhận</dt><dd>{batch.certificates || "—"}</dd></div><div><dt className="text-xs text-muted-foreground">Bảo quản</dt><dd>{batch.storageTemperature || "—"}{batch.storageHumidity ? ` · Độ ẩm ${batch.storageHumidity}` : ""}</dd></div></dl>{batch.publicNote && <p className="mt-3 text-sm text-muted-foreground">{batch.publicNote}</p>}</article>)}
      {!error && batches.length === 0 && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có hồ sơ lô hàng liên kết với sản phẩm cửa hàng.</p>}
    </div>
  </BusinessShell>;
}
