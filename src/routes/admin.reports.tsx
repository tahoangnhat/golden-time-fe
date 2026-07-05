import { createFileRoute } from "@tanstack/react-router";
import { Download, TrendingUp, ScanLine, Users } from "lucide-react";
import {
  AdminShell,
  SectionCard,
  MiniBarChart,
  MiniLineChart,
  StatCard,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const revenue30 = Array.from({ length: 14 }, (_, i) => ({
  label: `${i + 8}`,
  value: 40 + Math.round(Math.sin(i / 2) * 18 + i * 2.4),
}));
const commission = Array.from({ length: 14 }, (_, i) => ({
  label: `${i + 8}`,
  value: 4 + Math.round(Math.sin(i / 2) * 2 + i * 0.25),
}));
const userGrowth = Array.from({ length: 14 }, (_, i) => ({
  label: `${i + 8}`,
  value: 1000 + i * 220 + Math.round(Math.sin(i) * 80),
}));
const scanGrowth = Array.from({ length: 14 }, (_, i) => ({
  label: `${i + 8}`,
  value: 800 + i * 140 + Math.round(Math.cos(i) * 100),
}));

function AdminReports() {
  return (
    <AdminShell
      title="Báo cáo kinh doanh"
      subtitle="Tổng hợp 14 ngày gần nhất"
      actions={
        <>
          <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm font-medium">
            <option>14 ngày qua</option><option>30 ngày qua</option><option>3 tháng qua</option><option>Năm nay</option>
          </select>
          <button className="h-9 px-4 rounded-lg gt-gradient text-white text-sm font-semibold flex items-center gap-1.5">
            <Download className="h-4 w-4" /> Xuất báo cáo
          </button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value="₫2.84 tỷ" trend="+18.4%" tone="primary" icon={TrendingUp} />
        <StatCard label="Hoa hồng GT" value="₫284M" trend="+18.4%" tone="orange" icon={TrendingUp} />
        <StatCard label="Người dùng mới" value="3,420" trend="+24%" tone="blue" icon={Users} />
        <StatCard label="Tổng lượt quét AI" value="18,540" trend="+22%" tone="yellow" icon={ScanLine} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <SectionCard title="Doanh thu (triệu ₫)"><MiniBarChart data={revenue30} /></SectionCard>
        <SectionCard title="Hoa hồng nền tảng (triệu ₫)">
          <MiniBarChart data={commission} color="oklch(0.72 0.18 55)" />
        </SectionCard>
        <SectionCard title="Tăng trưởng người dùng">
          <MiniLineChart data={userGrowth} color="oklch(0.62 0.17 145)" />
        </SectionCard>
        <SectionCard title="Tăng trưởng lượt quét AI">
          <MiniLineChart data={scanGrowth} color="oklch(0.72 0.18 55)" />
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <SectionCard title="Top 5 cửa hàng doanh thu cao">
          <ul className="divide-y divide-border">
            {[
              { n: "Trái Cây Tươi HN", v: "₫184.5M" },
              { n: "Fruit Mart SG", v: "₫162.0M" },
              { n: "Vườn Quê ĐN", v: "₫128.7M" },
              { n: "Hoa Quả Sạch CT", v: "₫98.2M" },
              { n: "Tropical NT", v: "₫76.3M" },
            ].map((s, i) => (
              <li key={s.n} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-8 w-8 rounded-lg gt-gradient grid place-items-center text-white font-bold text-xs">{i + 1}</div>
                <span className="flex-1 font-semibold text-sm">{s.n}</span>
                <span className="font-extrabold">{s.v}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Top 5 trái cây bán chạy">
          <ul className="divide-y divide-border">
            {[
              { e: "🍎", n: "Táo Fuji", v: "8,420 kg" },
              { e: "🥭", n: "Xoài cát Hòa Lộc", v: "6,210 kg" },
              { e: "🥑", n: "Bơ sáp Đắk Lắk", v: "5,180 kg" },
              { e: "🍇", n: "Nho mẫu đơn", v: "3,920 kg" },
              { e: "🍓", n: "Dâu tây Đà Lạt", v: "3,240 hộp" },
            ].map((s) => (
              <li key={s.n} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-9 w-9 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-xl">{s.e}</div>
                <span className="flex-1 font-semibold text-sm">{s.n}</span>
                <span className="font-extrabold">{s.v}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AdminShell>
  );
}