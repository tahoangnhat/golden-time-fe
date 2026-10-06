const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api").replace(/\/$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
const TOKEN_KEY = "golden-time-access-token";
export const AUTH_CHANGED_EVENT = "golden-time-auth-changed";

export type ApiErrorBody = { status?: number; message?: string };
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type UserProfile = { id: number; email: string; phone?: string | null; fullName: string; role: "USER" | "SHOP_OWNER" | "ADMIN" };
export type AuthResponse = { accessToken: string; tokenType: string; expiresInSeconds: number; refreshExpiresInSeconds: number; user: UserProfile };
export type Fruit = { id: number; slug: string; name: string; emoji: string; category?: string | null };
export type FruitNutrition = Fruit & {
  caloriesPer100g?: number | null; vitaminCMg?: number | null; fiberG?: number | null;
  sugarG?: number | null; potassiumMg?: number | null; waterPercent?: number | null;
  healthBenefits?: string | null; servingNote?: string | null; personalizedTip?: string | null;
};
export type Product = {
  id: number; shopId: number; shopName: string; fruitId: number; fruitSlug: string;
  fruitName: string; emoji: string; category?: string | null; displayName: string;
  pricePerKg: number; stockKg: number; aiScore?: number | null; batchCode?: string | null;
  distanceKm?: number | null;
};
export type Shop = {
  id: number; name: string; address?: string | null; latitude: number; longitude: number;
  rating: number; reviewCount: number; description?: string | null; popularFruit?: string | null;
  productCount: number; distanceKm?: number | null;
};
export type PriceQuote = { retailerCode: string; retailerName: string; pricePerKg: number; sourceUrl: string; fetchedAt: string };
export type PriceComparison = {
  fruitSlug: string; fruitName: string; emoji: string; sourceCount: number;
  averagePrice?: number | null; minPrice?: number | null; maxPrice?: number | null;
  refreshedAt?: string | null; prices: PriceQuote[]; message?: string | null;
};
export type ScanResult = {
  id: number; fruitId?: number | null; fruitName: string; qualityScore?: number | null;
  freshnessScore?: number | null; ripenessLabel?: string | null; sweetnessLabel?: string | null;
  useWithin?: string | null; qualityWarning?: string | null; suggestion?: string | null;
  confidence?: number | null; analysisMode: "PROVIDER"; imageUrl?: string | null;
  batchCode?: string | null; createdAt: string;
};
export type BatchTrace = {
  batch: { batchCode: string; productName: string; origin?: string | null; supplier?: string | null;
    certified: boolean; harvestDate?: string | null; intakeDate?: string | null; certificates?: string | null;
    storageTemperature?: string | null; storageHumidity?: string | null; publicNote?: string | null;
    fruitName?: string | null; emoji?: string | null };
  events: { stepOrder: number; title: string; eventDate?: string | null; location?: string | null; iconKey?: string | null; completed: boolean }[];
};
export type OrderDetail = {
  id: number; shopId: number; shopName: string; status: string; subtotal: number; shippingFee: number;
  total: number; paymentMethod: string; note?: string | null; deliveryName: string; deliveryPhone: string;
  deliveryAddress: string; createdAt: string; items: { productId: number; name: string; emoji: string; quantityKg: number; unitPrice: number; lineTotal: number }[];
};
export type OrderSummary = { id: number; shopId: number; shopName: string; status: string; total: number; paymentMethod: string; createdAt: string; itemCount: number };
export type Review = { id: number; shopId: number; shopName: string; userId: number; author: string; rating: number; comment: string; createdAt: string; purchased: boolean };
export type Article = {
  id: number; slug: string; title: string; category: string; emoji: string; gradient: string;
  description?: string | null; body: string; author: string; publishedAt?: string | null;
  readingTime: string; published: boolean; coverUrl?: string | null;
};

