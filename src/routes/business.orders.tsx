import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, Truck } from "lucide-react";
import { BusinessShell, StatusBadge } from "@/components/BusinessShell";
import { api, type ShopOrder } from "@/lib/api";

export const Route = createFileRoute("/business/orders")({ head: () => ({ meta: [{ title: "Đơn hàng — Golden Time Business" }] }), component: Orders });

function Orders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [tab, setTab] = useState("Tất cả");
  const [active, setActive] = useState<ShopOrder | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  useEffect(() => { api.shopOrders().then(setOrders).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được đơn hàng.")); }, []);
  const filtered = useMemo(() => orders.filter((order) => tab === "Tất cả" || order.status === tab), [orders, tab]);
  const tabs = ["Tất cả", "PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
  const statusLabel = (status: string) => ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", IN_TRANSIT: "Đang giao", DELIVERED: "Đã giao", CANCELLED: "Đã hủy" }[status] ?? status);
  const carrierStatusLabel = (status?: string | null) => ({ ready_to_pick: "Chờ GHN lấy hàng", picking: "GHN đang lấy hàng", picked: "GHN đã lấy hàng", storing: "Đang ở kho GHN", transporting: "Đang trung chuyển", sorting: "Đang phân loại", delivering: "GHN đang giao", delivered: "GHN báo đã giao", delivery_fail: "Giao chưa thành công", waiting_to_return: "Chờ hoàn hàng", returning: "Đang hoàn hàng", returned: "Đã hoàn về shop", cancel: "Đơn GHN đã hủy", exception: "GHN cần xử lý thêm" }[status ?? ""] ?? status ?? "");
  const paymentStatusLabel = (status: string) => ({ UNPAID: "Chưa thu tiền", PENDING: "Chờ PayOS", PAID: "Đã thanh toán", CANCELLED: "Đã hủy thanh toán", FAILED: "Thanh toán lỗi" }[status] ?? status);
  async function shipOrder(order: ShopOrder) {
    setBusyOrderId(order.id); setError(""); setNotice("");
    try {
      await api.shipShopOrder(order.id);
      const updated = await api.shopOrders();
      setOrders(updated);
      const created = updated.find((item) => item.id === order.id) ?? null;
      setActive(created);
      setNotice(`Đã tạo vận đơn GHN${created?.trackingCode ? ` ${created.trackingCode}` : ""} cho đơn #${order.id}. Khách hàng xem được mã và trạng thái giao hàng trong lịch sử mua hàng.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể xác nhận giao đơn hàng."); }
    finally { setBusyOrderId(null); }
  }
  return <BusinessShell title="Quản lý đơn hàng" subtitle={`${orders.length} đơn của cửa hàng`}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <div className="flex gap-2 overflow-x-auto pb-2">{tabs.map((value) => <button key={value} onClick={() => setTab(value)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold ${tab === value ? "gt-gradient text-white" : "bg-white border border-border text-foreground/70"}`}>{value === "Tất cả" ? value : statusLabel(value)} <span className="ml-1 text-xs">{value === "Tất cả" ? orders.length : orders.filter((order) => order.status === value).length}</span></button>)}</div>
    <div className="mt-4 bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto"><table className="w-full text-sm min-w-[780px]"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Mã đơn</th><th className="text-left p-3">Khách hàng</th><th className="text-left p-3">Sản phẩm</th><th className="text-right p-3">Tổng tiền</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Thời gian</th><th className="text-right p-3">Chi tiết</th></tr></thead><tbody className="divide-y divide-border">
      {filtered.map((order) => <tr key={order.id} className="hover:bg-muted/30"><td className="p-3 font-mono font-semibold">#{order.id}</td><td className="p-3">{order.deliveryName || order.customer}<p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>{order.trackingCode && <p className="mt-1 text-xs font-semibold text-blue-800">GHN {order.trackingCode} · {carrierStatusLabel(order.carrierStatus)}</p>}</td><td className="p-3 text-muted-foreground">{order.items.map((item) => `${item.name} ${item.quantityKg}kg`).join(", ")}</td><td className="p-3 text-right font-bold">{order.total.toLocaleString("vi-VN")}đ</td><td className="p-3"><StatusBadge status={statusLabel(order.status)} /></td><td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleString("vi-VN")}</td><td className="p-3 text-right"><div className="inline-flex items-center gap-2">{(order.status === "PENDING" || order.status === "CONFIRMED") && <button type="button" disabled={busyOrderId === order.id || (order.payment === "PAYOS" && order.paymentStatus !== "PAID")} onClick={() => void shipOrder(order)} className="px-2 py-1 rounded-lg gt-gradient text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"><Truck className="h-3 w-3" /> Giao hàng GHN</button>}<button onClick={() => setActive(order)} className="px-2 py-1 rounded-lg bg-muted text-xs font-semibold inline-flex items-center gap-1"><Eye className="h-3 w-3" /> Xem</button></div></td></tr>)}
      {!error && filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Không có đơn hàng.</td></tr>}
    </tbody></table></div>
    {active && <div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/40" onClick={() => setActive(null)} /><section className="relative ml-auto w-full max-w-lg h-full bg-white overflow-y-auto p-5"><div className="flex items-start justify-between"><div><h2 className="font-extrabold text-lg">Đơn hàng #{active.id}</h2><StatusBadge status={statusLabel(active.status)} /></div><button onClick={() => setActive(null)} className="rounded-lg px-3 py-1 bg-muted text-sm">Đóng</button></div><div className="mt-5 space-y-3 text-sm"><p><b>Khách hàng:</b> {active.deliveryName || active.customer}</p><p><b>Điện thoại:</b> {active.deliveryPhone || "—"}</p><p><b>Địa chỉ:</b> {active.deliveryAddress || "—"}</p>{active.trackingCode && <div className="rounded-xl bg-blue-50 p-3"><p><b>Mã vận đơn GHN:</b> <span className="font-mono">{active.trackingCode}</span></p><p className="mt-1"><b>Trạng thái GHN:</b> {carrierStatusLabel(active.carrierStatus)}</p>{active.expectedDeliveryAt && <p className="mt-1">Dự kiến giao: {new Date(active.expectedDeliveryAt).toLocaleString("vi-VN")}</p>}<p className="mt-1 text-xs">Cước GHN hiện tại: {active.carrierFee.toLocaleString("vi-VN")}đ</p></div>}<p><b>Phương thức thanh toán:</b> {active.payment}</p><p><b>Trạng thái thanh toán:</b> {paymentStatusLabel(active.paymentStatus)}</p><p><b>Ghi chú:</b> {active.note || "—"}</p></div><h3 className="font-bold mt-6">Sản phẩm</h3><ul className="divide-y divide-border mt-2">{active.items.map((item, index) => <li key={`${active.id}-${index}`} className="py-3 flex justify-between gap-3"><span>{item.emoji} {item.name} · {item.quantityKg} kg</span><b>{item.lineTotal.toLocaleString("vi-VN")}đ</b></li>)}</ul><div className="border-t border-border pt-3 mt-3 space-y-1 text-sm"><p className="flex justify-between"><span>Tạm tính</span><span>{active.subtotal.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between"><span>Giao hàng GHN</span><span>{active.shippingFee.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between font-extrabold"><span>Tổng</span><span>{active.total.toLocaleString("vi-VN")}đ</span></p></div>{(active.status === "PENDING" || active.status === "CONFIRMED") && <button type="button" disabled={busyOrderId === active.id || (active.payment === "PAYOS" && active.paymentStatus !== "PAID")} onClick={() => void shipOrder(active)} className="mt-5 w-full rounded-2xl gt-gradient py-3 font-semibold text-white disabled:opacity-50">{busyOrderId === active.id ? "Đang tạo vận đơn…" : "Xác nhận đơn và tạo vận đơn GHN"}</button>}</section></div>}
  </BusinessShell>;
}
