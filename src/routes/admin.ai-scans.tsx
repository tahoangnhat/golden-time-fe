import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AdminShell, AdminTable, SectionCard } from "@/components/AdminShell";
import { api, type AdminScan } from "@/lib/api";

export const Route = createFileRoute("/admin/ai-scans")({ component: AdminAIScans });

function AdminAIScans() {
  const [scans, setScans] = useState<AdminScan[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.adminScans().then(setScans).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được lượt quét.")); }, []);
  return <AdminShell title="Dữ liệu AI quét trái cây" subtitle={`${scans.length} lượt quét đã lưu`}>
    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" /><p className="text-sm text-yellow-800">Kết quả phân tích chỉ hiển thị khi nhận được từ dịch vụ AI đã cấu hình.</p></div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title="Lượt quét gần đây">
      <AdminTable head={<><th className="py-2 pr-3">Loại trái cây</th><th className="py-2 pr-3 text-right">Freshness</th><th className="py-2 pr-3 text-right">Quality</th><th className="py-2 pr-3 text-right">Confidence</th><th className="py-2 pr-3">Người dùng</th><th className="py-2 pr-3">Chế độ xử lý</th><th className="py-2 pr-3">Thời gian</th></>}>
        {scans.map((scan) => <tr key={scan.id} className="hover:bg-muted/30"><td className="py-3 pr-3">{scan.emoji || "🍎"} {scan.fruit || "Chưa nhận diện"}</td><td className="py-3 pr-3 text-right">{scan.freshness ?? "—"}</td><td className="py-3 pr-3 text-right">{scan.quality ?? "—"}</td><td className="py-3 pr-3 text-right">{scan.confidence == null ? "—" : `${Math.round(scan.confidence * 100)}%`}</td><td className="py-3 pr-3">{scan.user}</td><td className="py-3 pr-3">{scan.mode}</td><td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleString("vi-VN")}</td></tr>)}
        {!error && scans.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Chưa có lượt phân tích AI.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
