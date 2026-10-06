import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Store, ShoppingBag, DollarSign, ScanLine, CheckCircle2 } from "lucide-react";
import { AdminShell, StatCard, SectionCard, MiniBarChart, MiniLineChart } from "@/components/AdminShell";
import { api, type AdminOverview } from "@/lib/api";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.adminOverview().then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được tổng quan.")); }, []);
  const daily = data?.daily ?? [];
  const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
  const labels = daily.map((item) => new Date(`${item.date}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "short" }));
  const orderValue = daily.map((item, index) => ({ label: labels[index], value: Math.round(item.orderValue / 1_000_000 * 10) / 10 }));
  const scans = daily.map((item, index) => ({ label: labels[index], value: item.scans }));
  return <AdminShell title="Tổng quan hệ thống" subtitle="Số liệu tổng hợp từ dữ liệu đang lưu trong hệ thống">
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Tổng người dùng" value={data?.users.toLocaleString("vi-VN") ?? "—"} tone="primary" icon={Users} />
      <StatCard label="Cửa hàng" value={data?.shops.toLocaleString("vi-VN") ?? "—"} tone="orange" icon={Store} />
      <StatCard label="Tổng đơn hàng" value={data?.orders.toLocaleString("vi-VN") ?? "—"} tone="blue" icon={ShoppingBag} />
      <StatCard label="Giá trị đơn hôm nay" value={data ? money(data.orderValueToday) : "—"} tone="primary" icon={DollarSign} />
      <StatCard label="Lượt quét hôm nay" value={data?.scansToday.toLocaleString("vi-VN") ?? "—"} tone="yellow" icon={ScanLine} />
      <StatCard label="Đơn đã xác nhận" value={data ? `${data.confirmedPercent.toFixed(1)}%` : "—"} hint="Tỷ lệ trên toàn bộ đơn" tone="primary" icon={CheckCircle2} />
    </div>
    <div className="grid lg:grid-cols-3 gap-4 mt-4">
      <SectionCard title="Giá trị đơn 7 ngày (triệu ₫)" className="lg:col-span-2">{orderValue.length ? <MiniBarChart data={orderValue} /> : <p className="py-12 text-center text-sm text-muted-foreground">Chưa có dữ liệu đơn hàng.</p>}</SectionCard>
      <SectionCard title="Lượt quét AI 7 ngày">{scans.length ? <MiniLineChart data={scans} /> : <p className="py-12 text-center text-sm text-muted-foreground">Chưa có lượt quét.</p>}</SectionCard>
    </div>
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <SectionCard title="Loại trái cây được quét nhiều nhất"><ul className="space-y-3">{data?.topFruits.map((fruit) => <li key={fruit.name} className="flex justify-between text-sm"><span className="font-semibold">{fruit.name}</span><span className="text-muted-foreground">{fruit.scans.toLocaleString("vi-VN")} lượt</span></li>)}{data && data.topFruits.length === 0 && <li className="text-sm text-muted-foreground">Chưa có lượt quét.</li>}</ul></SectionCard>
      <SectionCard title="Cửa hàng theo giá trị đơn"><ul className="divide-y divide-border">{data?.topShops.map((shop, index) => <li key={shop.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="h-9 w-9 rounded-xl gt-gradient grid place-items-center text-white font-bold text-sm">{index + 1}</span><span className="flex-1 min-w-0"><span className="block font-semibold text-sm truncate">{shop.name}</span><span className="text-xs text-muted-foreground">{shop.orders} đơn</span></span><span className="font-bold text-sm">{money(shop.orderValue)}</span></li>)}{data && data.topShops.length === 0 && <li className="text-sm text-muted-foreground">Chưa có cửa hàng.</li>}</ul></SectionCard>
    </div>
    {data && data.pendingOrders > 0 && <p className="mt-4 text-sm text-orange-700">Có {data.pendingOrders} đơn đang chờ xử lý.</p>}
  </AdminShell>;
}
