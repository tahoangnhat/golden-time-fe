import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, AlertTriangle, ExternalLink, TrendingDown, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";
import { api, formatDate, userStorageKey, type Fruit, type PriceComparison, type ScanResult } from "@/lib/api";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "So sánh giá — Golden Time" }] }),
  component: Compare,
});

function Compare() {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [slug, setSlug] = useState("tao");
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    async function load() {
      try {
        const available = await api.fruits();
        setFruits(available);
        const requested = new URLSearchParams(window.location.search).get("fruitSlug");
        let initial = requested || "";
        if (!initial) {
          const scan = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null;
          initial = available.find((fruit) => fruit.id === scan?.fruitId)?.slug || "tao";
        }
        if (available.some((fruit) => fruit.slug === initial)) setSlug(initial);
        await loadPrice(initial);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không tải được giá thị trường.");
      } finally { setLoading(false); }
    }
    void load();
  }, []);
  async function loadPrice(fruitSlug: string) {
    setError("");
    setLoading(true);
    try { setComparison(await api.prices(fruitSlug)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được giá thị trường."); }
    finally { setLoading(false); }
  }
  function choose(sl: string) { setSlug(sl); void loadPrice(sl); }
  const prices = comparison?.prices || [];
  const bestPrice = prices.length ? Math.min(...prices.map((item) => item.pricePerKg)) : undefined;
  return (
    <PhoneShell>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link>
        <span className="font-semibold text-sm">So sánh giá thị trường</span><span className="w-9" />
      </div>
      <div className="px-5">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border">
          <FruitThumb emoji={comparison?.emoji || fruits.find((fruit) => fruit.slug === slug)?.emoji || "🍎"} size="md" />
          <div className="flex-1 min-w-0"><p className="text-[11px] text-muted-foreground">Đang so sánh</p><h2 className="font-extrabold">{comparison?.fruitName || "Trái cây"}</h2>
            {comparison?.averagePrice != null && <p className="text-[11px] text-primary font-semibold flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Trung bình {Math.round(comparison.averagePrice).toLocaleString("vi-VN")}đ/kg</p>}
          </div>
          <select aria-label="Chọn trái cây" value={slug} onChange={(event) => choose(event.target.value)} className="max-w-24 rounded-xl border border-border bg-cream px-2 py-2 text-xs">{fruits.map((fruit) => <option key={fruit.slug} value={fruit.slug}>{fruit.name}</option>)}</select>
        </div>
        <div className="mt-3 rounded-2xl bg-[oklch(0.95_0.1_55)] border border-[oklch(0.85_0.14_55)] p-3 flex gap-2 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[oklch(0.55_0.18_50)] mt-0.5" />
          <p className="text-[oklch(0.35_0.12_50)]"><b>Giá tham khảo:</b> quy đổi theo kg từ trang công khai. Giá và tồn hàng có thể đổi theo khu vực; luôn xem thời điểm lấy dữ liệu và trang nguồn.</p>
        </div>
        {loading ? <div className="py-14 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : prices.length === 0 ?
          <div className="mt-4 rounded-2xl bg-white border border-border p-5 text-center"><p className="font-semibold">{comparison?.message || "Chưa có giá lấy được từ nguồn."}</p><p className="text-xs text-muted-foreground mt-2">Backend sẽ thử lấy lại theo lịch. Hãy kiểm tra trạng thái crawler ở Swagger.</p></div> :
          <div className="mt-4 space-y-3">{prices.map((item) => <div key={item.retailerCode} className={`bg-white rounded-2xl p-4 border ${item.pricePerKg === bestPrice ? "border-primary gt-shadow" : "border-border gt-shadow-soft"}`}>
            {item.pricePerKg === bestPrice && <span className="inline-block text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-md mb-2">GIÁ THẤP NHẤT TRONG NGUỒN ĐÃ LẤY</span>}
            <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold">{item.retailerName}</h4><p className="text-xs text-muted-foreground mt-1">Cập nhật {formatDate(item.fetchedAt)}</p></div><div className="text-right shrink-0"><p className="text-lg font-extrabold text-primary leading-none">{item.pricePerKg.toLocaleString("vi-VN")}đ</p><p className="text-[10px] text-muted-foreground">/kg</p></div></div>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-semibold">Mở trang nguồn <ExternalLink className="h-3 w-3" /></a>
          </div>)}</div>}
      </div>
    </PhoneShell>
  );
}
