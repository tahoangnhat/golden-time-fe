import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Truck, Eye, Package, X, MapPin, CreditCard, Clock } from "lucide-react";
import { PartnerShell, StatusBadge } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/orders")({
  head: () => ({ meta: [{ title: "Đơn hàng — Golden Time Partner" }] }),
  component: Orders,
});

const ORDERS = [
  {
    id: "GT-2406-0142", customer: "Nguyễn Thị Hương", items: "Táo Fuji 2kg, Cam sành 1kg",
    total: 133000, address: "Quận 1, TP.HCM", payment: "Momo", time: "10:32 hôm nay", status: "Chờ xác nhận",
  },
  {
    id: "GT-2406-0141", customer: "Trần Văn Bình", items: "Xoài cát 3kg",
    total: 195000, address: "Quận 3, TP.HCM", payment: "COD", time: "10:18 hôm nay", status: "Chờ xác nhận",
  },
  {
    id: "GT-2406-0140", customer: "Lê Minh Anh", items: "Nho mẫu đơn 1kg, Dâu Đà Lạt 0.5kg",
    total: 259000, address: "Quận 7, TP.HCM", payment: "ZaloPay", time: "09:45 hôm nay", status: "Chờ xác nhận",
  },
  {
    id: "GT-2406-0139", customer: "Phạm Quốc Đạt", items: "Chuối già 2kg",
    total: 56000, address: "Quận Bình Thạnh", payment: "Momo", time: "09:12 hôm nay", status: "Đang chuẩn bị",
  },
  {
    id: "GT-2406-0138", customer: "Võ Thị Lan", items: "Combo Healthy 1 set",
    total: 320000, address: "Quận 2, TP.HCM", payment: "Thẻ Visa", time: "08:50 hôm nay", status: "Đang giao",
  },
  {
    id: "GT-2406-0137", customer: "Hoàng Văn Nam", items: "Táo Fuji 1kg, Cam sành 2kg",
    total: 119000, address: "Quận 5, TP.HCM", payment: "COD", time: "08:20 hôm nay", status: "Hoàn tất",
  },
  {
    id: "GT-2406-0136", customer: "Đỗ Mỹ Linh", items: "Dâu Đà Lạt 1kg",
    total: 120000, address: "Thủ Đức", payment: "Momo", time: "Hôm qua 22:14", status: "Đã hủy",
  },
];

const TABS = ["Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Hoàn tất", "Đã hủy"] as const;

function Orders() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Chờ xác nhận");
  const [active, setActive] = useState<typeof ORDERS[number] | null>(null);
  const filtered = ORDERS.filter((o) => o.status === tab);

  return (
    <PartnerShell title="Quản lý đơn hàng" subtitle="Cập nhật trạng thái và xử lý đơn của khách">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map((t) => {
          const count = ORDERS.filter((o) => o.status === t).length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                active ? "gt-gradient text-white gt-shadow" : "bg-white border border-border text-foreground/70"
              }`}
            >
              {t}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/30" : "bg-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Mã đơn</th>
              <th className="text-left p-3">Khách hàng</th>
              <th className="text-left p-3">Sản phẩm</th>
              <th className="text-right p-3">Tổng tiền</th>
              <th className="text-left p-3">Thanh toán</th>
              <th className="text-left p-3">Thời gian</th>
              <th className="text-right p-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="p-3 font-bold text-[oklch(0.45_0.17_145)]">{o.id}</td>
                <td className="p-3">
                  <p className="font-semibold">{o.customer}</p>
                  <p className="text-xs text-muted-foreground">{o.address}</p>
                </td>
                <td className="p-3 text-muted-foreground max-w-[200px] truncate">{o.items}</td>
                <td className="p-3 text-right font-bold">{o.total.toLocaleString("vi-VN")}đ</td>
                <td className="p-3">{o.payment}</td>
                <td className="p-3 text-muted-foreground">{o.time}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    {tab === "Chờ xác nhận" && (
                      <>
                        <button className="px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Xác nhận
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Từ chối
                        </button>
                      </>
                    )}
                    {tab === "Đang chuẩn bị" && (
                      <button className="px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold flex items-center gap-1">
                        <Truck className="h-3 w-3" /> Giao hàng
                      </button>
                    )}
                    {tab === "Đang giao" && (
                      <button className="px-2.5 py-1.5 rounded-lg gt-gradient text-white text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Đã giao
                      </button>
                    )}
                    <button
                      onClick={() => setActive(o)}
                      className="px-2.5 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  Không có đơn nào trong trạng thái này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && <OrderDrawer order={active} onClose={() => setActive(null)} />}
    </PartnerShell>
  );
}

function OrderDrawer({ order, onClose }: { order: typeof ORDERS[number]; onClose: () => void }) {
  const timeline = [
    { label: "Khách đặt đơn", time: order.time, done: true },
    { label: "Cửa hàng xác nhận", time: "—", done: order.status !== "Chờ xác nhận" },
    { label: "Đang chuẩn bị", time: "—", done: ["Đang giao", "Hoàn tất"].includes(order.status) },
    { label: "Đang giao", time: "—", done: ["Đang giao", "Hoàn tất"].includes(order.status) },
    { label: "Hoàn tất", time: "—", done: order.status === "Hoàn tất" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-white overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold">{order.id}</h3>
            <StatusBadge status={order.status} />
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <Section title="Khách hàng">
            <p className="font-semibold">{order.customer}</p>
            <p className="text-sm text-muted-foreground">0909 123 456</p>
          </Section>
          <Section title="Sản phẩm">
            <div className="rounded-xl bg-[oklch(0.98_0.02_100)] p-3 text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" /> {order.items}
            </div>
          </Section>
          <Section title="Giao hàng">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{order.address}</span>
            </div>
          </Section>
          <Section title="Thanh toán">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> {order.payment}</span>
              <span className="font-extrabold text-base text-[oklch(0.45_0.17_145)]">
                {order.total.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </Section>
          <Section title="Tiến trình">
            <ol className="space-y-3">
              {timeline.map((t) => (
                <li key={t.label} className="flex gap-3">
                  <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${
                    t.done ? "gt-gradient text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {t.done ? "✓" : <Clock className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Ghi chú cửa hàng">
            <textarea
              rows={3}
              placeholder="Thêm ghi chú nội bộ về đơn hàng..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm"
            />
          </Section>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-border p-4 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="h-11 rounded-xl border border-border font-semibold text-sm">Đóng</button>
          <button className="h-11 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow">
            Cập nhật trạng thái
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">{title}</p>
      {children}
    </div>
  );
}