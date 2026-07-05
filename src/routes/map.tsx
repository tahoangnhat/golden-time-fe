import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Star, Navigation, MessageSquare } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Bản đồ trái cây — Golden Time" }] }),
  component: MapScreen,
});

const stores = [
  { name: "Trái Cây Sạch Sài Gòn", rating: 4.8, reviews: 234, popular: "Xoài cát Hòa Lộc", distance: "0.4 km" },
  { name: "Vườn Xoài Cát Lái", rating: 4.7, reviews: 189, popular: "Xoài keo", distance: "1.1 km" },
  { name: "Fresh Fruit Q.1", rating: 4.6, reviews: 412, popular: "Xoài Úc", distance: "1.8 km" },
];

const pins = [
  { top: "18%", left: "30%", emoji: "🥭" },
  { top: "32%", left: "60%", emoji: "🍎" },
  { top: "48%", left: "20%", emoji: "🍊" },
  { top: "55%", left: "70%", emoji: "🍓" },
  { top: "68%", left: "45%", emoji: "🍇" },
];

function MapScreen() {
  return (
    <PhoneShell>
      <StatusBar title="Bản đồ trái cây" />
      <div className="relative h-72 mx-5 rounded-3xl overflow-hidden gt-shadow-soft border border-border bg-[oklch(0.95_0.04_140)]">
        <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.85 0.04 140)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M 0 100 Q 100 80 200 140 T 400 180" stroke="oklch(0.82 0.06 80)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M 50 250 Q 150 220 280 200 T 420 240" stroke="oklch(0.82 0.06 80)" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
        {pins.map((p, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: p.top, left: p.left }}>
            <div className="h-10 w-10 rounded-full bg-white grid place-items-center text-xl gt-shadow border-2 border-primary">
              {p.emoji}
            </div>
          </div>
        ))}
        <div className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white grid place-items-center gt-shadow">
          <Navigation className="h-4 w-4 text-primary" />
        </div>
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1">
          <MapPin className="h-3 w-3 text-primary" /> Quận 1, TP. HCM
        </div>
      </div>

      <div className="px-5 mt-5">
        <h3 className="font-bold">Top nơi mua xoài ngon gần bạn</h3>
        <div className="mt-3 space-y-3">
          {stores.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">{s.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5 text-foreground"><Star className="h-3 w-3 fill-[oklch(0.75_0.18_85)] text-[oklch(0.75_0.18_85)]" /> <b>{s.rating}</b></span>
                    <span>({s.reviews} đánh giá)</span>
                    <span>• {s.distance}</span>
                  </div>
                  <p className="text-[11px] mt-1"><span className="text-muted-foreground">Nổi bật:</span> <span className="font-semibold text-primary">{s.popular}</span></p>
                </div>
                <button className="text-[11px] font-semibold bg-cream px-3 py-1.5 rounded-xl border border-border">Xem</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-bold">Đánh giá cộng đồng</h3>
        <div className="mt-3 bg-white rounded-2xl p-4 gt-shadow-soft border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 grid place-items-center font-bold">M</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Minh Anh</p>
              <div className="flex items-center gap-1 text-[11px] text-[oklch(0.65_0.18_85)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                <span className="text-muted-foreground ml-1">• 2 ngày trước</span>
              </div>
            </div>
          </div>
          <p className="text-sm mt-2">"Xoài tươi, giá hợp lý, giao nhanh. Sẽ ủng hộ tiếp!"</p>
          <div className="mt-2 flex gap-2">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-yellow-200 to-orange-200 grid place-items-center text-3xl">🥭</div>
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 grid place-items-center text-3xl">🥭</div>
          </div>
          <button className="mt-3 w-full py-3 rounded-2xl gt-gradient text-white font-semibold text-sm inline-flex items-center justify-center gap-2">
            <MessageSquare className="h-4 w-4" /> Đánh giá cửa hàng này
          </button>
        </div>
        <div className="h-4" />
      </div>
    </PhoneShell>
  );
}