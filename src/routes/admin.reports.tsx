import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScanLine, Store, ShoppingBag } from "lucide-react";
import { AdminShell, SectionCard, MiniBarChart, MiniLineChart, StatCard } from "@/components/AdminShell";
import { api, type AdminOverview } from "@/lib/api";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.adminOverview().then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được báo cáo.")); }, []);
  const label = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  const orderValue = data?.daily.map((day) => ({ label: label(day.date), value: day.orderValue / 1_000_000 })) ?? [];
  const scans = data?.daily.map((day) => ({ label: label(day.date), value: day.scans })) ?? [];
  return <AdminShell title="Báo cáo" subtitle="Tổng hợp 7 ngày gần nhất từ đơn hàng và lượt quét đã lưu">
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Tổng đơn hàng" value={data?.orders.toLocaleString("vi-VN") ?? "—"} tone="primary" icon={ShoppingBag} />
      <StatCard label="Cửa hàng" value={data?.shops.toLocaleString("vi-VN") ?? "—"} tone="orange" icon={Store} />
      <StatCard label="Tổng lượt quét AI" value={data?.scansToday.toLocaleString("vi-VN") ?? "—"} hint="Hôm nay" tone="yellow" icon={ScanLine} />
    </div>
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <SectionCard title="Giá trị đơn theo ngày (triệu ₫)">{orderValue.length ? <MiniBarChart data={orderValue} /> : <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dữ liệu đơn hàng.</p>}</SectionCard>
      <SectionCard title="Lượt quét theo ngày">{scans.length ? <MiniLineChart data={scans} /> : <p className="py-12 text-center text-sm text-muted-foreground">Chưa có lượt quét.</p>}</SectionCard>
    </div>
    <p className="mt-4 rounded-xl border border-border bg-white p-4 text-sm text-muted-foreground">Hoa hồng, phí nền tảng và doanh số sản phẩm chưa được cấu hình trong dữ liệu hệ thống.</p>
  </AdminShell>;
}
