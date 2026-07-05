import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Share2, Leaf, BarChart3, ShoppingBag, CheckCircle2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "Kết quả phân tích — Golden Time" }] }),
  component: Result,
});

type Metric = { label: string; value: number | string; suffix?: string };
const metrics: Metric[] = [
  { label: "Độ tươi", value: 90, suffix: "/100" },
  { label: "Mức độ chín", value: "Vừa chín" },
  { label: "Độ ngọt dự đoán", value: "Cao" },
  { label: "Nên dùng trong", value: "2–3 ngày" },
];

function Result() {
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/scan" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-sm">Kết quả phân tích</span>
        <button className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5">
        <div className="rounded-3xl gt-gradient text-white p-6 gt-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-8xl opacity-20">🍎</div>
          <div className="relative flex items-center gap-4">
            <FruitThumb emoji="🍎" size="lg" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/80">AI Quality Score</p>
              <p className="text-5xl font-extrabold leading-none mt-1">92<span className="text-2xl text-white/80">/100</span></p>
              <p className="text-sm font-semibold mt-1">Táo Fuji</p>
            </div>
          </div>
          <div className="relative mt-4 bg-white/15 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Không phát hiện dấu hiệu hư hỏng rõ ràng
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border">
              <p className="text-[11px] text-muted-foreground font-medium">{m.label}</p>
              <p className="text-lg font-extrabold mt-1">
                {typeof m.value === "number" ? <>{m.value}<span className="text-sm text-muted-foreground">{m.suffix}</span></> : m.value}
              </p>
              {typeof m.value === "number" && (
                <div className="mt-2 h-1.5 bg-cream rounded-full overflow-hidden">
                  <div className="h-full gt-gradient" style={{ width: `${m.value}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 bg-[oklch(0.96_0.08_85)] border border-[oklch(0.85_0.12_85)] rounded-2xl p-4 text-sm">
          <p className="font-semibold text-[oklch(0.4_0.12_70)]">💡 Gợi ý của Golden Time</p>
          <p className="text-[oklch(0.4_0.08_70)] mt-1">Quả táo này đang ở thời điểm vàng — ngon ngọt nhất khi ăn trong 2–3 ngày tới.</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link to="/nutrition" className="py-3 rounded-2xl bg-white border border-border text-xs font-semibold flex flex-col items-center gap-1">
            <Leaf className="h-4 w-4 text-primary" /> Dinh dưỡng
          </Link>
          <Link to="/compare" className="py-3 rounded-2xl bg-white border border-border text-xs font-semibold flex flex-col items-center gap-1">
            <BarChart3 className="h-4 w-4 text-primary" /> So sánh giá
          </Link>
          <Link to="/shop" className="py-3 rounded-2xl gt-gradient text-white text-xs font-semibold flex flex-col items-center gap-1 gt-shadow">
            <ShoppingBag className="h-4 w-4" /> Mua ngay
          </Link>
        </div>

        <Link to="/trace" className="mt-3 block text-center text-xs text-primary font-semibold py-2">
          Xem truy xuất nguồn gốc →
        </Link>
      </div>
    </PhoneShell>
  );
}