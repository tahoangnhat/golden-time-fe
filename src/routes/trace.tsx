import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, BadgeCheck, Sprout, Truck, Store, User, ShieldCheck, Search, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { api, userStorageKey, type BatchTrace, type ScanResult } from "@/lib/api";

export const Route = createFileRoute("/trace")({
  head: () => ({ meta: [{ title: "Truy xuất nguồn gốc — Golden Time" }] }),
  component: Trace,
});

function Trace() {
  const [batchCode, setBatchCode] = useState("");
  const [trace, setTrace] = useState<BatchTrace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const queryCode = new URLSearchParams(window.location.search).get("batchCode");
    let last: ScanResult | null = null;
    try { last = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null; } catch { /* empty */ }
    const initial = queryCode || last?.batchCode || "";
    setBatchCode(initial);
    if (initial) void load(initial);
  }, []);
  async function load(code: string) {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try { setTrace(await api.trace(code.trim())); }
    catch (cause) { setTrace(null); setError(cause instanceof Error ? cause.message : "Không tìm thấy lô hàng."); }
    finally { setLoading(false); }
  }
  const Icon = (key?: string | null) => key === "harvest" ? Sprout : key === "transport" ? Truck : key === "store" ? Store : key === "quality" ? ShieldCheck : User;
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2"><Link to="/result" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link><span className="font-semibold text-sm">Truy xuất nguồn gốc</span><span className="w-9" /></div>
      <div className="px-5">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void load(batchCode); }}>
          <input value={batchCode} onChange={(event) => setBatchCode(event.target.value)} aria-label="Mã lô" placeholder="Nhập mã lô" className="min-w-0 flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm" />
          <button disabled={loading} className="rounded-xl gt-gradient px-4 text-white font-semibold text-sm inline-flex items-center gap-2"><Search className="h-4 w-4" /> Tra cứu</button>
        </form>
        {loading ? <div className="py-16 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</p> : !trace ? <p className="mt-4 rounded-xl bg-white border border-border p-4 text-sm text-muted-foreground">Nhập mã lô có trên sản phẩm hoặc mở màn hình này từ kết quả quét đã lưu.</p> : <>
          <div className="mt-4 bg-white rounded-3xl p-5 gt-shadow-soft border border-border flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-cream to-warm grid place-items-center text-5xl">{trace.batch.emoji || "🍎"}</div>
            <div className="flex-1 min-w-0"><h2 className="font-extrabold">{trace.batch.productName}</h2><p className="text-[11px] text-muted-foreground break-all">Mã lô: {trace.batch.batchCode}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md"><BadgeCheck className="h-3 w-3" /> {trace.batch.certified ? "Có chứng nhận khai báo" : "Chưa có chứng nhận"}</span>
            </div>
          </div>
          <div className="mt-4 bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm">
            {[["Nhà cung cấp", trace.batch.supplier], ["Khu vực", trace.batch.origin], ["Ngày thu hoạch", trace.batch.harvestDate], ["Ngày nhập hàng", trace.batch.intakeDate], ["Chứng nhận", trace.batch.certificates], ["Bảo quản", [trace.batch.storageTemperature, trace.batch.storageHumidity].filter(Boolean).join(" • ")]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-border last:border-0 pb-2 last:pb-0"><span className="text-muted-foreground">{label}</span><span className="font-semibold text-right">{value}</span></div>)}
          </div>
          {trace.batch.publicNote && <p className="mt-3 text-xs text-muted-foreground">{trace.batch.publicNote}</p>}
          <h3 className="mt-5 font-bold">Hành trình sản phẩm</h3>
          <div className="mt-3 relative"><div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" /><div className="space-y-4">
            {trace.events.map((event) => { const EventIcon = Icon(event.iconKey); return <div key={event.stepOrder} className="flex gap-3 relative"><div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${event.completed ? "gt-gradient text-white gt-shadow" : "bg-white border-2 border-dashed border-border text-muted-foreground"}`}><EventIcon className="h-4 w-4" /></div><div className="flex-1 bg-white rounded-2xl p-3 border border-border"><p className="font-semibold text-sm">{event.title}</p><p className="text-[11px] text-muted-foreground">{[event.eventDate, event.location].filter(Boolean).join(" • ") || "Chưa cập nhật"}</p></div></div>; })}
          </div></div>
        </>}
      </div>
    </PhoneShell>
  );
}
