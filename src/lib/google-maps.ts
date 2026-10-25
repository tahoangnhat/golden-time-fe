export type GoogleCoordinates = { lat: number; lng: number };

type GoogleLatLng = { lat(): number; lng(): number };
type GoogleMapEvent = { latLng?: GoogleLatLng };
type GoogleMap = {
  setCenter(position: GoogleCoordinates): void;
  setZoom(zoom: number): void;
  addListener(event: string, listener: (event: GoogleMapEvent) => void): GoogleMapsListener;
};
type GoogleMapsListener = { remove(): void };
type GooglePlaceSelectEvent = Event & { placePrediction: { toPlace(): GooglePlace } };
type GooglePlaceAutocompleteElement = HTMLElement & {
  addEventListener(type: "gmp-select", listener: (event: GooglePlaceSelectEvent) => void): void;
  removeEventListener(type: "gmp-select", listener: (event: GooglePlaceSelectEvent) => void): void;
};
type GoogleMarker = {
  setPosition(position: GoogleCoordinates | null): void;
  addListener(event: string, listener: (event: GoogleMapEvent) => void): GoogleMapsListener;
};
type GooglePlace = {
  fetchFields(request: { fields: string[] }): Promise<void>;
  formattedAddress?: string;
  id?: string;
  location?: GoogleLatLng;
};
type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: { map: GoogleMap; position: GoogleCoordinates | null; draggable: boolean }) => GoogleMarker;
    Geocoder: new () => { geocode(request: { location: GoogleCoordinates }, callback: (results: GoogleGeocodeResult[] | null, status: string) => void): void };
    places: { PlaceAutocompleteElement: new (options?: Record<string, unknown>) => GooglePlaceAutocompleteElement };
  };
};
type GoogleGeocodeResult = { formatted_address?: string; place_id?: string };

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __goldenTimeGoogleMaps?: Promise<GoogleMapsApi>;
  }
}

export function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("Bản đồ chỉ khả dụng trên trình duyệt."));
  const loadedMaps = window.google;
  if (loadedMaps?.maps?.places?.PlaceAutocompleteElement) return Promise.resolve(loadedMaps);
  if (window.__goldenTimeGoogleMaps) return window.__goldenTimeGoogleMaps;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return Promise.reject(new Error("Chưa cấu hình khóa Google Maps. Bạn có thể nhập tọa độ thủ công hoặc mở Google Maps để tra cứu."));

  window.__goldenTimeGoogleMaps = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "golden-time-google-maps";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=vi&region=VN&loading=async`;
    script.onload = () => {
      const loaded = window.google;
      if (loaded?.maps?.places?.PlaceAutocompleteElement) resolve(loaded);
      else reject(new Error("Google Maps chưa sẵn sàng. Kiểm tra quyền Maps JavaScript API và Places API của khóa."));
    };
    script.onerror = () => reject(new Error("Không tải được Google Maps. Kiểm tra kết nối và cấu hình API key."));
    document.head.appendChild(script);
  });
  return window.__goldenTimeGoogleMaps;
}

export type { GoogleMap, GoogleMapsApi, GoogleMapsListener, GoogleMarker, GooglePlaceAutocompleteElement, GooglePlaceSelectEvent };
