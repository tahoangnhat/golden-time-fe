import { createFileRoute } from "@tanstack/react-router";
import { Star, Navigation, LoaderCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { ApiError, api, getCurrentLocation, hasAuth, userStorageKey, type Review, type ScanResult, type Shop } from "@/lib/api";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Bản đồ trái cây — Golden Time" }] }),
  component: MapScreen,
});

type ReviewProof = { orderId?: number; scanId?: number; shopId?: number };

function MapScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [near, setNear] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [proof, setProof] = useState<ReviewProof | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let savedOrder: { orderId: number; shopId: number } | null = null;
    try {
      savedOrder = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-order-proof")) || "null") as { orderId: number; shopId: number } | null;
      const scan = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null;
      if (savedOrder) setProof({ orderId: savedOrder.orderId, shopId: savedOrder.shopId });
      else if (scan?.id) setProof({ scanId: scan.id });
    } catch { setProof(null); }
    api.shops().then((result) => {
      setShops(result);
      const preferredShopId = savedOrder?.shopId;
      setSelectedShopId(result.find((shop) => shop.id === preferredShopId)?.id ?? result[0]?.id ?? null);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được cửa hàng."))
      .finally(() => setLoading(false));
  }, []);
  const visibleShops = useMemo(() => {
    const eligible = proof?.shopId ? shops.filter((shop) => shop.id === proof.shopId) : shops;
    return near ? eligible.filter((shop) => (shop.distanceKm ?? Infinity) <= 5) : eligible;
  }, [near, shops, proof]);
  const mapPoints = useMemo(() => {
    if (!visibleShops.length) return [];
    const latitudes = visibleShops.map((shop) => shop.latitude);
    const longitudes = visibleShops.map((shop) => shop.longitude);
    if (location) { latitudes.push(location.lat); longitudes.push(location.lng); }
    const minLat = Math.min(...latitudes); const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes); const maxLng = Math.max(...longitudes);
    return visibleShops.map((shop) => ({
      shop,
      top: maxLat === minLat ? 50 : 15 + (1 - (shop.latitude - minLat) / (maxLat - minLat)) * 70,
      left: maxLng === minLng ? 50 : 15 + ((shop.longitude - minLng) / (maxLng - minLng)) * 70,
    }));
  }, [visibleShops, location]);
  const selectedShop = shops.find((shop) => shop.id === selectedShopId) || null;
  useEffect(() => {
    if (!selectedShopId) return;
    api.reviews(selectedShopId).then(setReviews).catch(() => setReviews([]));
  }, [selectedShopId]);
  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proof) return setError("Hãy quét một sản phẩm hoặc đặt hàng trước khi đánh giá.");
    if (!hasAuth()) return setError("Để gửi đánh giá, hãy đăng nhập trong ứng dụng Golden Time.");
    if (rating < 1) return setError("Chọn số sao trước khi gửi đánh giá.");
    if (!selectedShopId) return;
    setBusy(true); setError("");
    try {
      await api.createReview({ shopId: selectedShopId, orderId: proof.orderId, scanId: proof.scanId, rating, comment });
      setComment("");
      if (proof.orderId) window.localStorage.removeItem(userStorageKey("golden-time-order-proof"));
      if (proof.scanId) window.localStorage.removeItem(userStorageKey("golden-time-provider-scan"));
      setProof(null);
      setReviews(await api.reviews(selectedShopId));
      const refreshed = near && location ? await api.shops(location.lat, location.lng, 25) : await api.shops();
      setShops(refreshed);
      toast.success("Đã gửi đánh giá.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không gửi được đánh giá.");
    } finally { setBusy(false); }
  }
  async function toggleNear() {
    if (near) {
      setNear(false); setLoading(true);
      try { setShops(await api.shops()); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được cửa hàng."); }
      finally { setLoading(false); }
      return;
    }
    setError("");
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setLoading(true);
      const result = await api.shops(currentLocation.lat, currentLocation.lng, 25);
      setShops(result);
      setSelectedShopId(result.find((shop) => shop.id === proof?.shopId)?.id ?? result[0]?.id ?? null);
      setNear(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lấy được vị trí hiện tại.");
    } finally { setLoading(false); }
  }
  return (
    <PhoneShell>
      <StatusBar title="Cửa hàng quanh bạn" />
      <div className="px-5">
        <div className="flex items-center justify-between mb-3"><div><p className="text-xs font-semibold">{location ? "Đang dùng vị trí hiện tại" : "Chưa bật định vị"}</p><p className="text-[10px] text-muted-foreground">Khoảng cách tính từ tọa độ cửa hàng đã lưu</p></div><button onClick={toggleNear} className={`rounded-full border px-3 py-2 text-xs font-semibold ${near ? "gt-gradient border-transparent text-white" : "bg-white border-border"}`}><Navigation className="inline h-3 w-3 mr-1" />{near ? "Trong 5 km" : "Gần tôi"}</button></div>
        <div className="relative h-64 rounded-3xl overflow-hidden gt-shadow-soft border border-border bg-[oklch(0.95_0.04_140)]">
          <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="gt-map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.85 0.04 140)" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#gt-map-grid)" /></svg>
          {mapPoints.map(({ shop, top, left }) => <button key={shop.id} onClick={() => setSelectedShopId(shop.id)} title={shop.name} className={`absolute -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white grid place-items-center text-xl border-2 ${selectedShopId === shop.id ? "border-primary gt-shadow" : "border-white shadow"}`} style={{ top: `${top}%`, left: `${left}%` }}>🍎</button>)}
          {!visibleShops.length && <div className="absolute inset-0 grid place-items-center"><p className="rounded-xl bg-white/90 p-3 text-xs text-muted-foreground">Chưa có cửa hàng có tọa độ.</p></div>}
          <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] text-muted-foreground">Sơ đồ vị trí tương quan</div>
        </div>
        <div className="mt-5 flex items-center justify-between"><h3 className="font-bold">Cửa hàng ({visibleShops.length})</h3>{loading && <LoaderCircle className="h-4 w-4 animate-spin text-primary" />}</div>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="mt-3 space-y-3">{visibleShops.map((shop) => <button key={shop.id} onClick={() => setSelectedShopId(shop.id)} className={`w-full text-left bg-white rounded-2xl p-4 gt-shadow-soft border ${selectedShopId === shop.id ? "border-primary" : "border-border"}`}>
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="font-bold text-sm truncate">{shop.name}</h4><p className="text-[11px] text-muted-foreground mt-0.5">{shop.address}</p><div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">{shop.reviewCount > 0 ? <><span className="flex items-center gap-0.5 text-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><b>{Number(shop.rating).toFixed(1)}</b></span><span>({shop.reviewCount} đánh giá)</span></> : <span>Chưa có đánh giá</span>}{shop.distanceKm != null && <span>• {shop.distanceKm.toFixed(1)} km</span>}</div>{shop.popularFruit && <p className="text-[11px] mt-1"><span className="text-muted-foreground">Nổi bật:</span> <span className="font-semibold text-primary">{shop.popularFruit}</span></p>}</div><span className="text-[10px] font-semibold bg-cream px-2 py-1 rounded-lg">{shop.productCount} món</span></div>
        </button>)}</div>
        {selectedShop && <section className="mt-5 bg-white rounded-2xl p-4 gt-shadow-soft border border-border"><h3 className="font-bold text-sm">Đánh giá • {selectedShop.name}</h3>
          {reviews.length ? <div className="mt-3 space-y-3">{reviews.slice(0, 5).map((review) => <div key={review.id} className="border-t border-border pt-3"><div className="flex justify-between"><p className="font-semibold text-xs">{review.author}</p><p className="text-amber-500 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div><p className="text-sm mt-1">{review.comment}</p><p className="text-[10px] text-muted-foreground mt-1">{review.purchased ? "Đã mua" : "Đã quét"}</p></div>)}</div> : <p className="mt-2 text-xs text-muted-foreground">Chưa có đánh giá.</p>}
          {proof ? <form onSubmit={submitReview} className="mt-4 border-t border-border pt-4"><p className="text-xs font-semibold">Bạn có thể đánh giá vì đã {proof.orderId ? "đặt đơn" : "quét sản phẩm"}.</p><div className="mt-2 flex gap-1" aria-label="Chọn số sao">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} className={`text-2xl ${value <= rating ? "text-amber-400" : "text-gray-300"}`}>★</button>)}</div><textarea required maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Chia sẻ trải nghiệm của bạn" className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm" /><button disabled={busy} className="mt-2 w-full rounded-xl gt-gradient py-3 text-sm font-semibold text-white inline-flex items-center justify-center gap-2"><Send className="h-4 w-4" />{busy ? "Đang gửi…" : "Gửi đánh giá"}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</form> : <p className="mt-3 text-[11px] text-muted-foreground">Đánh giá chỉ mở sau khi bạn quét sản phẩm hoặc đặt đơn.</p>}
        </section>}
        <div className="h-5" />
      </div>
    </PhoneShell>
  );
}
