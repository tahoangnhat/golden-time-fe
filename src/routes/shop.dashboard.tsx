import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  Star,
  MapPin,
  TrendingUp,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { PartnerShell, StatCard } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/dashboard")({
  head: () => ({ meta: [{ title: "Tổng quan — Golden Time Partner" }] }),
  component: Dashboard,
});

const revenue7d = [
  { d: "T2", v: 1.8 },
  { d: "T3", v: 2.4 },
  { d: "T4", v: 2.1 },
  { d: "T5", v: 3.2 },
  { d: "T6", v: 2.9 },
  { d: "T7", v: 4.5 },
  { d: "CN", v: 3.8 },
];
const max = Math.max(...revenue7d.map((r) => r.v));

const statusBreak = [
  { label: "Chờ xác nhận", count: 3, color: "bg-yellow-400" },
  { label: "Đang chuẩn bị", count: 5, color: "bg-blue-400" },
  { label: "Đang giao", count: 4, color: "bg-orange-400" },
  { label: "Hoàn tất", count: 28, color: "bg-green-500" },
  { label: "Đã hủy", count: 2, color: "bg-red-400" },
];
const totalOrders = statusBreak.reduce((a, b) => a + b.count, 0);

const topProducts = [
  { name: "Táo Fuji", sold: 142, revenue: 6958000 },
  { name: "Xoài cát Hòa Lộc", sold: 96, revenue: 6240000 },
  { name: "Cam sành Vĩnh Long", sold: 88, revenue: 3080000 },
  { name: "Nho mẫu đơn", sold: 32, revenue: 6368000 },
];

function Dashboard() {
  return (
    <PartnerShell title="Tổng quan cửa hàng" subtitle="Chào buổi sáng, Trái Cây Tươi 👋">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Doanh thu hôm nay" value="3.850.000đ" hint="+12% so với hôm qua" tone="primary" icon={DollarSign} />
        <StatCard label="Đơn hàng mới" value="14" hint="3 đơn chờ xác nhận" tone="orange" icon={ShoppingBag} />
        <StatCard label="Sản phẩm đang bán" value="28" hint="4 mới cập nhật" tone="primary" icon={Package} />
        <StatCard label="Sản phẩm sắp hết" value="3" hint="Cần nhập thêm" tone="orange" icon={AlertTriangle} />
        <StatCard label="Đánh giá trung bình" value="4.8 ★" hint="trên 312 đánh giá" tone="yellow" icon={Star} />
        <StatCard label="Lượt hiển thị bản đồ" value="1.247" hint="trong 7 ngày qua" tone="neutral" icon={MapPin} />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Doanh thu 7 ngày</h3>
              <p className="text-xs text-muted-foreground">Đơn vị: triệu đồng</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +18,4%
            </span>
          </div>
          <div className="mt-6 flex items-end gap-3 h-44">
            {revenue7d.map((r) => (
              <div key={r.d} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg gt-gradient transition-all"
                  style={{ height: `${(r.v / max) * 100}%` }}
                />
                <span className="text-[11px] text-muted-foreground font-medium">{r.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Đơn theo trạng thái</h3>
          <p className="text-xs text-muted-foreground">Tổng {totalOrders} đơn tuần này</p>
          <div className="mt-4 space-y-3">
            {statusBreak.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color}`}
                    style={{ width: `${(s.count / totalOrders) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Top sản phẩm bán chạy</h3>
          <div className="mt-4 divide-y divide-border">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-3">
                <div className="h-9 w-9 rounded-lg bg-[oklch(0.97_0.04_95)] grid place-items-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Đã bán {p.sold} kg</p>
                </div>
                <p className="font-extrabold text-sm text-[oklch(0.45_0.17_145)]">
                  {p.revenue.toLocaleString("vi-VN")}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Cần xử lý ngay</h3>
          <div className="mt-3 space-y-2">
            <AlertRow
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="orange"
              title="Táo Fuji sắp hết hàng"
              hint="Còn 4kg trong kho"
              cta="Nhập thêm"
              to="/shop/inventory"
            />
            <AlertRow
              icon={<ShoppingBag className="h-4 w-4" />}
              tone="yellow"
              title="3 đơn hàng đang chờ xác nhận"
              hint="Khách đặt trong 15 phút qua"
              cta="Xác nhận"
              to="/shop/orders"
            />
            <AlertRow
              icon={<MessageCircle className="h-4 w-4" />}
              tone="primary"
              title="2 đánh giá mới từ khách hàng"
              hint="Bạn chưa phản hồi"
              cta="Trả lời"
              to="/shop/reviews"
            />
            <AlertRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="neutral"
              title="Hồ sơ cửa hàng đã được duyệt"
              hint="Bạn nhận huy hiệu Đối tác Vàng"
            />
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}

function AlertRow({
  icon,
  tone,
  title,
  hint,
  cta,
  to,
}: {
  icon: React.ReactNode;
  tone: "orange" | "yellow" | "primary" | "neutral";
  title: string;
  hint: string;
  cta?: string;
  to?: string;
}) {
  const tones: Record<string, string> = {
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-yellow-50 text-yellow-700",
    primary: "bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)]",
    neutral: "bg-muted text-foreground",
  };
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[oklch(0.98_0.02_100)] border border-border">
      <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${tones[tone]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {cta && to && (
        <Link to={to} className="text-xs font-semibold text-[oklch(0.45_0.17_145)] shrink-0">
          {cta} →
        </Link>
      )}
    </div>
  );
}