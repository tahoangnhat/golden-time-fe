import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Eye, Check, X, Lock, Package, Star } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  FilterBar,
  StatusBadge,
  SectionCard,
  Modal,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/shops")({
  component: AdminShops,
});

const SHOPS = [
  { id: 1, name: "Trái Cây Tươi Hà Nội", owner: "Nguyễn Văn An", area: "Hà Nội", products: 124, rating: 4.8, status: "Đã duyệt", revenue: "₫184.5M" },
  { id: 2, name: "Fruit Mart Sài Gòn", owner: "Trần Thị Bình", area: "TP. HCM", products: 98, rating: 4.7, status: "Đã duyệt", revenue: "₫162.0M" },
  { id: 3, name: "Vườn Quê Đà Nẵng", owner: "Lê Minh Châu", area: "Đà Nẵng", products: 67, rating: 4.6, status: "Chờ duyệt", revenue: "₫0" },
  { id: 4, name: "Hoa Quả Sạch Cần Thơ", owner: "Phạm Văn Dũng", area: "Cần Thơ", products: 82, rating: 4.5, status: "Đã duyệt", revenue: "₫98.2M" },
  { id: 5, name: "Vựa Trái Cây Mộc Châu", owner: "Hoàng Thị Em", area: "Sơn La", products: 41, rating: 4.9, status: "Chờ duyệt", revenue: "₫0" },
  { id: 6, name: "Hoa Quả 24h Hà Đông", owner: "Đỗ Quốc Phong", area: "Hà Nội", products: 56, rating: 3.2, status: "Đã khóa", revenue: "₫42.1M" },
  { id: 7, name: "Tropical Fruit Nha Trang", owner: "Bùi Mỹ Linh", area: "Khánh Hòa", products: 73, rating: 4.4, status: "Đã duyệt", revenue: "₫76.3M" },
];

function AdminShops() {
  const [filter, setFilter] = useState("Tất cả");
  const [sel, setSel] = useState<typeof SHOPS[number] | null>(null);

  const filtered = SHOPS.filter((s) => filter === "Tất cả" || s.status === filter);

  return (
    <AdminShell title="Quản lý cửa hàng đối tác" subtitle={`${SHOPS.length} cửa hàng • 2 đang chờ duyệt`}>
      <FilterBar>
        <div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm cửa hàng, chủ shop..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        {["Tất cả", "Đã duyệt", "Chờ duyệt", "Đã khóa"].map((s) => (
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

      <SectionCard title={`Cửa hàng (${filtered.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">Tên cửa hàng</th>
              <th className="py-2 pr-3">Chủ cửa hàng</th>
              <th className="py-2 pr-3">Khu vực</th>
              <th className="py-2 pr-3 text-right">Sản phẩm</th>
              <th className="py-2 pr-3 text-right">Rating</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3 text-right">Doanh thu</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-muted/30">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl gt-gradient grid place-items-center text-white text-sm">🍊</div>
                  <span className="font-semibold">{s.name}</span>
                </div>
              </td>
              <td className="py-3 pr-3">{s.owner}</td>
              <td className="py-3 pr-3 text-muted-foreground">{s.area}</td>
              <td className="py-3 pr-3 text-right font-semibold">{s.products}</td>
              <td className="py-3 pr-3 text-right">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {s.rating}
                </span>
              </td>
              <td className="py-3 pr-3"><StatusBadge status={s.status} /></td>
              <td className="py-3 pr-3 text-right font-extrabold">{s.revenue}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => setSel(s)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem chi tiết">
                    <Eye className="h-4 w-4" />
                  </button>
                  {s.status === "Chờ duyệt" && (
                    <>
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-green-50 text-green-600" title="Duyệt">
                        <Check className="h-4 w-4" />
                      </button>
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600" title="Từ chối">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem sản phẩm">
                    <Package className="h-4 w-4" />
                  </button>
                  {s.status === "Đã duyệt" && (
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600" title="Khóa">
                      <Lock className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Chi tiết cửa hàng" maxWidth="max-w-3xl">
        {sel && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl gt-gradient grid place-items-center text-white text-2xl">🍊</div>
              <div className="flex-1">
                <h4 className="font-extrabold text-lg">{sel.name}</h4>
                <p className="text-sm text-muted-foreground">Chủ: {sel.owner}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={sel.status} />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {sel.rating} (284 đánh giá)
                  </span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Liên hệ & Địa chỉ</p>
                <p>📍 142 Nguyễn Trãi, {sel.area}</p>
                <p>📞 0912 345 678</p>
                <p>✉️ contact@{sel.name.toLowerCase().replace(/\s+/g, "")}.vn</p>
                <p>🕐 06:00 - 22:00 hàng ngày</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Giấy phép kinh doanh</p>
                <p>Số GPKD: <span className="font-mono">0108{sel.id}45678</span></p>
                <p>Ngày cấp: 14/06/2023</p>
                <p>Nơi cấp: Sở KH&ĐT {sel.area}</p>
                <a className="text-[oklch(0.55_0.18_145)] font-semibold cursor-pointer">Xem ảnh giấy phép →</a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[oklch(0.95_0.06_145)] rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Sản phẩm</p>
                <p className="font-extrabold text-lg">{sel.products}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Đơn hàng tháng</p>
                <p className="font-extrabold text-lg">412</p>
              </div>
              <div className="bg-[oklch(0.97_0.12_95)] rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Doanh thu tháng</p>
                <p className="font-extrabold text-lg">{sel.revenue}</p>
              </div>
            </div>
            {sel.status === "Chờ duyệt" && (
              <div className="flex gap-2">
                <button className="flex-1 h-11 rounded-xl gt-gradient text-white font-semibold">Duyệt cửa hàng</button>
                <button className="flex-1 h-11 rounded-xl border border-red-200 text-red-600 font-semibold">Từ chối</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}