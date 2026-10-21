import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, Navigation, Send, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import {
  ApiError,
  api,
  getCurrentLocation,
  hasAuth,
  userStorageKey,
  type Review,
  type ScanResult,
  type Shop,
} from "@/lib/api";
import { distanceKm, type Coordinates } from "@/lib/geo";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Bản đồ trái cây — Golden Time" }] }),
  component: MapScreen,
});

type ReviewProof = { orderId?: number; scanId?: number; shopId?: number };

function hasRegisteredCoordinates(shop: Shop) {
  return Number.isFinite(shop.latitude) && shop.latitude >= -90 && shop.latitude <= 90
    && Number.isFinite(shop.longitude) && shop.longitude >= -180 && shop.longitude <= 180
    && !(shop.latitude === 0 && shop.longitude === 0);
}

function MapScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [near, setNear] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [proof, setProof] = useState<ReviewProof | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [leafletMapReady, setLeafletMapReady] = useState(false);
  const [error, setError] = useState("");
  const [leafletMapError, setLeafletMapError] = useState("");
  const [busy, setBusy] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let savedOrder: { orderId: number; shopId: number } | null = null;
    try {
      savedOrder = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-order-proof")) || "null") as { orderId: number; shopId: number } | null;
      const scan = JSON.parse(window.localStorage.getItem(userStorageKey("golden-time-provider-scan")) || "null") as ScanResult | null;
      if (savedOrder) setProof({ orderId: savedOrder.orderId, shopId: savedOrder.shopId });
      else if (scan?.id) setProof({ scanId: scan.id });
    } catch {
      setProof(null);
    }
    api.shops().then((result) => {
      setShops(result);
      const preferredShopId = savedOrder?.shopId;
      setSelectedShopId(result.find((shop) => shop.id === preferredShopId)?.id ?? result[0]?.id ?? null);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được cửa hàng đối tác."))
      .finally(() => setLoading(false));
  }, []);

  const visibleShops = useMemo(() => {
    if (!near || !location) return shops;
    return shops
      .map((shop) => ({ shop, distance: distanceKm(location, { lat: shop.latitude, lng: shop.longitude }) }))
      .filter(({ shop, distance }) => hasRegisteredCoordinates(shop) && distance <= 5)
      .sort((first, second) => first.distance - second.distance)
      .map(({ shop }) => shop);
  }, [near, location, shops]);

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) || null;
  const canReviewSelectedShop = Boolean(proof)
    && (!proof?.shopId || proof.shopId === selectedShopId);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !container.isConnected) return;
      leafletRef.current = leaflet;
      map = leaflet.map(container, { zoomControl: true, scrollWheelZoom: false })
        .setView([16.047079, 108.20623], 5);
      leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = leaflet.layerGroup().addTo(map);
      map.invalidateSize();
      setLeafletMapError("");
      setLeafletMapReady(true);
    }).catch(() => setLeafletMapError("Không tải được bản đồ. Hãy kiểm tra kết nối mạng rồi thử lại."));

    return () => {
      cancelled = true;
      markersLayerRef.current?.clearLayers();
      markersLayerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      leafletRef.current = null;
      setLeafletMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const leaflet = leafletRef.current;
    const layer = markersLayerRef.current;
    if (!leafletMapReady || !map || !leaflet || !layer) return;

    layer.clearLayers();
    const points: [number, number][] = [];
    visibleShops.filter(hasRegisteredCoordinates).forEach((shop) => {
      const point: [number, number] = [shop.latitude, shop.longitude];
      points.push(point);
      const popup = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = shop.name;
      popup.appendChild(name);
      if (shop.address) {
        const address = document.createElement("div");
        address.textContent = shop.address;
        popup.appendChild(address);
      }
      if (location) {
        const distance = document.createElement("div");
        distance.textContent = `${distanceKm(location, { lat: shop.latitude, lng: shop.longitude }).toFixed(1)} km`;
        popup.appendChild(distance);
      }
      leaflet.marker(point, {
        icon: leaflet.divIcon({ className: "", html: '<div style="display:grid;place-items:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#e47d24;color:white;font-size:18px;box-shadow:0 2px 8px #0005">🍎</div>', iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: shop.name,
      }).bindPopup(popup).on("click", () => setSelectedShopId(shop.id)).addTo(layer);
    });

    if (location) {
      const point: [number, number] = [location.lat, location.lng];
      points.push(point);
      leaflet.marker(point, {
        icon: leaflet.divIcon({ className: "", html: '<div style="display:grid;place-items:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#2563eb;color:white;font-size:12px;font-weight:700;box-shadow:0 2px 8px #0005">Bạn</div>', iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: "Vị trí của bạn",
      }).bindPopup("Vị trí của bạn").addTo(layer);
    }

    if (points.length > 1) {
      map.fitBounds(leaflet.latLngBounds(points), { padding: [24, 24], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.setView([16.047079, 108.20623], 5);
    }
  }, [leafletMapReady, location, visibleShops]);

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
    setBusy(true);
    setError("");
    try {
      await api.createReview({ shopId: selectedShopId, orderId: proof.orderId, scanId: proof.scanId, rating, comment });
      setComment("");
      if (proof.orderId) window.localStorage.removeItem(userStorageKey("golden-time-order-proof"));
      if (proof.scanId) window.localStorage.removeItem(userStorageKey("golden-time-provider-scan"));
      setProof(null);
      setReviews(await api.reviews(selectedShopId));
      setShops(await api.shops());
      toast.success("Đã gửi đánh giá.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không gửi được đánh giá.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleNear() {
    if (near) {
      setNear(false);
      setLoading(true);
      try {
        setShops(await api.shops());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không tải được cửa hàng đối tác.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setError("");
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setNear(true);
      setLoading(true);
      const partnerShops = await api.shops();
      const orderedShops = [...partnerShops].sort((first, second) => {
        const firstDistance = hasRegisteredCoordinates(first) ? distanceKm(currentLocation, { lat: first.latitude, lng: first.longitude }) : Infinity;
        const secondDistance = hasRegisteredCoordinates(second) ? distanceKm(currentLocation, { lat: second.latitude, lng: second.longitude }) : Infinity;
        return firstDistance - secondDistance;
      });
      setShops(orderedShops);
      setSelectedShopId(orderedShops.find((shop) => shop.id === proof?.shopId)?.id ?? orderedShops.find(hasRegisteredCoordinates)?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lấy được vị trí hiện tại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PhoneShell>
      <StatusBar title="Cửa hàng quanh bạn" />
      <div className="px-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">{location ? "Đang dùng vị trí hiện tại" : "Chưa bật định vị"}</p>
            <p className="text-[10px] text-muted-foreground">Chỉ hiển thị doanh nghiệp đã đăng ký đối tác GoldenTime</p>
          </div>
          <button onClick={toggleNear} className={`rounded-full border px-3 py-2 text-xs font-semibold ${near ? "gt-gradient border-transparent text-white" : "bg-white border-border"}`}>
            <Navigation className="mr-1 inline h-3 w-3" />{near ? "Trong 5 km" : "Gần tôi"}
          </button>
        </div>

        <div className="relative h-64 overflow-hidden rounded-3xl border border-border bg-[oklch(0.95_0.04_140)] gt-shadow-soft">
          <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" aria-label="Bản đồ OpenStreetMap của cửa hàng đối tác GoldenTime" />
          {!leafletMapReady && !leafletMapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/70"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div>}
          {leafletMapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/90 p-4 text-center text-xs text-red-700">{leafletMapError}</div>}
          {leafletMapReady && visibleShops.every((shop) => !hasRegisteredCoordinates(shop)) && !location && <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-xl bg-white/95 px-3 py-2 text-center text-[11px] text-muted-foreground">Chưa có cửa hàng đối tác nào được ghim tọa độ.</div>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Cửa hàng đối tác ({visibleShops.length})</h3>
            {near && <p className="mt-0.5 text-[10px] text-muted-foreground">Gần bạn nhất trước · trong phạm vi 5 km</p>}
          </div>
          {loading && <LoaderCircle className="h-4 w-4 animate-spin text-primary" />}
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="mt-3 space-y-3">
          {visibleShops.map((shop) => (
            <button key={shop.id} onClick={() => setSelectedShopId(shop.id)} className={`w-full rounded-2xl border bg-white p-4 text-left gt-shadow-soft ${selectedShopId === shop.id ? "border-primary" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold">{shop.name}</h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{shop.address}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {shop.reviewCount > 0 ? <><span className="flex items-center gap-0.5 text-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><b>{Number(shop.rating).toFixed(1)}</b></span><span>({shop.reviewCount} đánh giá)</span></> : <span>Chưa có đánh giá</span>}
                    {near && location && hasRegisteredCoordinates(shop) && <span>• {distanceKm(location, { lat: shop.latitude, lng: shop.longitude }).toFixed(1)} km</span>}
                  </div>
                  {shop.popularFruit && <p className="mt-1 text-[11px]"><span className="text-muted-foreground">Nổi bật:</span> <span className="font-semibold text-primary">{shop.popularFruit}</span></p>}
                </div>
                <span className="rounded-lg bg-cream px-2 py-1 text-[10px] font-semibold">{shop.productCount} món</span>
              </div>
            </button>
          ))}
          {!loading && !visibleShops.length && <p className="rounded-2xl border border-border bg-white p-4 text-xs text-muted-foreground">{near ? "Không có cửa hàng đối tác nào có vị trí xác định trong bán kính 5 km." : "Chưa có cửa hàng đối tác trong hệ thống."}</p>}
        </div>

        {selectedShop && <section className="mt-5 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
          <h3 className="text-sm font-bold">Đánh giá • {selectedShop.name}</h3>
          {reviews.length ? <div className="mt-3 space-y-3">{reviews.slice(0, 5).map((review) => <div key={review.id} className="border-t border-border pt-3"><div className="flex justify-between"><p className="text-xs font-semibold">{review.author}</p><p className="text-xs text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div><p className="mt-1 text-sm">{review.comment}</p><p className="mt-1 text-[10px] text-muted-foreground">{review.purchased ? "Đã mua" : "Đã quét"}</p></div>)}</div> : <p className="mt-2 text-xs text-muted-foreground">Chưa có đánh giá.</p>}
          {canReviewSelectedShop ? <form onSubmit={submitReview} className="mt-4 border-t border-border pt-4"><p className="text-xs font-semibold">Bạn có thể đánh giá vì đã {proof?.orderId ? "đặt đơn" : "quét sản phẩm"}.</p><div className="mt-2 flex gap-1" aria-label="Chọn số sao">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} className={`text-2xl ${value <= rating ? "text-amber-400" : "text-gray-300"}`}>★</button>)}</div><textarea required maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Chia sẻ trải nghiệm của bạn" className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm" /><button disabled={busy} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl gt-gradient py-3 text-sm font-semibold text-white"><Send className="h-4 w-4" />{busy ? "Đang gửi…" : "Gửi đánh giá"}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</form> : <p className="mt-3 text-[11px] text-muted-foreground">{proof?.shopId ? "Đánh giá đơn hàng chỉ áp dụng cho cửa hàng bạn đã mua." : "Đánh giá chỉ mở sau khi bạn quét sản phẩm hoặc đặt đơn."}</p>}
        </section>}
        <div className="h-5" />
      </div>
    </PhoneShell>
  );
}
