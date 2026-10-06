import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Share2, Leaf, BarChart3, ShoppingBag, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";
import { api, userStorageKey, type ScanResult } from "@/lib/api";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "Kết quả phân tích — Golden Time" }] }),
  component: Result,
});

function Result() {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const scanId = Number(new URLSearchParams(window.location.search).get("scanId"));
    if (!scanId) {
      try {
        const cached = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null;
        setScan(cached?.analysisMode === "PROVIDER" ? cached : null);
      }
      catch { setScan(null); }
      setLoading(false);
      return;
    }
    api.scanById(scanId).then((value) => {
      setScan(value);
      window.localStorage.setItem(userStorageKey("golden-time-provider-scan"), JSON.stringify(value));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được kết quả."))
      .finally(() => setLoading(false));
  }, []);
  const score = scan?.qualityScore ?? 0;
  const metrics = [
    { label: "Độ tươi", value: scan?.freshnessScore == null ? "Chưa có dữ liệu" : `${scan.freshnessScore}/100` },
    { label: "Mức độ chín", value: scan?.ripenessLabel || "Chưa có dữ liệu" },
    { label: "Độ ngọt dự đoán", value: scan?.sweetnessLabel || "Chưa có dữ liệu" },
    { label: "Nên dùng trong", value: scan?.useWithin || "Chưa có dữ liệu" },
  ];
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/scan" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link>
        <span className="font-semibold text-sm">Kết quả phân tích</span>
        <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><Share2 className="h-4 w-4" /></button>
      </div>
      <div className="px-5">
        {loading ? <div className="py-16 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : !scan ?
          <div className="bg-white rounded-2xl p-5 border border-border text-center"><p className="font-semibold">{error || "Chưa có kết quả quét."}</p><Link to="/scan" className="inline-block mt-3 text-primary font-semibold">Quét trái cây</Link></div> : <>
          <div className="rounded-3xl gt-gradient text-white p-6 gt-shadow relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-8xl opacity-20">{scan.fruitName?.includes("Cam") ? "🍊" : "🍎"}</div>
            <div className="relative flex items-center gap-4"><FruitThumb emoji={scan.fruitName?.includes("Cam") ? "🍊" : "🍎"} size="lg" />
              <div><p className="text-[11px] uppercase tracking-wider text-white/80">Điểm chất lượng</p><p className="text-5xl font-extrabold leading-none mt-1">{score}<span className="text-2xl text-white/80">/100</span></p><p className="text-sm font-semibold mt-1">{scan.fruitName}</p></div>
            </div>
            <div className="relative mt-4 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2 text-xs"><CheckCircle2 className="h-4 w-4 shrink-0" />{scan.qualityWarning || "Đã lưu kết quả phân tích."}</div>
            <p className="relative mt-2 text-[10px] text-white/75">Phân tích từ dịch vụ AI{scan.confidence != null && ` • Độ tin cậy ${Math.round(scan.confidence * 100)}%`}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">{metrics.map((metric) => <div key={metric.label} className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border"><p className="text-[11px] text-muted-foreground font-medium">{metric.label}</p><p className="text-lg font-extrabold mt-1">{metric.value}</p></div>)}</div>
          <div className="mt-5 bg-[oklch(0.96_0.08_85)] border border-[oklch(0.85_0.12_85)] rounded-2xl p-4 text-sm"><p className="font-semibold text-[oklch(0.4_0.12_70)]">💡 Gợi ý của Golden Time</p><p className="text-[oklch(0.4_0.08_70)] mt-1">{scan.suggestion || "Không có gợi ý bổ sung."}</p></div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Link to="/nutrition" className="py-3 rounded-2xl bg-white border border-border text-xs font-semibold flex flex-col items-center gap-1"><Leaf className="h-4 w-4 text-primary" /> Dinh dưỡng</Link>
            <Link to="/compare" className="py-3 rounded-2xl bg-white border border-border text-xs font-semibold flex flex-col items-center gap-1"><BarChart3 className="h-4 w-4 text-primary" /> So sánh giá</Link>
            <Link to="/shop" className="py-3 rounded-2xl gt-gradient text-white text-xs font-semibold flex flex-col items-center gap-1 gt-shadow"><ShoppingBag className="h-4 w-4" /> Mua ngay</Link>
          </div>
          {scan.batchCode ? <Link to="/trace" className="mt-3 block text-center text-xs text-primary font-semibold py-2">Xem truy xuất lô {scan.batchCode} →</Link> : <p className="mt-3 text-center text-xs text-muted-foreground py-2">Kết quả này chưa gắn được mã lô truy xuất.</p>}
        </>}
      </div>
    </PhoneShell>
  );
}
