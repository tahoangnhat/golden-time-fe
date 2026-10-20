export type Coordinates = { lat: number; lng: number };

type GoogleLatLng = { lat: () => number; lng: () => number };
type GeocoderResult = { geometry: { location: GoogleLatLng } };

export type GoogleMapInstance = object;
export type GoogleMarkerInstance = { map: GoogleMapInstance | null };

type GoogleMapOptions = {
  center: Coordinates;
  zoom: number;
  mapId: string;
  disableDefaultUI: boolean;
  zoomControl: boolean;
  clickableIcons: boolean;
};

export type GoogleMapsLibraries = {
  maps: {
    Map: new (container: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
  };
  marker: {
    AdvancedMarkerElement: new (options: {
      map: GoogleMapInstance | null;
      position: Coordinates;
      title: string;
      content?: HTMLElement;
    }) => GoogleMarkerInstance;
  };
  geocoding: {
    Geocoder: new () => {
      geocode: (request: {
        address: string;
        region: string;
        componentRestrictions: { country: string };
      }) => Promise<{ results: GeocoderResult[] }>;
    };
  };
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      importLibrary: (name: string) => Promise<unknown>;
    };
  };
};

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";
const SCRIPT_ID = "golden-time-google-maps-js";

let scriptPromise: Promise<void> | null = null;

export function hasGoogleMapsApiKey() {
  return MAPS_API_KEY.length > 0;
}

export function getGoogleMapsMapId() {
  return MAP_ID;
}

export async function loadGoogleMapsLibraries(): Promise<GoogleMapsLibraries> {
  if (!MAPS_API_KEY) {
    throw new Error("Chưa cấu hình khóa Google Maps cho ứng dụng.");
  }

  const googleWindow = window as GoogleMapsWindow;
  if (!googleWindow.google?.maps?.importLibrary) {
    if (!scriptPromise) {
      scriptPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        const script = existingScript ?? document.createElement("script");
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_API_KEY)}&v=weekly&loading=async`;
        script.id = SCRIPT_ID;
        script.onload = () => resolve();
        script.onerror = () => {
          script.remove();
          scriptPromise = null;
          reject(new Error("Không tải được Google Maps. Hãy kiểm tra khóa API và quyền truy cập."));
        };
        if (!existingScript) document.head.appendChild(script);
      });
    }
    await scriptPromise;
  }

  const mapsApi = (window as GoogleMapsWindow).google?.maps;
  if (!mapsApi?.importLibrary) {
    throw new Error("Google Maps chưa sẵn sàng. Hãy kiểm tra cấu hình API key.");
  }

  const [maps, marker, geocoding] = await Promise.all([
    mapsApi.importLibrary("maps"),
    mapsApi.importLibrary("marker"),
    mapsApi.importLibrary("geocoding"),
  ]);

  return {
    maps: maps as GoogleMapsLibraries["maps"],
    marker: marker as GoogleMapsLibraries["marker"],
    geocoding: geocoding as GoogleMapsLibraries["geocoding"],
  };
}

export async function geocodeAddress(address: string): Promise<Coordinates> {
  const normalizedAddress = address.trim();
  if (!normalizedAddress) throw new Error("Hồ sơ doanh nghiệp chưa có địa chỉ để xác định vị trí.");

  const libraries = await loadGoogleMapsLibraries();
  const { results } = await new libraries.geocoding.Geocoder().geocode({
    address: normalizedAddress,
    region: "VN",
    componentRestrictions: { country: "VN" },
  });
  const location = results[0]?.geometry.location;
  if (!location) throw new Error("Google Maps không tìm thấy vị trí cho địa chỉ doanh nghiệp đã đăng ký.");

  return { lat: location.lat(), lng: location.lng() };
}

export function distanceKm(from: Coordinates, to: Coordinates) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to.lat - from.lat);
  const longitudeDelta = radians(to.lng - from.lng);
  const rawValue = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  const value = Math.min(1, Math.max(0, rawValue));
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
