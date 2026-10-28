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
  const [notice, setNotice] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  useEffect(() => { api.adminOrders().then(setOrders).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng.")); }, []);
  const filtered = useMemo(() => orders.filter((order) => `${order.id} ${order.customer} ${order.shop}`.toLowerCase().includes(query.toLowerCase())), [orders, query]);
  const statusLabel = (status: string) => ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", IN_TRANSIT: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã hủy" }[status] ?? status);
  const paymentStatusLabel = (status: string) => ({ UNPAID: "Chưa thu tiền", PENDING: "Chờ PayOS", PAID: "Đã thanh toán", CANCELLED: "Đã hủy thanh toán", FAILED: "Thanh toán lỗi" }[status] ?? status);
  async function reconcileCod(order: AdminOrder) {
    if (!window.confirm(`Xác nhận sàn đã thực sự thu tiền COD của đơn #${order.id}? Chỉ tiếp tục nếu tiền đã được bàn giao cho sàn.`)) return;
    const reference = window.prompt("Mã đối soát / tham chiếu (không bắt buộc):") ?? undefined;
    setBusyOrderId(order.id); setError(""); setNotice("");
    try {
      await api.collectCod(order.id, reference);
      setOrders(await api.adminOrders());
      setNotice(order.status === "DELIVERED"
        ? `Đã đối soát COD và ghi nhận doanh thu đơn #${order.id} vào ví của cửa hàng ${order.shop}.`
        : `Đã đối soát COD đơn #${order.id}. Doanh thu sẽ vào ví sau khi khách xác nhận đã nhận hàng.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không đối soát được đơn COD."); }
    finally { setBusyOrderId(null); }
  }
  return <AdminShell title="Quản lý đơn hàng" subtitle={`${orders.length} đơn trong hệ thống`}>
    <FilterBar><div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, khách hàng..." className="flex-1 bg-transparent outline-none text-sm" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <SectionCard title={`Đơn hàng (${filtered.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Mã đơn</th><th className="py-2 pr-3">Khách hàng</th><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3 text-right">Tổng tiền</th><th className="py-2 pr-3">Trạng thái</th><th className="py-2 pr-3">Thanh toán</th><th className="py-2 pr-3">Thời gian</th><th className="py-2 pr-3 text-right">Sản phẩm</th><th className="py-2 pr-3">Đối soát</th></>}>
        {filtered.map((order) => <tr key={order.id} className="hover:bg-muted/30"><td className="py-3 pr-3 font-mono font-semibold text-[oklch(0.55_0.18_145)]">#{order.id}</td><td className="py-3 pr-3">{order.customer}</td><td className="py-3 pr-3 text-muted-foreground">{order.shop}</td><td className="py-3 pr-3 text-right font-bold">{order.total.toLocaleString("vi-VN")}₫</td><td className="py-3 pr-3"><StatusBadge status={statusLabel(order.status)} /></td><td className="py-3 pr-3 text-xs">{order.payment}<p className="text-muted-foreground">{paymentStatusLabel(order.paymentStatus)}</p></td><td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</td><td className="py-3 pr-3 text-right">{order.itemCount}</td><td className="py-3 pr-3">{order.payment === "COD" && order.paymentStatus === "UNPAID" && order.status !== "CANCELLED" ? <button type="button" disabled={busyOrderId === order.id} onClick={() => void reconcileCod(order)} className="whitespace-nowrap rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-50">{busyOrderId === order.id ? "Đang xử lý…" : "Xác nhận đã thu"}</button> : "—"}</td></tr>)}
        {!error && filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Chưa có đơn hàng.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
