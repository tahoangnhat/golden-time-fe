import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, Send, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { LatLngBounds, LayerGroup, Map as LeafletMap } from "leaflet";
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
  type NearbyChainShop,
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

function hasChainShopCoordinates(shop: NearbyChainShop) {
  return Number.isFinite(shop.latitude) && shop.latitude >= -90 && shop.latitude <= 90
    && Number.isFinite(shop.longitude) && shop.longitude >= -180 && shop.longitude <= 180
    && !(shop.latitude === 0 && shop.longitude === 0);
}

function normalizeStoreName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function MapScreen() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [nearbyChainShops, setNearbyChainShops] = useState<NearbyChainShop[]>([]);
  const [chainShopsLoading, setChainShopsLoading] = useState(false);
  const [chainShopsError, setChainShopsError] = useState("");
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
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
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

  useEffect(() => {
    let cancelled = false;
    getCurrentLocation().then((currentLocation) => {
      if (cancelled) return;
      setLocation(currentLocation);
      setLocationError("");
    }).catch((cause) => {
      if (cancelled) return;
      setLocationError(cause instanceof Error ? cause.message : "Hãy cho phép truy cập vị trí để tìm cửa hàng gần bạn.");
    }).finally(() => {
      if (!cancelled) setLocationLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    setChainShopsLoading(true);
    setChainShopsError("");
    api.nearbyChainShops(location).then((result) => {
      if (!cancelled) setNearbyChainShops(result);
    }).catch((cause) => {
      if (!cancelled) setChainShopsError(cause instanceof Error ? cause.message : "Không tải được cửa hàng ngoài GoldenTime.");
    }).finally(() => {
      if (!cancelled) setChainShopsLoading(false);
    });
    return () => { cancelled = true; };
  }, [location]);

  const visibleShops = useMemo(() => {
    if (!location) return [];
    return shops
      .map((shop) => ({ shop, distance: distanceKm(location, { lat: shop.latitude, lng: shop.longitude }) }))
      .filter(({ shop, distance }) => hasRegisteredCoordinates(shop) && distance <= 10)
      .sort((first, second) => first.distance - second.distance)
      .map(({ shop }) => shop);
  }, [location, shops]);

  const visibleChainShops = useMemo(() => {
    if (!location) return [];
    return nearbyChainShops
      .filter((externalShop) => hasChainShopCoordinates(externalShop)
        && distanceKm(location, { lat: externalShop.latitude, lng: externalShop.longitude }) <= 10
        && !shops.some((partnerShop) => hasRegisteredCoordinates(partnerShop)
          && normalizeStoreName(partnerShop.name) === normalizeStoreName(externalShop.name)
          && distanceKm(
            { lat: partnerShop.latitude, lng: partnerShop.longitude },
            { lat: externalShop.latitude, lng: externalShop.longitude },
          ) <= 0.1))
      .sort((first, second) => distanceKm(location, { lat: first.latitude, lng: first.longitude })
        - distanceKm(location, { lat: second.latitude, lng: second.longitude }));
  }, [location, nearbyChainShops, shops]);

  useEffect(() => {
    if (!location) return;
    setSelectedShopId((current) => visibleShops.some((shop) => shop.id === current)
      ? current
      : visibleShops.find((shop) => shop.id === proof?.shopId)?.id ?? visibleShops[0]?.id ?? null);
  }, [location, proof?.shopId, visibleShops]);

  const selectedShop = visibleShops.find((shop) => shop.id === selectedShopId) || null;
  const canReviewSelectedShop = Boolean(proof)
    && (!proof?.shopId || proof.shopId === selectedShopId);

  useEffect(() => {
    const container = mapContainer;
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
  }, [mapContainer]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const leaflet = leafletRef.current;
    const layer = markersLayerRef.current;
    if (!leafletMapReady || !map || !leaflet || !layer) return;

    layer.clearLayers();
    const points: [number, number][] = [];
    let searchAreaBounds: LatLngBounds | null = null;
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

    visibleChainShops.forEach((shop) => {
      const point: [number, number] = [shop.latitude, shop.longitude];
      points.push(point);
      const popup = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = shop.name;
      popup.appendChild(name);
      const source = document.createElement("div");
      source.textContent = "Cửa hàng ngoài hệ thống GoldenTime · OpenStreetMap";
      popup.appendChild(source);
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
        icon: leaflet.divIcon({ className: "", html: '<div style="display:grid;place-items:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#7c3aed;color:white;font-size:18px;box-shadow:0 2px 8px #0005">🛒</div>', iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: shop.name,
      }).bindPopup(popup).addTo(layer);
    });

    if (location) {
      const point: [number, number] = [location.lat, location.lng];
      points.push(point);
      searchAreaBounds = leaflet.circle(point, {
        radius: 10_000,
        color: "#2563eb",
        weight: 1,
        opacity: 0.6,
        fillColor: "#2563eb",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(layer).getBounds();
      leaflet.marker(point, {
        icon: leaflet.divIcon({ className: "", html: '<div style="display:grid;place-items:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#2563eb;color:white;font-size:12px;font-weight:700;box-shadow:0 2px 8px #0005">Bạn</div>', iconSize: [36, 36], iconAnchor: [18, 18] }),
        title: "Vị trí của bạn",
      }).bindPopup("Vị trí của bạn").addTo(layer);
    }

    if (location && searchAreaBounds) {
      const bounds = searchAreaBounds;
      points.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
    } else if (points.length > 1) {
      map.fitBounds(leaflet.latLngBounds(points), { padding: [24, 24], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.setView([16.047079, 108.20623], 5);
    }
  }, [leafletMapReady, location, visibleChainShops, visibleShops]);

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

  return (
    <PhoneShell>
      <StatusBar title="Cửa hàng quanh bạn" />
      <div className="px-5">
        <div className="mb-3">
          <p className="text-xs font-semibold">{locationLoading ? "Đang lấy vị trí của bạn…" : location ? "Cửa hàng trong bán kính 10 km" : "Chưa lấy được vị trí"}</p>
          <p className="text-[10px] text-muted-foreground">Cửa hàng đối tác GoldenTime và các chuỗi ngoài hệ thống</p>
          {locationError && <p role="status" className="mt-1 text-[10px] text-amber-800">{locationError}</p>}
        </div>

        <div className="relative h-64 overflow-hidden rounded-3xl border border-border bg-[oklch(0.95_0.04_140)] gt-shadow-soft">
          <div ref={setMapContainer} className="absolute inset-0 h-full w-full" aria-label="Bản đồ OpenStreetMap của cửa hàng gần bạn" />
          {!leafletMapReady && !leafletMapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/70"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div>}
          {leafletMapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/90 p-4 text-center text-xs text-red-700">{leafletMapError}</div>}
          {leafletMapReady && !location && <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2 rounded-xl bg-white/95 px-3 py-2 text-center text-[11px] text-muted-foreground">{locationLoading ? "Đang xác định vị trí…" : "Cho phép vị trí để tìm cửa hàng gần bạn."}</div>}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-orange-500" />Đối tác GoldenTime</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-violet-600" />Chuỗi cửa hàng khác</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-600" />Vị trí của bạn</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Cửa hàng đối tác ({visibleShops.length})</h3>
            {location && <p className="mt-0.5 text-[10px] text-muted-foreground">Gần bạn nhất trước · trong phạm vi 10 km</p>}
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
                    {location && hasRegisteredCoordinates(shop) && <span>• {distanceKm(location, { lat: shop.latitude, lng: shop.longitude }).toFixed(1)} km</span>}
                  </div>
                  {shop.popularFruit && <p className="mt-1 text-[11px]"><span className="text-muted-foreground">Nổi bật:</span> <span className="font-semibold text-primary">{shop.popularFruit}</span></p>}
                </div>
                <span className="rounded-lg bg-cream px-2 py-1 text-[10px] font-semibold">{shop.productCount} món</span>
              </div>
            </button>
          ))}
          {!loading && !locationLoading && !location && <p className="rounded-2xl border border-border bg-white p-4 text-xs text-muted-foreground">Hãy cho phép vị trí trong trình duyệt để xem các cửa hàng gần bạn.</p>}
          {!loading && location && !visibleShops.length && <p className="rounded-2xl border border-border bg-white p-4 text-xs text-muted-foreground">Không có cửa hàng đối tác GoldenTime nào được ghim trong bán kính 10 km.</p>}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Cửa hàng ngoài GoldenTime ({visibleChainShops.length})</h3>
            {location && <p className="mt-0.5 text-[10px] text-muted-foreground">Các chuỗi trong danh sách · trong phạm vi 10 km · dữ liệu OpenStreetMap có thể chưa đầy đủ</p>}
          </div>
          {chainShopsLoading && <LoaderCircle className="h-4 w-4 animate-spin text-primary" />}
        </div>
        {chainShopsError && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{chainShopsError}</p>}
        <div className="mt-3 space-y-3">
          {visibleChainShops.map((shop) => (
            <article key={shop.id} className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
              <h4 className="text-sm font-bold">{shop.name}</h4>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{shop.address || "Chưa có địa chỉ chi tiết trên OpenStreetMap"}</p>
              {location && <p className="mt-1 text-[11px] text-muted-foreground">{distanceKm(location, { lat: shop.latitude, lng: shop.longitude }).toFixed(1)} km · OpenStreetMap</p>}
            </article>
          ))}
          {!locationLoading && location && !chainShopsLoading && !chainShopsError && !visibleChainShops.length && <p className="rounded-2xl border border-border bg-white p-4 text-xs text-muted-foreground">Không tìm thấy cửa hàng trong danh sách ở OpenStreetMap trong bán kính 10 km.</p>}
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
