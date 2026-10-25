import { LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";
import type { Coordinates } from "@/lib/geo";

type LocationPickerProps = {
  address: string;
  value: Coordinates | null;
  onAddressChange: (address: string) => void;
  onChange: (value: Coordinates | null) => void;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  return api.mapAddressSearch(query);
}

async function reverseNominatim(point: Coordinates): Promise<string | null> {
  const result = await api.mapAddressReverse(point);
  return result.display_name ?? null;
}

export function LocationPicker({ address, value, onAddressChange, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const callbacksRef = useRef({ onAddressChange, onChange });
  const reverseLookupIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);
  const selectMapPointRef = useRef<(point: Coordinates) => void>(() => {});
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [searchQuery, setSearchQuery] = useState(address);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [latitude, setLatitude] = useState(value ? String(value.lat) : "");
  const [longitude, setLongitude] = useState(value ? String(value.lng) : "");

  callbacksRef.current = { onAddressChange, onChange };

  selectMapPointRef.current = (point) => {
    callbacksRef.current.onChange(point);
    const lookupId = ++reverseLookupIdRef.current;
    searchRequestIdRef.current += 1;
    setSearchBusy(false);
    setSearchResults([]);
    setSearchError("");
    void reverseNominatim(point).then((resolvedAddress) => {
      if (lookupId !== reverseLookupIdRef.current) return;
      if (resolvedAddress) {
        callbacksRef.current.onAddressChange(resolvedAddress);
        setSearchQuery(resolvedAddress);
      }
    }).catch((cause: unknown) => {
      if (lookupId !== reverseLookupIdRef.current) return;
      setSearchError(cause instanceof Error ? cause.message : "Không tra được địa chỉ tại ghim này.");
    });
  };

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
        selectMapPointRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
      });
      mapRef.current = map;
      setMapReady(true);
    }).catch(() => setMapError("Không tải được bản đồ. Hãy kiểm tra kết nối mạng rồi thử lại."));

    return () => {
      cancelled = true;
      reverseLookupIdRef.current += 1;
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
        if (position) selectMapPointRef.current({ lat: position.lat, lng: position.lng });
      });
    }
    map.setView(point, Math.max(map.getZoom(), 15));
  }, [mapReady, value?.lat, value?.lng]);

  async function submitSearch() {
    const requestId = ++searchRequestIdRef.current;
    reverseLookupIdRef.current += 1;
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchError("Nhập ít nhất 3 ký tự để tìm địa chỉ.");
      return;
    }
    setSearchError("");
    setSearchResults([]);
    setSearchBusy(true);
    try {
      const results = await searchNominatim(query);
      if (requestId !== searchRequestIdRef.current) return;
      setSearchResults(results);
      if (results.length === 0) setSearchError("Không tìm thấy địa chỉ. Hãy thử thêm phường, quận hoặc tỉnh.");
    } catch (cause) {
      if (requestId !== searchRequestIdRef.current) return;
      setSearchError(cause instanceof Error ? cause.message : "Không tìm được địa chỉ lúc này.");
    } finally {
      if (requestId === searchRequestIdRef.current) setSearchBusy(false);
    }
  }

  function chooseResult(result: NominatimResult) {
    const point = { lat: Number(result.lat), lng: Number(result.lon) };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng) || point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return;
    reverseLookupIdRef.current += 1;
    searchRequestIdRef.current += 1;
    setSearchBusy(false);
    onAddressChange(result.display_name);
    onChange(point);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setSearchError("");
  }

  function updateCoordinate(axis: "lat" | "lng", nextValue: string) {
    const nextLatitude = axis === "lat" ? nextValue : latitude;
    const nextLongitude = axis === "lng" ? nextValue : longitude;
    reverseLookupIdRef.current += 1;
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
      <div>
        <p className="text-xs font-semibold">Tìm địa chỉ trên OpenStreetMap</p>
        <div className="mt-1 flex gap-2">
            <input
              type="search"
              aria-label="Địa chỉ cần tìm trên OpenStreetMap"
              value={searchQuery}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void submitSearch();
                }
              }}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                searchRequestIdRef.current += 1;
                setSearchBusy(false);
                setSearchResults([]);
                setSearchError("");
              }}
              placeholder="Nhập tên cửa hàng, đường, phường hoặc thành phố"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => void submitSearch()}
              disabled={searchBusy}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg gt-gradient px-3 text-xs font-semibold text-white disabled:opacity-60"
            >
              {searchBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Tìm
            </button>
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold">
        Địa chỉ cửa hàng
        <input
          value={address}
          onChange={(event) => {
            reverseLookupIdRef.current += 1;
            setSearchQuery(event.target.value);
            searchRequestIdRef.current += 1;
            setSearchBusy(false);
            setSearchResults([]);
            setSearchError("");
            onAddressChange(event.target.value);
          }}
          placeholder="Chọn kết quả tìm kiếm hoặc tự nhập địa chỉ"
          maxLength={512}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-primary"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">Tìm kiếm chỉ chạy khi bạn bấm Tìm. Chọn kết quả, bấm bản đồ hoặc kéo ghim để xác định vị trí; địa chỉ có thể sửa trước khi lưu. © <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.</p>

      {searchError && <p role="status" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{searchError}</p>}
      {searchResults.length > 0 && (
        <ul className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border bg-white">
          {searchResults.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                onClick={() => chooseResult(result)}
                className="w-full border-b border-border px-3 py-2 text-left text-xs leading-5 last:border-b-0 hover:bg-cream"
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-3 h-56 overflow-hidden rounded-lg border border-border bg-white">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-label="Chọn vị trí cửa hàng trên bản đồ OpenStreetMap" />
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
      {value ? <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-700"><MapPin className="h-3.5 w-3.5" />Đã ghim vị trí: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}</p> : <p className="mt-2 text-xs text-amber-700">Chưa chọn vị trí. Hãy chọn kết quả tìm kiếm hoặc ghim đúng cửa hàng trên bản đồ trước khi lưu.</p>}
    </div>
  );
}
