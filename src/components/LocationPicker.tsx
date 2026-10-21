import { ExternalLink, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "@/lib/geo";

type LocationPickerProps = {
  address: string;
  value: Coordinates | null;
  onChange: (value: Coordinates | null) => void;
};

export function LocationPicker({ address, value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [latitude, setLatitude] = useState(value ? String(value.lat) : "");
  const [longitude, setLongitude] = useState(value ? String(value.lng) : "");

  onChangeRef.current = onChange;

  useEffect(() => {
    setLatitude(value ? String(value.lat) : "");
    setLongitude(value ? String(value.lng) : "");
  }, [value?.lat, value?.lng]);

  useEffect(() => {
    const container = containerRef.current;
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
      map.on("click", (event) => {
        onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
      });
      mapRef.current = map;
      setMapReady(true);
    }).catch(() => setMapError("Không tải được bản đồ. Hãy kiểm tra kết nối mạng rồi thử lại."));

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
      leafletRef.current = null;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!mapReady || !map || !leaflet) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const point: [number, number] = [value.lat, value.lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(point);
    } else {
      markerRef.current = leaflet.marker(point, {
        draggable: true,
        icon: leaflet.divIcon({
          className: "",
          html: '<div style="display:grid;place-items:center;width:36px;height:36px;border:3px solid white;border-radius:50%;background:#2563eb;color:white;font-weight:700;box-shadow:0 2px 8px #0005">📍</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      }).addTo(map);
      markerRef.current.on("dragend", () => {
        const position = markerRef.current?.getLatLng();
        if (position) onChangeRef.current({ lat: position.lat, lng: position.lng });
      });
    }
    map.setView(point, Math.max(map.getZoom(), 15));
  }, [mapReady, value?.lat, value?.lng]);

  function updateCoordinate(axis: "lat" | "lng", nextValue: string) {
    const nextLatitude = axis === "lat" ? nextValue : latitude;
    const nextLongitude = axis === "lng" ? nextValue : longitude;
    if (axis === "lat") setLatitude(nextValue);
    else setLongitude(nextValue);

    if (!nextLatitude.trim() || !nextLongitude.trim()) {
      onChange(null);
      return;
    }

    const lat = Number(nextLatitude);
    const lng = Number(nextLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      onChange(null);
      return;
    }
    onChange({ lat, lng });
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold">Chọn tọa độ cửa hàng</p>
          <p className="mt-1 text-xs text-muted-foreground">Tìm khu vực theo địa chỉ, rồi bấm đúng vị trí trên bản đồ hoặc kéo ghim.</p>
        </div>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-cream"
        >
          Tìm địa chỉ <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="relative mt-3 h-56 overflow-hidden rounded-lg border border-border bg-white">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-label="Chọn vị trí doanh nghiệp trên bản đồ OpenStreetMap" />
        {!mapReady && !mapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/70"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div>}
        {mapError && <div className="absolute inset-0 z-[500] grid place-items-center bg-white/90 p-4 text-center text-xs text-red-700">{mapError}</div>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[11px] font-semibold text-muted-foreground">
          Vĩ độ
          <input type="number" step="any" min="-90" max="90" value={latitude} onChange={(event) => updateCoordinate("lat", event.target.value)} placeholder="Ví dụ: 10.7769" className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-normal text-foreground outline-none focus:border-primary" />
        </label>
        <label className="text-[11px] font-semibold text-muted-foreground">
          Kinh độ
          <input type="number" step="any" min="-180" max="180" value={longitude} onChange={(event) => updateCoordinate("lng", event.target.value)} placeholder="Ví dụ: 106.7009" className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-normal text-foreground outline-none focus:border-primary" />
        </label>
      </div>
      {value ? <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-700"><MapPin className="h-3.5 w-3.5" />Đã chọn vị trí: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}</p> : <p className="mt-2 text-xs text-amber-700">Chưa chọn vị trí. Cần ghim đúng cửa hàng trước khi chấp nhận hồ sơ.</p>}
    </div>
  );
}
