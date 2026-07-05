import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  ScanLine,
  CheckCircle2,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import {
  AdminShell,
  StatCard,
  SectionCard,
  MiniBarChart,
  MiniLineChart,
  StatusBadge,
  AdminTable,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const revenue7d = [
  { label: "T2", value: 32 },
  { label: "T3", value: 41 },
  { label: "T4", value: 38 },
  { label: "T5", value: 55 },
  { label: "T6", value: 62 },
  { label: "T7", value: 78 },
  { label: "CN", value: 71 },
];

const scans7d = [
  { label: "T2", value: 820 },
  { label: "T3", value: 940 },
  { label: "T4", value: 1120 },
  { label: "T5", value: 980 },
  { label: "T6", value: 1340 },
  { label: "T7", value: 1580 },
  { label: "CN", value: 1420 },
];

const topFruits = [
  { name: "Táo Fuji Nhật", scans: 4820, share: 92 },
  { name: "Xoài cát Hòa Lộc", scans: 4120, share: 80 },
  { name: "Bơ sáp Đắk Lắk", scans: 3650, share: 72 },
  { name: "Nho mẫu đơn Hàn", scans: 2980, share: 60 },
  { name: "Dâu tây Đà Lạt", scans: 2410, share: 48 },
];

const topShops = [
  { name: "Trái Cây Tươi Hà Nội", revenue: "₫184.5M", orders: 412 },
  { name: "Fruit Mart Sài Gòn", revenue: "₫162.0M", orders: 387 },
  { name: "Vườn Quê Đà Nẵng", revenue: "₫128.7M", orders: 295 },
  { name: "Hoa Quả Sạch Cần Thơ", revenue: "₫98.2M", orders: 221 },
];

const activities = [
  { type: "Người dùng mới", text: "Trần Thị Mai đã đăng ký", time: "2 phút trước", status: "Hoạt động" },
  { type: "Cửa hàng", text: "Vườn Quê Đà Nẵng đăng ký đối tác", time: "12 phút trước", status: "Chờ duyệt" },
  { type: "Đơn hàng", text: "Đơn #GT24891 từ Fruit Mart SG", time: "20 phút trước", status: "Chờ xác nhận" },
  { type: "Review", text: "Đánh giá 1 sao bị báo cáo - Shop Hoa Quả 24h", time: "35 phút trước", status: "Bị báo cáo" },
  { type: "Người dùng mới", text: "Phạm Văn Hùng đã đăng ký", time: "1 giờ trước", status: "Hoạt động" },
];

function AdminDashboard() {
  return (
    <AdminShell
      title="Tổng quan hệ thống"
      subtitle="Theo dõi sức khỏe toàn bộ nền tảng Golden Time"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Tổng người dùng" value="128,540" trend="+4.2%" tone="primary" icon={Users} />
        <StatCard label="Cửa hàng đối tác" value="1,247" trend="+12" tone="orange" icon={Store} />
        <StatCard label="Tổng đơn hàng" value="89,210" trend="+8.7%" tone="blue" icon={ShoppingBag} />
        <StatCard label="Doanh thu hôm nay" value="₫184.5M" trend="+15.3%" tone="primary" icon={DollarSign} />
        <StatCard label="Lượt quét AI hôm nay" value="1,420" trend="+22%" tone="yellow" icon={ScanLine} />
        <StatCard label="Tỷ lệ hoàn tất" value="94.2%" trend="+1.1%" tone="primary" icon={CheckCircle2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <SectionCard
          title="Doanh thu 7 ngày (triệu ₫)"
          className="lg:col-span-2"
          action={
            <span className="text-xs text-[oklch(0.55_0.18_145)] font-semibold flex items-center gap-1">
              +18.4% so với tuần trước <ArrowUpRight className="h-3 w-3" />
            </span>
          }
        >
          <MiniBarChart data={revenue7d} />
        </SectionCard>
        <SectionCard title="Lượt quét AI 7 ngày">
          <MiniLineChart data={scans7d} />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <SectionCard title="Top trái cây được quét nhiều nhất">
          <ul className="space-y-3">
            {topFruits.map((f) => (
              <li key={f.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{f.name}</span>
                  <span className="text-muted-foreground">{f.scans.toLocaleString()} lượt</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full gt-gradient rounded-full"
                    style={{ width: `${f.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Top cửa hàng doanh thu cao">
          <ul className="divide-y divide-border">
            {topShops.map((s, i) => (
              <li key={s.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-9 w-9 rounded-xl gt-gradient grid place-items-center text-white font-extrabold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.orders} đơn hàng</p>
                </div>
                <span className="font-extrabold text-sm">{s.revenue}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard
          title="Hoạt động gần đây"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> 3 mục cần xử lý
            </span>
          }
        >
          <AdminTable
            head={
              <>
                <th className="py-2 pr-3">Loại</th>
                <th className="py-2 pr-3">Nội dung</th>
                <th className="py-2 pr-3">Thời gian</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2 pr-3 text-right">Hành động</th>
              </>
            }
          >
            {activities.map((a, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="py-3 pr-3 font-semibold text-xs">{a.type}</td>
                <td className="py-3 pr-3">{a.text}</td>
                <td className="py-3 pr-3 text-muted-foreground text-xs">{a.time}</td>
                <td className="py-3 pr-3"><StatusBadge status={a.status} /></td>
                <td className="py-3 pr-3 text-right">
                  <button className="text-xs font-semibold text-[oklch(0.55_0.18_145)] hover:underline">
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </SectionCard>
      </div>
    </AdminShell>
  );
}