export type AdminUser = { id: number; name: string; email: string; role: "USER" | "SHOP_OWNER" | "ADMIN"; phone?: string | null; enabled: boolean; joined: string; orders: number; scans: number; reviews: number };
export type AdminShop = { id: number; name: string; address?: string | null; latitude: number; longitude: number; status: string; rating: number; reviewCount: number; owner?: string | null; products: number; orderValue: number };
export type BusinessApplication = {
  id: number; businessName: string; registrationNumber: string; contactName: string; email: string; phone: string;
  address: string; licenseOriginalName: string; licenseContentType: string; status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null; createdAt: string; reviewedAt?: string | null; shopId?: number | null; notificationSent?: boolean | null;
};
export type AdminProduct = { id: number; emoji: string; name: string; shop: string; price: number; stock: number; score?: number | null; status: string; category?: string | null };
export type AdminOrder = { id: number; customer: string; shop: string; total: number; subtotal: number; shippingFee: number; status: string; payment: string; note?: string | null; deliveryName?: string | null; deliveryPhone?: string | null; deliveryAddress?: string | null; createdAt: string; itemCount: number };
export type AdminReview = { id: number; user: string; shop: string; rating: number; comment: string; createdAt: string; purchased: boolean };
export type AdminScan = { id: number; fruit?: string | null; emoji?: string | null; freshness?: number | null; quality?: number | null; confidence?: number | null; user: string; mode: string; createdAt: string };
export type AdminNutrition = { id: number; slug: string; name: string; emoji: string; calories?: number | null; vitaminC?: number | null; fiber?: number | null; sugar?: number | null; potassium?: number | null; water?: number | null; benefits?: string | null };
export type AdminTrace = { batchCode: string; product: string; shop?: string | null; supplier?: string | null; area?: string | null; harvestDate?: string | null; intakeDate?: string | null; certificates?: string | null; certified: boolean };
export type AdminPriceSource = { id: number; retailer: string; fruit: string; productName: string; sourceUrl: string; enabled: boolean; lastAttemptAt?: string | null; lastSuccessAt?: string | null; lastError?: string | null };
export type AdminOverview = { users: number; shops: number; orders: number; orderValueToday: number; scansToday: number; confirmedPercent: number; topFruits: { name: string; scans: number }[]; topShops: { name: string; orders: number; orderValue: number }[]; pendingOrders: number; daily: { date: string; orderValue: number; scans: number }[] };
export type ShopProfile = { id: number; name: string; address?: string | null; latitude: number; longitude: number; status: string; description?: string | null; rating: number; reviewCount: number };
export type ShopProduct = { id: number; fruitId: number; fruitName: string; emoji: string; category?: string | null; displayName: string; pricePerKg: number; stockKg: number; aiScore?: number | null; status: string; batchCode?: string | null };
export type ShopOrder = { id: number; customer: string; total: number; subtotal: number; shippingFee: number; status: string; payment: string; deliveryName?: string | null; deliveryPhone?: string | null; deliveryAddress?: string | null; note?: string | null; createdAt: string; items: { name: string; emoji: string; quantityKg: number; unitPrice: number; lineTotal: number }[] };
export type ShopReview = { id: number; author: string; rating: number; comment: string; createdAt: string; purchased: boolean };
export type ShopTrace = { batchCode: string; product: string; origin?: string | null; supplier?: string | null; certified: boolean; harvestDate?: string | null; intakeDate?: string | null; certificates?: string | null; storageTemperature?: string | null; storageHumidity?: string | null; publicNote?: string | null };
export type ShopOverview = { products: number; soldOut: number; orders: number; pendingOrders: number; orderValueToday: number; rating: number; reviewCount: number; daily: { date: string; orderValue: number }[]; topProducts: { name: string; sold: number; orderValue: number }[] };
export type AppUpdate = { version: string; date: string; title: string; type: "Tính năng mới" | "Cải tiến" | "Sửa lỗi"; changes: string[] };

function token() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAuthUserId(): number | null {
  const accessToken = token();
  if (!accessToken || typeof window === "undefined") return null;
  try {
    const encodedPayload = accessToken.split(".")[1];
    if (!encodedPayload) return null;
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))) as { sub?: string };
    const userId = Number(payload.sub);
    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

export function userStorageKey(baseKey: string, userId: number | null = getAuthUserId()) {
  return `${baseKey}:user:${userId ?? "anonymous"}`;
}

export function saveAuth(auth: AuthResponse) {
  if (typeof window !== "undefined") {
    const previousUserId = getAuthUserId();
    window.localStorage.setItem(TOKEN_KEY, auth.accessToken);
    if (previousUserId !== auth.user.id) window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
  return auth;
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    const previousUserId = getAuthUserId();
    window.localStorage.removeItem(TOKEN_KEY);
    if (previousUserId !== null) window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function logout() {
  const pending = fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  }).catch(() => undefined);
  clearAuth();
  return pending;
}

export function hasAuth() {
  return Boolean(token());
}

export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          clearAuth();
          return false;
        }
        const auth = await response.json() as AuthResponse;
        saveAuth(auth);
        return true;
      } catch {
        clearAuth();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit = {}, canRefresh = true): Promise<T> {
  const isAuthOperation = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(path);
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const accessToken = token();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: "include" });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy ở localhost:8081.");
  }
  if (response.status === 401 && canRefresh && !isAuthOperation && await refreshAccessToken()) {
    return request<T>(path, init, false);
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as ApiErrorBody | T | null;
  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    if (response.status === 401 && !isAuthOperation && typeof window !== "undefined") clearAuth();
    throw new ApiError(response.status, errorBody?.message || `Yêu cầu thất bại (${response.status}).`);
  }
  return body as T;
}

async function requestBlob(path: string, canRefresh = true): Promise<Blob> {
  const headers = new Headers({ Accept: "application/pdf, image/png, image/jpeg" });
  const accessToken = token();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers, credentials: "include" });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ.");
  }
  if (response.status === 401 && canRefresh && await refreshAccessToken()) return requestBlob(path, false);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorBody | null;
    if (response.status === 401) clearAuth();
    throw new ApiError(response.status, body?.message || `Yêu cầu thất bại (${response.status}).`);
  }
  return response.blob();
}

