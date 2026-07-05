import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Check, EyeOff, Trash2, AlertCircle } from "lucide-react";
import { AdminShell, FilterBar, StatusBadge } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

const REVIEWS = [
  { user: "Nguyễn T. Hồng", shop: "Trái Cây Tươi HN", rating: 5, comment: "Trái cây rất tươi, giao nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp!", emoji: "🍎", status: "Chờ duyệt" },
  { user: "Trần V. Minh", shop: "Fruit Mart SG", rating: 4, comment: "Xoài ngọt nhưng có 1 trái hơi bị dập. Nhìn chung vẫn ổn.", emoji: "🥭", status: "Đã duyệt" },
  { user: "Phạm Q. Hùng", shop: "Hoa Quả 24h", rating: 1, comment: "Trái cây không tươi như hình. Yêu cầu hoàn tiền!", emoji: "🍓", status: "Bị báo cáo" },
  { user: "Lê T. Mai", shop: "Vườn Quê ĐN", rating: 5, comment: "Bơ chín đều, béo ngậy, đúng chuẩn Đắk Lắk. 10đ!", emoji: "🥑", status: "Đã duyệt" },
  { user: "Võ T. Lan", shop: "Vựa Mộc Châu", rating: 2, comment: "Đóng gói sơ sài, dâu tây bị nát một nửa khi nhận.", emoji: "🍓", status: "Bị báo cáo" },
  { user: "Hoàng T. Yến", shop: "Trái Cây Tươi HN", rating: 5, comment: "Nho mẫu đơn ngon xuất sắc, giòn ngọt. Đáng đồng tiền.", emoji: "🍇", status: "Đã duyệt" },
  { user: "Bùi T. Tùng", shop: "Tropical NT", rating: 3, comment: "Bình thường, không có gì đặc biệt.", emoji: "🍊", status: "Đã ẩn" },
];

function AdminReviews() {
  const [filter, setFilter] = useState("Tất cả");
  const filtered = REVIEWS.filter((r) => filter === "Tất cả" || r.status === filter);

  return (
    <AdminShell title="Kiểm duyệt đánh giá" subtitle={`${REVIEWS.length} đánh giá • 1 chờ duyệt • 2 bị báo cáo`}>
      <FilterBar>
        {["Tất cả", "Chờ duyệt", "Bị báo cáo", "Đã ẩn", "Đã duyệt"].map((s) => (
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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full gt-gradient grid place-items-center text-white font-bold text-sm shrink-0">
                  {r.user.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.user}</p>
                  <p className="text-xs text-muted-foreground truncate">về {r.shop}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="ml-1 text-xs font-bold">{r.rating}.0</span>
              </div>
              <p className="text-sm mt-2 leading-relaxed">{r.comment}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-16 w-16 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-3xl">{r.emoji}</div>
                <p className="text-[11px] text-muted-foreground">Ảnh trái cây<br />đính kèm</p>
              </div>
              {r.status === "Bị báo cáo" && (
                <div className="mt-3 bg-red-50 rounded-xl p-2 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>3 người đã báo cáo nội dung không phù hợp</span>
                </div>
              )}
            </div>
            <div className="border-t border-border px-4 py-2 flex items-center gap-1">
              <button className="flex-1 h-8 rounded-lg hover:bg-green-50 text-green-600 text-xs font-semibold flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" /> Duyệt
              </button>
              <button className="flex-1 h-8 rounded-lg hover:bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center gap-1">
                <EyeOff className="h-3.5 w-3.5" /> Ẩn
              </button>
              <button className="flex-1 h-8 rounded-lg hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-center gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Xóa
              </button>
              <button className="flex-1 h-8 rounded-lg hover:bg-orange-50 text-orange-600 text-xs font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Cảnh báo
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}