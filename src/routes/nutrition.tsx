import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Heart, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";
import { api, userStorageKey, type FruitNutrition, type ScanResult } from "@/lib/api";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Dinh dưỡng — Golden Time" }] }),
  component: Nutrition,
});

const nutrientConfig = [
  { key: "caloriesPer100g", label: "Calories", unit: "kcal/100g", color: "from-rose-100 to-rose-50" },
  { key: "vitaminCMg", label: "Vitamin C", unit: "mg/100g", color: "from-orange-100 to-amber-50" },
  { key: "fiberG", label: "Chất xơ", unit: "g/100g", color: "from-lime-100 to-emerald-50" },
  { key: "sugarG", label: "Đường tự nhiên", unit: "g/100g", color: "from-yellow-100 to-amber-50" },
  { key: "potassiumMg", label: "Kali", unit: "mg/100g", color: "from-violet-100 to-purple-50" },
  { key: "waterPercent", label: "Nước", unit: "%", color: "from-sky-100 to-cyan-50" },
] as const;

function Nutrition() {
  const [fruit, setFruit] = useState<FruitNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        let slug = params.get("fruitSlug") || "";
        if (!slug) {
          const scan = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null;
          if (scan?.fruitId) slug = (await api.fruits()).find((item) => item.id === scan.fruitId)?.slug || "";
        }
        if (!slug) slug = "tao";
        setFruit(await api.fruit(slug));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu dinh dưỡng.");
      } finally { setLoading(false); }
    }
    void load();
  }, []);
  const benefits = (fruit?.healthBenefits || "").split(/[;；]/).map((item) => item.trim()).filter(Boolean);
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/result" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link>
        <span className="font-semibold text-sm">Thông tin dinh dưỡng</span>
        <span className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><Heart className="h-4 w-4" /></span>
      </div>
      {loading ? <div className="py-20 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <p className="mx-5 mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : fruit && <div className="px-5">
        <div className="bg-white rounded-3xl p-5 gt-shadow-soft border border-border flex items-center gap-4">
          <FruitThumb emoji={fruit.emoji} size="lg" />
          <div><h2 className="text-xl font-extrabold">{fruit.name}</h2><p className="text-xs text-muted-foreground">{fruit.servingNote || "Giá trị tham khảo trên 100g"}</p></div>
        </div>
        <h3 className="mt-5 font-bold text-base">Giá trị dinh dưỡng / 100g</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {nutrientConfig.map((item) => {
            const value = fruit[item.key];
            return <div key={item.key} className={`rounded-2xl p-4 bg-gradient-to-br ${item.color} border border-white`}>
              <p className="text-[11px] text-foreground/70 font-medium">{item.label}</p>
              <p className="text-2xl font-extrabold mt-1">{value == null ? "—" : Number(value).toLocaleString("vi-VN")}</p>
              <p className="text-[10px] text-foreground/60">{item.unit}</p>
            </div>;
          })}
        </div>
        {benefits.length > 0 && <><h3 className="mt-5 font-bold text-base">Thông tin tham khảo</h3><div className="mt-2 flex flex-wrap gap-2">{benefits.map((benefit) => <span key={benefit} className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">✓ {benefit}</span>)}</div></>}
        {fruit.personalizedTip && <div className="mt-5 rounded-2xl gt-gradient text-white p-4 gt-shadow"><p className="text-[11px] uppercase tracking-wider text-white/80">Gợi ý</p><p className="text-sm font-semibold mt-1">{fruit.personalizedTip}</p></div>}
        <p className="mt-4 text-[11px] text-muted-foreground">Thông tin tham khảo; giá trị có thể thay đổi theo giống và cách bảo quản.</p>
      </div>}
    </PhoneShell>
  );
}
