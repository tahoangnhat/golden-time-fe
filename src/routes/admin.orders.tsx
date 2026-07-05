import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Eye } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  FilterBar,
  StatusBadge,
  SectionCard,
  Drawer,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const ORDERS = [
  { id: "GT24891", customer: "Nguyễn Thị Hồng", shop: "Trái Cây Tươi HN", total: 285000, status: "Chờ xác nhận", payment: "MoMo", time: "10:42 21/06" },
  { id: "GT24890", customer: "Trần Văn Minh", shop: "Fruit Mart SG", total: 462000, status: "Đang chuẩn bị", payment: "VNPay", time: "10:28 21/06" },
  { id: "GT24889", customer: "Lê Thị Mai", shop: "Vườn Quê ĐN", total: 178000, status: "Đang giao", payment: "COD", time: "09:55 21/06" },
  { id: "GT24888", customer: "Phạm Quốc Hùng", shop: "Hoa Quả Sạch CT", total: 728000, status: "Hoàn tất", payment: "ZaloPay", time: "08:12 21/06" },
  { id: "GT24887", customer: "Võ Thị Lan", shop: "Trái Cây Tươi HN", total: 154000, status: "Đã hủy", payment: "MoMo", time: "07:30 21/06" },
  { id: "GT24886", customer: "Hoàng Thị Yến", shop: "Vựa Mộc Châu", total: 312000, status: "Hoàn tất", payment: "VNPay", time: "20:14 20/06" },
  { id: "GT24885", customer: "Bùi Thanh Tùng", shop: "Tropical NT", total: 524000, status: "Hoàn tất", payment: "COD", time: "19:42 20/06" },
];

const STATUSES = ["Tất cả", "Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Hoàn tất", "Đã hủy"];

function AdminOrders() {
  const [filter, setFilter] = useState("Tất cả");
  const [sel, setSel] = useState<typeof ORDERS[number] | null>(null);
  const filtered = ORDERS.filter((o) => filter === "Tất cả" || o.status === filter);

  return (
    <AdminShell title="Quản lý đơn hàng" subtitle={`${ORDERS.length} đơn trong hôm nay`}>
      <FilterBar>
        <div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm mã đơn, khách hàng..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`h-9 px-3 rounded-lg text-sm font-semibold ${
              filter === s ? "gt-gradient text-white" : "bg-muted text-foreground/70 hover:bg-muted/70"
            }`}
          >
            {s}
          </button>
        ))}
      </FilterBar>

      <SectionCard title={`Đơn hàng (${filtered.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">Mã đơn</th>
              <th className="py-2 pr-3">Khách hàng</th>
              <th className="py-2 pr-3">Cửa hàng</th>
              <th className="py-2 pr-3 text-right">Tổng tiền</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3">Thanh toán</th>
              <th className="py-2 pr-3">Thời gian</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {filtered.map((o) => (
            <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSel(o)}>
              <td className="py-3 pr-3 font-mono font-semibold text-[oklch(0.55_0.18_145)]">#{o.id}</td>
              <td className="py-3 pr-3">{o.customer}</td>
              <td className="py-3 pr-3 text-muted-foreground">{o.shop}</td>
              <td className="py-3 pr-3 text-right font-extrabold">{o.total.toLocaleString("vi-VN")}₫</td>
              <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
              <td className="py-3 pr-3 text-xs">{o.payment}</td>
              <td className="py-3 pr-3 text-xs text-muted-foreground">{o.time}</td>
              <td className="py-3 pr-3 text-right">
                <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted ml-auto"><Eye className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel ? `Đơn hàng #${sel.id}` : ""}>
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={sel.status} />
              <span className="text-xs text-muted-foreground">{sel.time}</span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Khách hàng</p>
              <div className="bg-muted/40 rounded-xl p-3 text-sm space-y-1">
                <p className="font-semibold">{sel.customer}</p>
                <p className="text-muted-foreground">📞 0987 123 456</p>
                <p className="text-muted-foreground">📍 142 Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Sản phẩm ({sel.shop})</p>
              <ul className="space-y-2">
                {[
                  { emoji: "🍎", name: "Táo Fuji Nhật", qty: 1, price: 165000 },
                  { emoji: "🥭", name: "Xoài cát Hòa Lộc", qty: 0.5, price: 44500 },
                  { emoji: "🍓", name: "Dâu tây Đà Lạt", qty: 0.5, price: 72500 },
                ].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 rounded-lg bg-white grid place-items-center text-xl">{p.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.qty} kg</p>
                    </div>
                    <p className="text-sm font-bold">{p.price.toLocaleString("vi-VN")}₫</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Tạm tính</span><span>{(sel.total - 25000).toLocaleString("vi-VN")}₫</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Phí giao hàng</span><span>25.000₫</span></div>
                <div className="flex justify-between font-extrabold text-base"><span>Tổng cộng</span><span>{sel.total.toLocaleString("vi-VN")}₫</span></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Phương thức thanh toán</p>
              <p className="text-sm bg-muted/40 rounded-xl p-3">{sel.payment}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Ghi chú từ shop</p>
              <p className="text-sm bg-yellow-50 rounded-xl p-3 italic">"Đã chuẩn bị trái cây tươi, giao trong 30 phút."</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Timeline</p>
              <ol className="space-y-2 text-sm">
                {["Đặt hàng", "Shop xác nhận", "Đang chuẩn bị", "Đang giao", "Hoàn tất"].map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ${
                      i <= 2 ? "gt-gradient text-white" : "bg-muted text-muted-foreground"
                    }`}>{i + 1}</div>
                    <span className={i <= 2 ? "font-semibold" : "text-muted-foreground"}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </AdminShell>
  );
}