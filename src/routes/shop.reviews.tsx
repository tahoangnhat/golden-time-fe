import { createFileRoute } from "@tanstack/react-router";
import { Star, MessageCircle, Flag, Eye } from "lucide-react";
import { PartnerShell } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/reviews")({
  head: () => ({ meta: [{ title: "Đánh giá — Golden Time Partner" }] }),
  component: Reviews,
});

const REVIEWS = [
  { name: "Nguyễn Thị Hương", rating: 5, fruit: "Táo Fuji", comment: "Táo rất ngon, giòn ngọt, đóng gói cẩn thận. Sẽ ủng hộ tiếp!", photo: "🍎", date: "20/06/2026" },
  { name: "Trần Văn Bình", rating: 4, fruit: "Xoài cát Hòa Lộc", comment: "Xoài chín đều, thơm. Giao hơi chậm một chút.", photo: "🥭", date: "19/06/2026" },
  { name: "Lê Minh Anh", rating: 5, fruit: "Nho mẫu đơn", comment: "Nho tươi ngon, đúng như hình quảng cáo. Rất hài lòng.", photo: "🍇", date: "19/06/2026" },
  { name: "Phạm Quốc Đạt", rating: 3, fruit: "Chuối già", comment: "Chuối hơi xanh, để mấy ngày mới ăn được.", photo: "🍌", date: "18/06/2026" },
  { name: "Võ Thị Lan", rating: 5, fruit: "Dâu Đà Lạt", comment: "Dâu tươi, ngọt, mùi thơm tự nhiên. Sẽ mua lại.", photo: "🍓", date: "17/06/2026" },
];

function Reviews() {
  const total = REVIEWS.length;
  const avg = (REVIEWS.reduce((a, b) => a + b.rating, 0) / total).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((r) => ({
    r, count: REVIEWS.filter((x) => x.rating === r).length,
  }));

  return (
    <PartnerShell title="Đánh giá từ khách hàng" subtitle="Phản hồi nhanh để giữ điểm uy tín">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft text-center">
          <p className="text-xs text-muted-foreground">Đánh giá trung bình</p>
          <p className="text-5xl font-extrabold mt-2 text-[oklch(0.45_0.17_145)]">{avg}</p>
          <div className="flex justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 text-orange-400 fill-orange-400" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{total} lượt đánh giá · 312 lượt tổng</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <p className="font-bold mb-3 text-sm">Phân bổ sao</p>
          <div className="space-y-1.5">
            {dist.map((d) => (
              <div key={d.r} className="flex items-center gap-2 text-xs">
                <span className="w-4 font-semibold">{d.r}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gt-gradient" style={{ width: `${(d.count / total) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft grid grid-cols-2 gap-3">
          <Mini label="Tổng đánh giá" value={String(total)} />
          <Mini label="Tỷ lệ phản hồi" value="92%" />
          <Mini label="Phản hồi 24h" value="88%" />
          <Mini label="Đánh giá tuần này" value="14" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {REVIEWS.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-border gt-shadow-soft">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full gt-gradient grid place-items-center text-white font-bold">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-sm">{r.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={`h-3 w-3 ${k < r.rating ? "text-orange-400 fill-orange-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">· {r.date}</span>
                </div>
                <p className="text-xs text-muted-foreground">Sản phẩm: {r.fruit}</p>
                <p className="mt-2 text-sm">{r.comment}</p>
                <div className="mt-3 h-16 w-16 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-3xl">
                  {r.photo}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="px-3 py-1.5 rounded-lg gt-gradient text-white text-xs font-semibold flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> Phản hồi
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold flex items-center gap-1">
                <Eye className="h-3 w-3" /> Xem đơn liên quan
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1">
                <Flag className="h-3 w-3" /> Báo cáo không phù hợp
              </button>
            </div>
          </div>
        ))}
      </div>
    </PartnerShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[oklch(0.98_0.02_100)] p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-extrabold mt-0.5">{value}</p>
    </div>
  );
}