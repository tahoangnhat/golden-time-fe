import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, AdminTable, FilterBar, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminOrder } from "@/lib/api";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api.adminOrders().then(setOrders).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng.")); }, []);
  const filtered = useMemo(() => orders.filter((order) => `${order.id} ${order.customer} ${order.shop}`.toLowerCase().includes(query.toLowerCase())), [orders, query]);
  const statusLabel = (status: string) => ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy" }[status] ?? status);
  return <AdminShell title="Quản lý đơn hàng" subtitle={`${orders.length} đơn trong hệ thống`}>
    <FilterBar><div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, khách hàng..." className="flex-1 bg-transparent outline-none text-sm" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title={`Đơn hàng (${filtered.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Mã đơn</th><th className="py-2 pr-3">Khách hàng</th><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3 text-right">Tổng tiền</th><th className="py-2 pr-3">Trạng thái</th><th className="py-2 pr-3">Thanh toán</th><th className="py-2 pr-3">Thời gian</th><th className="py-2 pr-3 text-right">Sản phẩm</th></>}>
        {filtered.map((order) => <tr key={order.id} className="hover:bg-muted/30"><td className="py-3 pr-3 font-mono font-semibold text-[oklch(0.55_0.18_145)]">#{order.id}</td><td className="py-3 pr-3">{order.customer}</td><td className="py-3 pr-3 text-muted-foreground">{order.shop}</td><td className="py-3 pr-3 text-right font-bold">{order.total.toLocaleString("vi-VN")}₫</td><td className="py-3 pr-3"><StatusBadge status={statusLabel(order.status)} /></td><td className="py-3 pr-3 text-xs">{order.payment}</td><td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</td><td className="py-3 pr-3 text-right">{order.itemCount}</td></tr>)}
        {!error && filtered.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Chưa có đơn hàng.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
