import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ScanLine, BarChart3, ShoppingBag, MapPin, Bell, Star } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Trang chủ — Golden Time" }] }),
  component: Home,
});

const products = [
  { emoji: "🍎", name: "Táo Fuji", score: 92, price: "49.000đ", store: "Bách Hóa Xanh" },
  { emoji: "🍊", name: "Cam sành", score: 88, price: "35.000đ", store: "WinMart" },
  { emoji: "🥭", name: "Xoài cát", score: 90, price: "65.000đ", store: "GrabMart" },
  { emoji: "🍌", name: "Chuối già", score: 85, price: "28.000đ", store: "Cửa hàng Trái Cây Tươi" },
];

const quickActions = [
  { to: "/scan", icon: ScanLine, label: "Quét AI", color: "gt-gradient text-white" },
  { to: "/compare", icon: BarChart3, label: "So sánh giá", color: "bg-accent text-accent-foreground" },
  { to: "/shop", icon: ShoppingBag, label: "Mua ngay", color: "bg-[oklch(0.94_0.12_55)] text-[oklch(0.4_0.15_55)]" },
  { to: "/map", icon: MapPin, label: "Bản đồ", color: "bg-secondary text-secondary-foreground" },
] as const;

function Home() {
  return (
    <PhoneShell>
      <StatusBar title="Golden Time" right={<Bell className="h-4 w-4" />} />
      <div className="px-5 pt-2">
        <p className="text-xs text-muted-foreground">Xin chào,</p>
        <h1 className="text-xl font-extrabold leading-tight">Hôm nay bạn muốn mua trái cây gì?</h1>

        <div className="mt-4 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 gt-shadow-soft border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm táo, cam, xoài, chuối..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>

        <Link to="/scan" className="mt-5 block rounded-3xl gt-gradient p-5 text-white gt-shadow relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-30">🍎</div>
          <div className="relative">
            <span className="text-[11px] bg-white/20 px-2 py-1 rounded-full font-medium">✨ Tính năng nổi bật</span>
            <h2 className="text-xl font-extrabold mt-2 leading-tight">Quét trái cây<br />bằng AI</h2>
            <p className="text-xs text-white/85 mt-1 max-w-[200px]">Đánh giá độ tươi, độ chín và chất lượng tức thì</p>
            <span className="mt-3 inline-flex items-center gap-1 bg-white text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
              Quét ngay <ScanLine className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-2">
              <span className={`h-14 w-14 rounded-2xl grid place-items-center ${color} gt-shadow-soft`}>
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="text-[10px] font-medium text-center">{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-bold text-base">Gợi ý hôm nay</h3>
          <Link to="/shop" className="text-xs text-primary font-semibold">Xem tất cả</Link>
        </div>
        <div className="mt-3 space-y-3">
          {products.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border">
              <FruitThumb emoji={p.emoji} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm truncate">{p.name}</h4>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> {p.score}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{p.store}</p>
                <p className="text-sm font-extrabold text-primary mt-0.5">{p.price}<span className="text-[10px] text-muted-foreground font-medium">/kg</span></p>
              </div>
              <Link to="/result" className="shrink-0 text-[11px] font-semibold bg-cream text-foreground px-3 py-2 rounded-xl border border-border">Chi tiết</Link>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}