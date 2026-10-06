import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package, AlertTriangle, Star } from "lucide-react";
import { BusinessShell, StatCard } from "@/components/BusinessShell";
import { api, type ShopOverview } from "@/lib/api";

export const Route = createFileRoute("/business/dashboard")({ head: () => ({ meta: [{ title: "Tổng quan — Golden Time Business" }] }), component: Dashboard });

function Dashboard() {
  const [data, setData] = useState<ShopOverview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.shopOverview().then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được tổng quan cửa hàng.")); }, []);
  const revenue = data?.daily ?? [];
  const max = Math.max(...revenue.map((day) => day.orderValue), 1);
  const money = (amount: number) => `${amount.toLocaleString("vi-VN")}đ`;
  return <BusinessShell title="Tổng quan cửa hàng" subtitle="Chỉ số theo dữ liệu cửa hàng đang lưu">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <StatCard label="Giá trị đơn hôm nay" value={data ? money(data.orderValueToday) : "—"} tone="primary" icon={DollarSign} />
      <StatCard label="Đơn đang chờ" value={data?.pendingOrders.toLocaleString("vi-VN") ?? "—"} tone="orange" icon={ShoppingBag} />
      <StatCard label="Sản phẩm" value={data?.products.toLocaleString("vi-VN") ?? "—"} tone="primary" icon={Package} />
      <StatCard label="Hết hàng" value={data?.soldOut.toLocaleString("vi-VN") ?? "—"} tone="orange" icon={AlertTriangle} />
      <StatCard label="Đánh giá trung bình" value={data ? `${Number(data.rating).toFixed(1)} ★` : "—"} hint={`${data?.reviewCount ?? 0} đánh giá`} tone="yellow" icon={Star} />
    </div>
    <div className="mt-6 grid lg:grid-cols-3 gap-4">
      <section className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border gt-shadow-soft"><h3 className="font-bold">Giá trị đơn 7 ngày</h3><p className="text-xs text-muted-foreground">Loại trừ đơn đã hủy · VNĐ</p>
        {revenue.length ? <div className="mt-6 flex items-end gap-3 h-44">{revenue.map((day) => <div key={day.date} className="flex-1 flex flex-col items-center gap-2"><div className="w-full rounded-t-lg gt-gradient" style={{ height: `${(day.orderValue / max) * 100}%`, minHeight: day.orderValue ? 3 : 0 }} title={money(day.orderValue)} /><span className="text-[11px] text-muted-foreground">{new Date(`${day.date}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "short" })}</span></div>)}</div> : <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu đơn hàng.</p>}
      </section>
      <section className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft"><h3 className="font-bold">Sản phẩm bán ra</h3><div className="mt-4 divide-y divide-border">{data?.topProducts.map((product, index) => <div key={product.name} className="flex items-center gap-3 py-3"><span className="h-8 w-8 rounded-lg bg-muted grid place-items-center font-bold text-xs">{index + 1}</span><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{product.name}</p><p className="text-xs text-muted-foreground">{Number(product.sold).toLocaleString("vi-VN")} kg</p></div><span className="font-bold text-sm">{money(product.orderValue)}</span></div>)}{data && data.topProducts.length === 0 && <p className="py-8 text-sm text-muted-foreground">Chưa có sản phẩm.</p>}</div></section>
    </div>
  </BusinessShell>;
}
