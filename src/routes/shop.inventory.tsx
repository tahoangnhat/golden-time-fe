import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PackagePlus, ShieldCheck, Clock3 } from "lucide-react";
import { PartnerShell, StatusBadge } from "@/components/PartnerShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/shop/inventory")({
  head: () => ({ meta: [{ title: "Tồn kho — Golden Time Partner" }] }),
  component: Inventory,
});

const INV = [
  { emoji: "🍎", name: "Táo Fuji", stock: 4, threshold: 10, intake: "18/06/2026", expire: "25/06/2026", status: "Sắp hết" },
  { emoji: "🍊", name: "Cam sành", stock: 20, threshold: 10, intake: "19/06/2026", expire: "28/06/2026", status: "Còn hàng" },
  { emoji: "🥭", name: "Xoài cát", stock: 15, threshold: 8, intake: "17/06/2026", expire: "23/06/2026", status: "Còn hàng" },
  { emoji: "🍌", name: "Chuối già", stock: 40, threshold: 15, intake: "19/06/2026", expire: "24/06/2026", status: "Còn hàng" },
  { emoji: "🍇", name: "Nho mẫu đơn", stock: 6, threshold: 8, intake: "18/06/2026", expire: "22/06/2026", status: "Sắp hết" },
  { emoji: "🍓", name: "Dâu Đà Lạt", stock: 0, threshold: 5, intake: "15/06/2026", expire: "20/06/2026", status: "Hết hàng" },
];

function Inventory() {
  return (
    <PartnerShell title="Quản lý tồn kho" subtitle="Theo dõi số lượng và chất lượng sản phẩm trong kho">
      {/* Warning cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <WarnCard
          tone="orange"
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Sắp hết hàng"
          count={2}
          hint="Táo Fuji, Nho mẫu đơn"
        />
        <WarnCard
          tone="yellow"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Cần kiểm tra chất lượng"
          count={1}
          hint="Dâu Đà Lạt đã quá hạn"
        />
        <WarnCard
          tone="primary"
          icon={<Clock3 className="h-5 w-5" />}
          title="Sắp quá thời gian bán tốt nhất"
          count={3}
          hint="Trong 3 ngày tới"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center gap-1.5 gt-shadow">
          <PackagePlus className="h-4 w-4" /> Nhập thêm hàng
        </button>
      </div>

      <div className="mt-3 bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Sản phẩm</th>
              <th className="text-right p-3">Tồn hiện tại</th>
              <th className="text-right p-3">Ngưỡng cảnh báo</th>
              <th className="text-left p-3">Ngày nhập</th>
              <th className="text-left p-3">Hạn sử dụng tốt nhất</th>
              <th className="text-center p-3">Trạng thái</th>
              <th className="text-right p-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INV.map((i) => (
              <tr key={i.name} className="hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <FruitThumb emoji={i.emoji} />
                    <span className="font-semibold">{i.name}</span>
                  </div>
                </td>
                <td className={`p-3 text-right font-bold ${i.stock <= i.threshold ? "text-orange-600" : ""}`}>
                  {i.stock} kg
                </td>
                <td className="p-3 text-right text-muted-foreground">{i.threshold} kg</td>
                <td className="p-3">{i.intake}</td>
                <td className="p-3">{i.expire}</td>
                <td className="p-3 text-center"><StatusBadge status={i.status} /></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1.5">
                    <button className="px-2.5 py-1.5 rounded-lg gt-gradient text-white text-xs font-semibold">
                      Cập nhật
                    </button>
                    <button className="px-2.5 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold">
                      Nhập thêm
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PartnerShell>
  );
}

function WarnCard({
  tone, icon, title, count, hint,
}: { tone: "orange" | "yellow" | "primary"; icon: React.ReactNode; title: string; count: number; hint: string }) {
  const tones: Record<string, string> = {
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    primary: "bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] border-[oklch(0.85_0.1_145)]",
  };
  return (
    <div className={`rounded-2xl p-4 border ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-white/70 grid place-items-center">{icon}</div>
        <span className="text-3xl font-extrabold">{count}</span>
      </div>
      <p className="font-bold mt-2">{title}</p>
      <p className="text-xs opacity-80">{hint}</p>
    </div>
  );
}