const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => value !== undefined && params.set(key, String(value)));
  return params.toString();
};

export const api = {
  login: async (identifier: string, password: string) => saveAuth(await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) })),
  register: async (payload: { email: string; fullName: string; password: string; phone?: string }) => saveAuth(await request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) })),
  me: () => request<UserProfile>("/auth/me"),
  fruits: (q?: string) => request<Fruit[]>(`/fruits${q ? `?${query({ q })}` : ""}`),
  fruit: (slug: string) => request<FruitNutrition>(`/fruits/${encodeURIComponent(slug)}`),
  shops: (lat?: number, lng?: number, radiusKm?: number) => request<Shop[]>(`/shops?${query({ lat, lng, radiusKm })}`),
  products: (filters: { q?: string; fruitSlug?: string; lat?: number; lng?: number; radiusKm?: number } = {}) => request<Product[]>(`/products?${query(filters)}`),
  prices: (fruitSlug: string) => request<PriceComparison>(`/market/prices?${query({ fruitSlug })}`),
  scan: async (file: File, shopId?: number) => {
    const form = new FormData();
    form.set("file", file);
    return request<ScanResult>(`/scans${shopId ? `?${query({ shopId })}` : ""}`, { method: "POST", body: form });
  },
  scans: () => request<ScanResult[]>("/scans/mine"),
  scanById: (id: number) => request<ScanResult>(`/scans/${id}`),
  trace: (batchCode: string) => request<BatchTrace>(`/trace/${encodeURIComponent(batchCode)}`),
  createOrder: (payload: { items: { productId: number; quantityKg: number }[]; paymentMethod: string; deliveryName: string; deliveryPhone: string; deliveryAddress: string; note?: string }) => request<OrderDetail>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  orders: () => request<OrderSummary[]>("/orders/mine"),
  createReview: (payload: { shopId: number; orderId?: number; scanId?: number; rating: number; comment: string }) => request<Review>("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  reviews: (shopId: number) => request<Review[]>(`/shops/${shopId}/reviews`),
  articles: (filters: { q?: string; category?: string } = {}) => request<Article[]>(`/articles?${query(filters)}`),
  article: (slug: string) => request<Article>(`/articles/${encodeURIComponent(slug)}`),
  adminOverview: () => request<AdminOverview>("/admin/overview"),
  adminUsers: () => request<AdminUser[]>("/admin/users"),
  adminShops: () => request<AdminShop[]>("/admin/shops"),
  adminBusinessApplications: () => request<BusinessApplication[]>("/admin/business-applications"),
  adminBusinessLicense: (id: number) => requestBlob(`/admin/business-applications/${id}/license`),
  decideBusinessApplication: (id: number, approved: boolean, reason?: string) => request<BusinessApplication>(`/admin/business-applications/${id}/decision`, { method: "POST", body: JSON.stringify({ approved, reason }) }),
  adminProducts: () => request<AdminProduct[]>("/admin/products"),
  adminOrders: () => request<AdminOrder[]>("/admin/orders"),
  adminReviews: () => request<AdminReview[]>("/admin/reviews"),
  adminScans: () => request<AdminScan[]>("/admin/scans"),
  adminNutrition: () => request<AdminNutrition[]>("/admin/nutrition"),
  adminTraceability: () => request<AdminTrace[]>("/admin/traceability"),
  adminPriceSources: () => request<AdminPriceSource[]>("/admin/prices/sources"),
  refreshPrices: () => request<{ sources: number; updated: number; failed: number; completedAt: string }>("/admin/prices/refresh", { method: "POST" }),
  shopProfile: () => request<ShopProfile>("/shop/profile"),
  shopProducts: () => request<ShopProduct[]>("/shop/products"),
  shopOrders: () => request<ShopOrder[]>("/shop/orders"),
  shopReviews: () => request<ShopReview[]>("/shop/reviews"),
  shopTraceability: () => request<ShopTrace[]>("/shop/traceability"),
  shopOverview: () => request<ShopOverview>("/shop/overview"),
  submitBusinessApplication: (payload: { businessName: string; registrationNumber: string; contactName: string; email: string; phone: string; address: string; password: string; licenseFile: File }) => {
    const form = new FormData();
    form.set("businessName", payload.businessName);
    form.set("registrationNumber", payload.registrationNumber);
    form.set("contactName", payload.contactName);
    form.set("email", payload.email);
    form.set("phone", payload.phone);
    form.set("address", payload.address);
    form.set("password", payload.password);
    form.set("licenseFile", payload.licenseFile);
    return request<{ id: number; status: string; createdAt: string }>("/business/applications", { method: "POST", body: form });
  },
  updates: () => request<AppUpdate[]>("/updates"),
};

export function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("Trình duyệt không hỗ trợ lấy vị trí."));
  }
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
    (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
    () => reject(new Error("Chưa lấy được vị trí. Hãy cho phép truy cập vị trí rồi thử lại.")),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
  ));
}
