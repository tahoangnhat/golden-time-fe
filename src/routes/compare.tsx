import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, AlertTriangle, Truck, MapPin, Star, TrendingDown } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "So sánh giá — Golden Time" }] }),
  component: Compare,
});

const stores = [
  { name: "Bách Hóa Xanh", price: 49000, distance: "1.2 km", rating: 4.6, best: true, fast: true },
  { name: "Cửa hàng gần bạn", price: 50000, distance: "0.4 km", rating: 4.4, fast: true },
  { name: "GrabMart", price: 52000, distance: "—", rating: 4.5, fast: true },
  { name: "WinMart", price: 58000, distance: "2.1 km", rating: 4.7, fast: false },
];

const chips = ["Gần tôi", "Giá thấp", "Đánh giá cao", "Giao nhanh"];

function Compare() {
  return (
    <PhoneShell>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-sm">So sánh giá thị trường</span>
        <span className="w-9" />
      </div>

      <div className="px-5">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border">
          <FruitThumb emoji="🍎" size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">Đang so sánh</p>
            <h2 className="font-extrabold">Táo Fuji</h2>
            <p className="text-[11px] text-primary font-semibold flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Giá trung bình 52.250đ/kg</p>
          </div>
          <button className="text-[11px] text-primary font-semibold">Đổi</button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {chips.map((c, i) => (
            <button key={c} className={`shrink-0 text-xs font-semibold px-3 py-2 rounded-full border ${i === 0 ? "gt-gradient text-white border-transparent" : "bg-white border-border text-foreground"}`}>{c}</button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-[oklch(0.95_0.1_55)] border border-[oklch(0.85_0.14_55)] p-3 flex gap-2 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[oklch(0.55_0.18_50)] mt-0.5" />
          <p className="text-[oklch(0.35_0.12_50)]"><b>Lưu ý:</b> Một số nơi đang bán cao hơn thị trường khoảng <b>18%</b>.</p>
        </div>

        <div className="mt-4 space-y-3">
          {stores.map((s) => (
            <div key={s.name} className={`bg-white rounded-2xl p-4 border ${s.best ? "border-primary gt-shadow" : "border-border gt-shadow-soft"}`}>
              {s.best && (
                <span className="inline-block text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-md mb-2">★ GIÁ TỐT NHẤT</span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold truncate">{s.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-[oklch(0.75_0.18_85)] text-[oklch(0.75_0.18_85)]" /> {s.rating}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.distance}</span>
                    {s.fast && <span className="flex items-center gap-1 text-primary"><Truck className="h-3 w-3" /> Nhanh</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-extrabold text-primary leading-none">{s.price.toLocaleString("vi-VN")}đ</p>
                  <p className="text-[10px] text-muted-foreground">/kg</p>
                </div>
              </div>
              <Link to="/shop" className={`mt-3 block text-center py-2.5 rounded-xl text-sm font-semibold ${s.best ? "gt-gradient text-white" : "bg-cream text-foreground border border-border"}`}>
                Mua ngay
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}