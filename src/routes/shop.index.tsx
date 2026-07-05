import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, MapPin, Truck, Plus, ShoppingCart } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/shop/")({
  head: () => ({ meta: [{ title: "Mua trái cây — Golden Time" }] }),
  component: Shop,
});

const items = [
  { emoji: "🍎", name: "Táo Fuji", store: "Bách Hóa Xanh", price: 49000, score: 92, distance: "1.2 km" },
  { emoji: "🥭", name: "Xoài cát Hòa Lộc", store: "GrabMart", price: 65000, score: 90, distance: "0.8 km" },
  { emoji: "🍊", name: "Cam sành Vĩnh Long", store: "WinMart", price: 35000, score: 88, distance: "2.1 km" },
  { emoji: "🍌", name: "Chuối già hương", store: "Trái Cây Tươi", price: 28000, score: 85, distance: "0.5 km" },
  { emoji: "🍇", name: "Nho mẫu đơn", store: "WinMart", price: 199000, score: 94, distance: "2.1 km" },
  { emoji: "🍓", name: "Dâu Đà Lạt", store: "Farm Fresh", price: 120000, score: 91, distance: "3.4 km" },
];

const cats = ["Tất cả", "Trái cây nội", "Nhập khẩu", "Hữu cơ", "Ăn liền"];

function Shop() {
  return (
    <PhoneShell>
      <StatusBar title="Mua trái cây" right={<Link to="/cart"><ShoppingCart className="h-4 w-4" /></Link>} />
      <div className="px-5">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 gt-shadow-soft border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm sản phẩm..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {cats.map((c, i) => (
            <button key={c} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${i === 0 ? "gt-gradient text-white" : "bg-white border border-border"}`}>{c}</button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl p-3 gt-shadow-soft border border-border flex flex-col">
              <div className="relative">
                <FruitThumb emoji={p.emoji} size="lg" className="!h-28 !w-full !rounded-2xl !text-6xl" />
                <span className="absolute top-2 left-2 text-[10px] bg-white/95 backdrop-blur px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 text-primary fill-primary" /> {p.score}
                </span>
              </div>
              <h4 className="font-bold text-sm mt-2 truncate">{p.name}</h4>
              <p className="text-[10px] text-muted-foreground truncate">{p.store}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.distance}</span>
                <span className="flex items-center gap-0.5 text-primary"><Truck className="h-2.5 w-2.5" />Nhanh</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-primary leading-none">{p.price.toLocaleString("vi-VN")}đ</p>
                <button className="h-7 w-7 grid place-items-center rounded-full gt-gradient text-white gt-shadow"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="h-20" />
      </div>

      <div className="absolute bottom-24 inset-x-4 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between gt-shadow">
        <div>
          <p className="text-[11px] opacity-70">Giỏ hàng: 2 sản phẩm</p>
          <p className="font-extrabold">Tạm tính: 98.000đ</p>
        </div>
        <Link to="/cart" className="bg-white text-foreground font-semibold px-4 py-2 rounded-xl text-sm">Thanh toán</Link>
      </div>
    </PhoneShell>
  );
}