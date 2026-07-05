import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, Plus } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Dinh dưỡng — Golden Time" }] }),
  component: Nutrition,
});

const nutrients = [
  { label: "Calories", value: "52", unit: "kcal/100g", color: "from-rose-100 to-rose-50" },
  { label: "Vitamin C", value: "4.6", unit: "mg", color: "from-orange-100 to-amber-50" },
  { label: "Chất xơ", value: "2.4", unit: "g", color: "from-lime-100 to-emerald-50" },
  { label: "Đường tự nhiên", value: "10.4", unit: "g", color: "from-yellow-100 to-amber-50" },
  { label: "Kali", value: "107", unit: "mg", color: "from-violet-100 to-purple-50" },
  { label: "Nước", value: "86", unit: "%", color: "from-sky-100 to-cyan-50" },
];

const benefits = ["Hỗ trợ tiêu hóa", "Phù hợp ăn nhẹ", "Tốt cho lối sống healthy"];

function Nutrition() {
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/result" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-sm">Thông tin dinh dưỡng</span>
        <button className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 gt-shadow-soft border border-border flex items-center gap-4">
          <FruitThumb emoji="🍎" size="lg" />
          <div>
            <h2 className="text-xl font-extrabold">Táo Fuji</h2>
            <p className="text-xs text-muted-foreground">Khẩu phần tham khảo • 1 quả (~150g)</p>
            <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">AI Score 92</span>
          </div>
        </div>

        <h3 className="mt-5 font-bold text-base">Giá trị dinh dưỡng</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {nutrients.map((n) => (
            <div key={n.label} className={`rounded-2xl p-4 bg-gradient-to-br ${n.color} border border-white`}>
              <p className="text-[11px] text-foreground/70 font-medium">{n.label}</p>
              <p className="text-2xl font-extrabold mt-1">{n.value}</p>
              <p className="text-[10px] text-foreground/60">{n.unit}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-5 font-bold text-base">Lợi ích sức khỏe</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {benefits.map((b) => (
            <span key={b} className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">✓ {b}</span>
          ))}
        </div>

        <div className="mt-5 rounded-2xl gt-gradient text-white p-4 gt-shadow">
          <p className="text-[11px] uppercase tracking-wider text-white/80">Gợi ý cá nhân hóa</p>
          <p className="text-sm font-semibold mt-1">Bạn có thể ăn 1–2 quả mỗi ngày tùy mục tiêu sức khỏe.</p>
        </div>

        <button className="mt-4 w-full py-4 rounded-2xl bg-white border border-border font-semibold text-sm inline-flex items-center justify-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Thêm vào kế hoạch ăn uống
        </button>
      </div>
    </PhoneShell>
  );
}