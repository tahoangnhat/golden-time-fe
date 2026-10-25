import { ExternalLink, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/lib/geo";
import { loadGoogleMaps, type GoogleMap, type GoogleMapsListener, type GoogleMarker, type GooglePlaceAutocompleteElement, type GooglePlaceSelectEvent } from "@/lib/google-maps";

type GoogleAddressPickerProps = {
  address: string;
  value: Coordinates | null;
  googlePlaceId?: string | null;
  onAddressChange: (address: string) => void;
  onChange: (value: Coordinates | null) => void;
  onPlaceIdChange?: (placeId: string | null) => void;
};

export function GoogleAddressPicker({ address, value, googlePlaceId, onAddressChange, onChange, onPlaceIdChange }: GoogleAddressPickerProps) {
  const autocompleteElementRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const callbacksRef = useRef({ onAddressChange, onChange, onPlaceIdChange });
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [latitude, setLatitude] = useState(value ? String(value.lat) : "");
  const [longitude, setLongitude] = useState(value ? String(value.lng) : "");

  callbacksRef.current = { onAddressChange, onChange, onPlaceIdChange };

  useEffect(() => {
    setLatitude(value ? String(value.lat) : "");
    setLongitude(value ? String(value.lng) : "");
  }, [value?.lat, value?.lng]);

  useEffect(() => {
    const element = mapElementRef.current;
    const autocompleteContainer = autocompleteElementRef.current;
    if (!element || !autocompleteContainer) return;
    let cancelled = false;
    let map: GoogleMap | null = null;
    let marker: GoogleMarker | null = null;
    let mapClickListener: GoogleMapsListener | null = null;
    let markerDragListener: GoogleMapsListener | null = null;
    let autocomplete: GooglePlaceAutocompleteElement | null = null;
    let placeSelectListener: ((event: GooglePlaceSelectEvent) => void) | null = null;

    void loadGoogleMaps().then((google) => {
      if (cancelled || !element.isConnected) return;
      const initial = value;
      map = new google.maps.Map(element, {
        center: initial ? { lat: initial.lat, lng: initial.lng } : { lat: 16.047079, lng: 108.20623 },
        zoom: initial ? 16 : 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      });
      marker = new google.maps.Marker({
        map,
        position: initial ? { lat: initial.lat, lng: initial.lng } : null,
        draggable: true,
        title: "Vị trí cửa hàng",
      });
      mapRef.current = map;
      markerRef.current = marker;

      const updatePin = (point: Coordinates) => {
        marker?.setPosition(point);
        map?.setCenter(point);
        map?.setZoom(16);
        callbacksRef.current.onChange(point);
      };
      const geocoder = new google.maps.Geocoder();
      const reverseGeocode = (point: Coordinates) => {
        geocoder.geocode({ location: point }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            if (results[0].formatted_address) callbacksRef.current.onAddressChange(results[0].formatted_address);
            callbacksRef.current.onPlaceIdChange?.(results[0].place_id ?? null);
          }
        });
      };
      mapClickListener = map.addListener("click", (event) => {
        if (!event.latLng) return;
        const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        updatePin(point);
        reverseGeocode(point);
      });
      markerDragListener = marker.addListener("dragend", (event) => {
        if (!event.latLng) return;
        const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        updatePin(point);
        reverseGeocode(point);
      });

      autocomplete = new google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes: ["VN"],
        requestedLanguage: "vi",
        placeholder: "Tìm địa chỉ hoặc cửa hàng trên Google Maps",
        description: "Tìm và chọn địa chỉ cửa hàng trên Google Maps",
      });
      autocomplete.style.width = "100%";
      autocompleteContainer.replaceChildren(autocomplete);
      placeSelectListener = (event) => {
        void (async () => {
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({ fields: ["formattedAddress", "location", "id"] });
            if (!place.location) {
              setMapError("Địa chỉ này chưa có tọa độ. Hãy chọn một gợi ý khác hoặc ghim vị trí trên bản đồ.");
              return;
            }
            const point = { lat: place.location.lat(), lng: place.location.lng() };
            setMapError("");
            if (place.formattedAddress) callbacksRef.current.onAddressChange(place.formattedAddress);
            callbacksRef.current.onPlaceIdChange?.(place.id ?? null);
            updatePin(point);
          } catch {
            setMapError("Không lấy được chi tiết địa chỉ. Hãy chọn lại gợi ý hoặc ghim vị trí trên bản đồ.");
          }
        })();
      };
      autocomplete.addEventListener("gmp-select", placeSelectListener);
      setMapReady(true);
    }).catch((cause: unknown) => {
      if (!cancelled) setMapError(cause instanceof Error ? cause.message : "Không tải được Google Maps.");
    });

    return () => {
      cancelled = true;
      mapClickListener?.remove();
      markerDragListener?.remove();
      if (autocomplete && placeSelectListener) autocomplete.removeEventListener("gmp-select", placeSelectListener);
      autocomplete?.remove();
      marker?.setPosition(null);
      mapRef.current = null;
      markerRef.current = null;
    };
  // The map is initialized once. Changes to the chosen point are applied below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!mapReady || !map || !marker || !value) return;
    const point = { lat: value.lat, lng: value.lng };
    marker.setPosition(point);
    map.setCenter(point);
    map.setZoom(16);
  }, [mapReady, value?.lat, value?.lng]);

  function updateCoordinate(axis: "lat" | "lng", nextValue: string) {
    const nextLatitude = axis === "lat" ? nextValue : latitude;
    const nextLongitude = axis === "lng" ? nextValue : longitude;
    if (axis === "lat") setLatitude(nextValue);
    else setLongitude(nextValue);
    if (!nextLatitude.trim() || !nextLongitude.trim()) {
      onChange(null);
      onPlaceIdChange?.(null);
      return;
    }
    const lat = Number(nextLatitude);
    const lng = Number(nextLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      onChange(null);
      onPlaceIdChange?.(null);
      return;
    }
    onChange({ lat, lng });
    onPlaceIdChange?.(null);
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="block text-xs font-semibold">
        Tìm địa chỉ trên Google Maps
        <div ref={autocompleteElementRef} className="mt-1 min-h-10 rounded-lg border border-border bg-white px-2 py-1" />
      </div>
      <label className="mt-3 block text-xs font-semibold">
        Địa chỉ cửa hàng
        <input
          value={address}
          onChange={(event) => {
            onAddressChange(event.target.value);
            onPlaceIdChange?.(null);
          }}
          placeholder="Địa chỉ sẽ điền sau khi chọn gợi ý; có thể sửa lại tại đây"
          maxLength={512}
          className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-normal outline-none focus:border-primary"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Chọn gợi ý Google Maps, hoặc bấm / kéo ghim đến đúng cửa hàng.</span>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Mở Google Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="relative mt-3 h-56 overflow-hidden rounded-lg border border-border bg-white">
        <div ref={mapElementRef} className="absolute inset-0 h-full w-full" aria-label="Bản đồ Google Maps để chọn vị trí cửa hàng" />
        {!mapReady && !mapError && <div className="absolute inset-0 z-10 grid place-items-center bg-white/70"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div>}
        {mapError && <div role="status" className="absolute inset-x-2 top-2 z-10 rounded-lg bg-white/95 p-2 text-xs text-amber-800 shadow">{mapError}</div>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[11px] font-semibold text-muted-foreground">Vĩ độ
          <input type="number" step="any" min="-90" max="90" value={latitude} onChange={(event) => updateCoordinate("lat", event.target.value)} placeholder="Ví dụ: 10.7769" className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-normal text-foreground outline-none focus:border-primary" />
        </label>
        <label className="text-[11px] font-semibold text-muted-foreground">Kinh độ
          <input type="number" step="any" min="-180" max="180" value={longitude} onChange={(event) => updateCoordinate("lng", event.target.value)} placeholder="Ví dụ: 106.7009" className="mt-1 w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs font-normal text-foreground outline-none focus:border-primary" />
        </label>
      </div>
      {value
        ? <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-700"><MapPin className="h-3.5 w-3.5" />Đã ghim vị trí: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}{googlePlaceId ? " · Đã liên kết địa điểm Google" : ""}</p>
        : <p className="mt-2 text-xs text-amber-700">Chưa ghim vị trí. Hãy chọn gợi ý hoặc ghim cửa hàng trên bản đồ trước khi lưu hồ sơ.</p>}
    </div>
  );
}
