import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, MapPin, Navigation, Send, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
import {
  distanceKm,
  geocodeAddress,
  getGoogleMapsMapId,
  hasGoogleMapsApiKey,
  loadGoogleMapsLibraries,
  type Coordinates,
  type GoogleMapInstance,
  type GoogleMapsLibraries,
  type GoogleMarkerInstance,
} from "@/lib/googleMaps";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Bản đồ trái cây — Golden Time" }] }),
  component: MapScreen,
});

type ReviewProof = { orderId?: number; scanId?: number; shopId?: number };
type MapPin = { id: string; name: string; location: Coordinates; shop?: Shop; isUser?: boolean };
type PositionedMapPin = MapPin & { top: number; left: number };

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
  const [locationLookupLoading, setLocationLookupLoading] = useState(false);
  const [googleMapReady, setGoogleMapReady] = useState(false);
  const [error, setError] = useState("");
  const [locationLookupError, setLocationLookupError] = useState("");
  const [googleMapError, setGoogleMapError] = useState("");
  const [busy, setBusy] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const googleLibrariesRef = useRef<GoogleMapsLibraries | null>(null);
  const markerInstancesRef = useRef<GoogleMarkerInstance[]>([]);

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

  const fallbackPins = useMemo<PositionedMapPin[]>(() => {
    const pins: MapPin[] = [
      ...visibleShops.filter(hasRegisteredCoordinates).map((shop) => ({
        id: `shop-${shop.id}`,
        name: shop.name,
        location: { lat: shop.latitude, lng: shop.longitude },
        shop,
      })),
      ...(location ? [{ id: "user", name: "Vị trí của bạn", location, isUser: true }] : []),
    ];
    if (pins.length === 0) return [];

    const latitudes = pins.map((pin) => pin.location.lat);
    const longitudes = pins.map((pin) => pin.location.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    return pins.map((pin) => ({
      ...pin,
      top: maxLat === minLat ? 50 : 15 + (1 - (pin.location.lat - minLat) / (maxLat - minLat)) * 70,
      left: maxLng === minLng ? 50 : 15 + ((pin.location.lng - minLng) / (maxLng - minLng)) * 70,
    }));
  }, [visibleShops, location]);

  const selectedShop = shops.find((shop) => shop.id === selectedShopId) || null;
  const canReviewSelectedShop = proof !== null
    && (!proof.shopId || proof.shopId === selectedShopId);

  useEffect(() => {
    if (!near || !location || !hasGoogleMapsApiKey() || !mapContainerRef.current) {
      setGoogleMapReady(false);
      return;
    }

    let cancelled = false;
    setGoogleMapReady(false);
    setGoogleMapError("");
    void loadGoogleMapsLibraries().then((libraries) => {
      if (cancelled || !mapContainerRef.current) return;
      googleLibrariesRef.current = libraries;
      mapInstanceRef.current = new libraries.maps.Map(mapContainerRef.current, {
        center: location,
        zoom: 14,
        mapId: getGoogleMapsMapId(),
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });
      setGoogleMapReady(true);
    }).catch((cause) => {
      if (!cancelled) setGoogleMapError(cause instanceof Error ? cause.message : "Không tải được Google Maps.");
    });

    return () => {
      cancelled = true;
      markerInstancesRef.current.forEach((marker) => { marker.map = null; });
      markerInstancesRef.current = [];
      mapInstanceRef.current = null;
      googleLibrariesRef.current = null;
    };
  }, [near, location]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const libraries = googleLibrariesRef.current;
    if (!googleMapReady || !map || !libraries || !location) return;

    markerInstancesRef.current.forEach((marker) => { marker.map = null; });
    markerInstancesRef.current = [];
    const addMarker = (pin: MapPin, label: string, color: string) => {
      const content = document.createElement("div");
      content.textContent = label;
      content.style.cssText = `display:grid;place-items:center;width:34px;height:34px;border:2px solid white;border-radius:50%;background:${color};color:white;font-size:16px;font-weight:700;box-shadow:0 2px 8px #0004`;
      markerInstancesRef.current.push(new libraries.marker.AdvancedMarkerElement({
        map,
        position: pin.location,
        title: pin.name,
        content,
      }));
    };

    addMarker({ id: "user", name: "Vị trí của bạn", location, isUser: true }, "Bạn", "#2563eb");
    visibleShops.forEach((shop) => addMarker({
      id: `shop-${shop.id}`,
      name: shop.name,
      location: { lat: shop.latitude, lng: shop.longitude },
      shop,
    }, "🍎", "#e47d24"));
  }, [googleMapReady, location, visibleShops]);

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

  async function resolveRegisteredShopLocations(partnerShops: Shop[]) {
    const missingLocations = partnerShops.filter((shop) => !hasRegisteredCoordinates(shop));
    if (!missingLocations.length) return partnerShops;
    if (!hasGoogleMapsApiKey()) {
      setLocationLookupError("Một số hồ sơ chưa có tọa độ. Cần cấu hình khóa Google Maps để xác định vị trí từ địa chỉ đã đăng ký.");
      return partnerShops;
    }

    setLocationLookupLoading(true);
    const resolved = await Promise.allSettled(missingLocations.map((shop) => geocodeAddress(shop.address ?? "")));
    setLocationLookupLoading(false);
    let unresolvedCount = 0;
    let resultIndex = 0;
    const updatedShops = partnerShops.map((shop) => {
      if (hasRegisteredCoordinates(shop)) return shop;
      const outcome = resolved[resultIndex++];
      if (outcome?.status === "fulfilled") return { ...shop, latitude: outcome.value.lat, longitude: outcome.value.lng };
      unresolvedCount++;
      return shop;
    });
    if (unresolvedCount) {
      setLocationLookupError(`Google Maps chưa xác định được vị trí của ${unresolvedCount} cửa hàng từ địa chỉ đăng ký.`);
    }
    return updatedShops;
  }

  async function toggleNear() {
    if (near) {
      setNear(false);
      setLocationLookupError("");
      setGoogleMapError("");
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
    setLocationLookupError("");
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setNear(true);
      setLoading(true);
      const partnerShops = await api.shops();
      const locatedShops = await resolveRegisteredShopLocations(partnerShops);
      const orderedShops = [...locatedShops].sort((first, second) => {
        const firstDistance = distanceKm(currentLocation, { lat: first.latitude, lng: first.longitude });
        const secondDistance = distanceKm(currentLocation, { lat: second.latitude, lng: second.longitude });
        return firstDistance - secondDistance;
      });
      setShops(orderedShops);
      setSelectedShopId(orderedShops.find((shop) => shop.id === proof?.shopId)?.id ?? orderedShops.find(hasRegisteredCoordinates)?.id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lấy được vị trí hiện tại.");
    } finally {
      setLoading(false);
      setLocationLookupLoading(false);
    }
  }

  const showGoogleMap = near && Boolean(location) && hasGoogleMapsApiKey() && !googleMapError;

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
          {showGoogleMap ? (
            <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" aria-label="Bản đồ Google Maps của cửa hàng đối tác GoldenTime" />
          ) : (
            <>
              <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="gt-map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="oklch(0.85 0.04 140)" strokeWidth="1" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#gt-map-grid)" />
              </svg>
              {fallbackPins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => { if (pin.shop) setSelectedShopId(pin.shop.id); }}
                  title={pin.name}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border-2 bg-white text-xl ${pin.isUser ? "border-blue-500" : pin.shop?.id === selectedShopId ? "border-primary gt-shadow" : "border-white shadow"}`}
                  style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
                >
                  {pin.isUser ? <MapPin className="h-5 w-5 text-blue-600" /> : "🍎"}
                </button>
              ))}
              {!fallbackPins.length && <div className="absolute inset-0 grid place-items-center"><p className="rounded-xl bg-white/90 p-3 text-xs text-muted-foreground">Chưa có cửa hàng đối tác có tọa độ.</p></div>}
            </>
          )}
          {showGoogleMap && !googleMapReady && <div className="absolute inset-0 grid place-items-center bg-white/50"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div>}
          <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] text-muted-foreground">
            {showGoogleMap ? "Google Maps" : googleMapError ? "Không tải được Google Maps" : "Vị trí cửa hàng đối tác"}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Cửa hàng đối tác ({visibleShops.length})</h3>
            {near && <p className="mt-0.5 text-[10px] text-muted-foreground">Gần bạn nhất trước · trong phạm vi 5 km</p>}
          </div>
          {(loading || locationLookupLoading) && <LoaderCircle className="h-4 w-4 animate-spin text-primary" />}
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {locationLookupError && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{locationLookupError}</p>}
        {!hasGoogleMapsApiKey() && near && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Cần cấu hình Google Maps API key để xem bản đồ đường phố.</p>}
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
