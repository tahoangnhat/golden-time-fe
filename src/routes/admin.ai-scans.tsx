import { createFileRoute } from "@tanstack/react-router";
import { ScanLine, CheckCircle2, Apple, AlertTriangle, Eye, Flag, Sparkles } from "lucide-react";
import {
  AdminShell,
  StatCard,
  SectionCard,
  AdminTable,
  StatusBadge,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/ai-scans")({
  component: AdminAIScans,
});

const SCANS = [
  { emoji: "🍎", fruit: "Táo Fuji", fresh: 96, quality: 94, conf: 98, user: "Nguyễn T. Hồng", time: "10:42", status: "Thành công" },
  { emoji: "🥭", fruit: "Xoài cát", fresh: 88, quality: 91, conf: 95, user: "Trần V. Minh", time: "10:38", status: "Thành công" },
  { emoji: "🍇", fruit: "Nho mẫu đơn", fresh: 92, quality: 95, conf: 97, user: "Lê T. Mai", time: "10:30", status: "Thành công" },
  { emoji: "🍓", fruit: "Dâu tây", fresh: 72, quality: 68, conf: 84, user: "Phạm Q. Hùng", time: "10:22", status: "Báo cáo sai" },
  { emoji: "🥑", fruit: "Bơ sáp", fresh: 90, quality: 92, conf: 96, user: "Võ T. Lan", time: "10:18", status: "Thành công" },
  { emoji: "🍊", fruit: "Cam sành", fresh: 84, quality: 82, conf: 89, user: "Hoàng T. Yến", time: "10:05", status: "Thành công" },
  { emoji: "🍌", fruit: "Chuối Laba", fresh: 65, quality: 60, conf: 71, user: "Bùi T. Tùng", time: "09:58", status: "Báo cáo sai" },
];

function AdminAIScans() {
  return (
    <AdminShell title="Dữ liệu AI quét trái cây" subtitle="Giám sát hiệu năng mô hình Vision AI">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng lượt quét" value="85,420" trend="+22%" tone="primary" icon={ScanLine} />
        <StatCard label="Tỷ lệ nhận diện thành công" value="96.4%" trend="+0.8%" tone="primary" icon={CheckCircle2} />
        <StatCard label="Loại trái cây quét nhiều nhất" value="Táo Fuji" hint="14,820 lượt" tone="yellow" icon={Apple} />
        <StatCard label="Kết quả bị báo cáo sai" value="248" hint="0.3% tổng lượt" tone="orange" icon={AlertTriangle} />
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-yellow-800">Lưu ý quan trọng</p>
          <p className="text-xs text-yellow-700">
            Kết quả AI chỉ mang tính hỗ trợ tham khảo. Quyết định mua hàng cuối cùng thuộc về người dùng.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <SectionCard title={`Lượt quét gần đây (${SCANS.length})`}>
          <AdminTable
            head={
              <>
                <th className="py-2 pr-3">Ảnh</th>
                <th className="py-2 pr-3">Loại trái cây</th>
                <th className="py-2 pr-3 text-right">Freshness</th>
                <th className="py-2 pr-3 text-right">Quality</th>
                <th className="py-2 pr-3 text-right">Confidence</th>
                <th className="py-2 pr-3">Người dùng</th>
                <th className="py-2 pr-3">Thời gian</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2 pr-3 text-right">Hành động</th>
              </>
            }
          >
            {SCANS.map((s, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="py-3 pr-3">
                  <div className="h-11 w-11 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-2xl">{s.emoji}</div>
                </td>
                <td className="py-3 pr-3 font-semibold">{s.fruit}</td>
                <td className="py-3 pr-3 text-right">
                  <Score v={s.fresh} />
                </td>
                <td className="py-3 pr-3 text-right"><Score v={s.quality} /></td>
                <td className="py-3 pr-3 text-right"><Score v={s.conf} /></td>
                <td className="py-3 pr-3 text-sm">{s.user}</td>
                <td className="py-3 pr-3 text-xs text-muted-foreground">{s.time} hôm nay</td>
                <td className="py-3 pr-3"><StatusBadge status={s.status} /></td>
                <td className="py-3 pr-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem chi tiết"><Eye className="h-4 w-4" /></button>
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600" title="Đánh dấu sai"><Flag className="h-4 w-4" /></button>
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-green-50 text-green-600" title="Gửi dữ liệu cải thiện AI"><Sparkles className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </SectionCard>
      </div>
    </AdminShell>
  );
}

function Score({ v }: { v: number }) {
  const tone = v >= 90 ? "bg-green-100 text-green-700" : v >= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${tone}`}>{v}</span>;
}