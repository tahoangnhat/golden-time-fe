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
  id: number; shopId: number; shopName: string; shopAddress?: string | null; fruitId: number | null; fruitSlug: string | null;
  fruitName: string; emoji: string; category?: string | null; displayName: string;
  pricePerKg: number; stockKg: number; aiScore?: number | null; batchCode?: string | null;
  distanceKm?: number | null; imageUrl?: string | null; imageUrls?: string[]; seasonal: boolean; prepared: boolean;
};
export type Shop = {
  id: number; name: string; address?: string | null; latitude: number; longitude: number;
  rating: number; reviewCount: number; description?: string | null; popularFruit?: string | null;
  productCount: number; distanceKm?: number | null;
};
export type PaymentMethods = { codEnabled: boolean; payosEnabled: boolean };
export type GhnAddress = { id: number; name: string };
export type GhnShippingQuote = { shippingFee: number; expectedDeliveryAt?: string | null };
export type NearbyChainShop = { id: string; name: string; address?: string | null; latitude: number; longitude: number };
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
    fruitName?: string | null; emoji?: string | null; quantityKg?: number | null; packagingDate?: string | null;
    qualityCheckedAt?: string | null; qualityResult?: string | null; qualityScore?: number | null; qualityNote?: string | null;
    transportDate?: string | null; transportInfo?: string | null; batchStatus?: string | null;
    farm?: { id: number; name: string; address?: string | null; managerName?: string | null; fruitTypes?: string | null; certifications?: string | null; certificationImageUrl?: string | null; imageUrl?: string | null; imageUrls?: string[] } | null;
    business?: { id: number; name: string; address?: string | null; logoUrl?: string | null } | null };
  events: { stepOrder: number; title: string; eventDate?: string | null; location?: string | null; iconKey?: string | null; completed: boolean }[];
};
export type OrderDetail = {
  id: number; shopId: number; shopName: string; status: string; paymentStatus: string; subtotal: number; shippingFee: number;
  total: number; paymentMethod: string; checkoutUrl?: string | null; qrCode?: string | null; paymentExpiresAt?: string | null;
  note?: string | null; deliveryName: string; deliveryPhone: string;
  deliveryAddress: string; createdAt: string; trackingCode?: string | null; carrierStatus?: string | null;
  carrierFee: number; expectedDeliveryAt?: string | null;
  items: { productId: number; name: string; emoji: string; quantityKg: number; unitPrice: number; lineTotal: number }[];
};
export type OrderSummary = { id: number; shopId: number; shopName: string; status: string; total: number; paymentMethod: string; paymentStatus: string; createdAt: string; itemCount: number; trackingCode?: string | null; carrierStatus?: string | null; expectedDeliveryAt?: string | null };
export type Review = { id: number; shopId: number; shopName: string; userId: number; author: string; rating: number; comment: string; createdAt: string; purchased: boolean };
export type ProductReviewItem = { id: number; productId: number; userId: number; authorName: string; rating: number; comment?: string | null; createdAt: string; orderId?: number | null };
export type ProductRatingDistribution = { star: number; count: number };
export type ProductReviewSummary = { ratingAvg: number; reviewCount: number; distribution: ProductRatingDistribution[]; reviews: ProductReviewItem[] };
export type ProductReviewEligibility = { eligible: boolean; alreadyReviewed: boolean; eligibleOrderId?: number | null };
export type ProductReviewResponse = { id: number; productId: number; userId: number; authorName: string; rating: number; comment?: string | null; createdAt: string; orderId?: number | null };
export type Article = {
  id: number; slug: string; title: string; category: string; emoji: string; gradient: string;
  description?: string | null; body: string; author: string; publishedAt?: string | null;
  readingTime: string; published: boolean; coverUrl?: string | null; coverAlt?: string | null;
  featured?: boolean; seoTitle?: string | null; seoDescription?: string | null;
};
export type AdminArticle = Article & { createdAt: string; updatedAt: string };
export type ArticleWritePayload = Omit<Article, "id" | "readingTime"> & { publishedAt?: string | null };

export type AdminUser = { id: number; name: string; email: string; role: "USER" | "SHOP_OWNER" | "ADMIN"; phone?: string | null; enabled: boolean; joined: string; orders: number; scans: number; reviews: number };
export type AdminShop = { id: number; name: string; address?: string | null; latitude: number; longitude: number; status: string; rating: number; reviewCount: number; owner?: string | null; products: number; orderValue: number };
export type BusinessApplication = {
  id: number; businessName: string; registrationNumber?: string | null; taxCode?: string | null; contactName: string;
  representativePhone?: string | null; email: string; phone: string; address: string;
  licenseOriginalName?: string | null; licenseContentType?: string | null; logoUrl?: string | null; status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null; createdAt: string; reviewedAt?: string | null; shopId?: number | null; notificationSent?: boolean | null;
  latitude?: number | null; longitude?: number | null;
};
export type AdminProduct = { id: number; emoji: string; name: string; shop: string; price: number; stock: number; score?: number | null; status: string; category?: string | null; approvalStatus: string; productOrigin?: string | null; supplierName?: string | null; lotCode?: string | null; traceabilityProof?: string | null; reviewNote?: string | null };
export type AdminOrder = { id: number; customer: string; shop: string; total: number; subtotal: number; shippingFee: number; status: string; payment: string; paymentStatus: string; note?: string | null; deliveryName?: string | null; deliveryPhone?: string | null; deliveryAddress?: string | null; createdAt: string; itemCount: number };
export type AdminReview = { id: number; user: string; shop: string; rating: number; createdAt: string; purchased: boolean };
export type AdminProductReview = { id: number; productId: number; productName: string; shopName: string; author: string; rating: number; createdAt: string };
export type AdminScan = { id: number; fruit?: string | null; emoji?: string | null; freshness?: number | null; quality?: number | null; confidence?: number | null; user: string; mode: string; createdAt: string };
export type AdminNutrition = { id: number; slug: string; name: string; emoji: string; category?: string | null; calories?: number | null; vitaminC?: number | null; fiber?: number | null; sugar?: number | null; potassium?: number | null; water?: number | null; benefits?: string | null };
export type AdminTrace = { batchCode: string; product: string; shop?: string | null; supplier?: string | null; area?: string | null; harvestDate?: string | null; intakeDate?: string | null; certificates?: string | null; certified: boolean; farm?: string | null; quantityKg?: number | null; packagingDate?: string | null; qualityCheckedAt?: string | null; qualityResult?: string | null; qualityScore?: number | null; qualityNote?: string | null; transportDate?: string | null; transportInfo?: string | null; batchStatus?: string | null };
export type AdminPriceSource = { id: number; retailer: string; fruit: string; productName: string; sourceUrl: string; enabled: boolean; lastAttemptAt?: string | null; lastSuccessAt?: string | null; lastError?: string | null };
export type AdminOverview = { users: number; shops: number; orders: number; orderValueToday: number; scansToday: number; confirmedPercent: number; topFruits: { name: string; scans: number }[]; topShops: { name: string; orders: number; orderValue: number }[]; pendingOrders: number; daily: { date: string; orderValue: number; scans: number }[] };
export type ShopProfile = { id: number; name: string; address?: string | null; latitude: number; longitude: number; status: string; description?: string | null; rating: number; reviewCount: number; businessEmail?: string | null; businessPhone?: string | null; taxCode?: string | null; representativeName?: string | null; representativePhone?: string | null; logoUrl?: string | null; pickupProvinceName?: string | null; pickupWardName?: string | null };
export type WalletSummary = { shopId: number; shopName: string; commissionTier: "NEW_SHOP" | "STANDARD" | "LARGE_PARTNER" | "CUSTOM"; commissionRate: number; approvedAt?: string | null; balance: number; reservedAmount: number; availableBalance: number; grossSales: number; commissions: number; payouts: number };
export type WalletTransaction = { id: number; orderId?: number | null; entryType: "ORDER_SALE" | "COMMISSION_FEE" | "PAYOUT"; amount: number; grossAmount?: number | null; commissionRate?: number | null; commissionAmount?: number | null; externalReference?: string | null; description?: string | null; createdAt: string };
export type ShopWithdrawalRequest = { id: number; shopId: number; shopName: string; amount: number; status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED"; bankCode: string; bankName: string; accountName: string; maskedAccountNumber: string; requestedAt: string; reviewedAt?: string | null; reviewNote?: string | null; paidAt?: string | null; transferReference?: string | null; transferNote?: string | null };
export type AdminWithdrawalRequest = Omit<ShopWithdrawalRequest, "maskedAccountNumber"> & { accountNumber: string };
export type ShopProduct = { id: number; fruitId: number | null; fruitName: string; emoji: string; category?: string | null; seasonal: boolean; prepared: boolean; displayName: string; pricePerKg: number; stockKg: number; aiScore?: number | null; status: string; batchCode?: string | null; imageUrl?: string | null; productOrigin?: string | null; supplierName?: string | null; lotCode?: string | null; traceabilityProof?: string | null; approvalStatus: string; reviewNote?: string | null; imageUrls?: string[] };
export type ShopOrder = { id: number; customer: string; total: number; subtotal: number; shippingFee: number; status: string; payment: string; paymentStatus: string; deliveryName?: string | null; deliveryPhone?: string | null; deliveryAddress?: string | null; note?: string | null; createdAt: string; trackingCode?: string | null; carrierStatus?: string | null; carrierFee: number; expectedDeliveryAt?: string | null; items: { name: string; emoji: string; quantityKg: number; unitPrice: number; lineTotal: number }[] };
export type ShopReview = { id: number; author: string; rating: number; comment: string; createdAt: string; purchased: boolean };
export type ShopProductReview = { id: number; productId: number; productName: string; author: string; rating: number; comment?: string | null; createdAt: string };
export type ShopTrace = { batchCode: string; product: string; origin?: string | null; supplier?: string | null; certified: boolean; harvestDate?: string | null; intakeDate?: string | null; certificates?: string | null; storageTemperature?: string | null; storageHumidity?: string | null; publicNote?: string | null };
export type Farm = { id: number; shopId: number; name: string; address: string; managerName: string; phone: string; fruitTypes: string; areaHectares?: number | null; certifications?: string | null; certificationImageUrl?: string | null; imageUrl?: string | null; imageUrls?: string[]; status: "PENDING" | "APPROVED" | "REJECTED"; rejectionReason?: string | null; createdAt: string; updatedAt: string; reviewedAt?: string | null; shopName?: string | null };
export type ShopBatch = { batchCode: string; product: string; productId?: number | null; shopId?: number | null; farmId?: number | null; quantityKg?: number | null; harvestDate?: string | null; packagingDate?: string | null; qualityCheckedAt?: string | null; qualityResult?: string | null; qualityScore?: number | null; qualityNote?: string | null; transportDate?: string | null; transportInfo?: string | null; batchStatus: string; createdAt: string; farmName?: string | null; farmStatus?: string | null; shopName?: string | null; origin?: string | null; reviewStatus: "PENDING_REVIEW" | "VERIFIED" | "NEEDS_CORRECTION"; reviewVersion: number; reviewNote?: string | null; reviewedAt?: string | null; evidenceUrls: string[] };
export type BatchWritePayload = { productId: number; farmId: number; quantityKg: number; harvestDate?: string; packagingDate?: string; qualityCheckedAt?: string; qualityResult?: string; qualityScore?: number; qualityNote?: string; transportDate?: string; transportInfo?: string; evidenceUrls: string[] };
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
  if (response.status === 401 && canRefresh && !isAuthOperation) {
    if (await refreshAccessToken()) return request<T>(path, init, false);
    if (typeof window !== "undefined") clearAuth();
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as ApiErrorBody | T | null;
  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
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
  if (response.status === 401 && canRefresh) {
    if (await refreshAccessToken()) return requestBlob(path, false);
    clearAuth();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorBody | null;
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
  register: async (payload: { email: string; fullName: string; password: string; phone: string }) => saveAuth(await request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) })),
  me: () => request<UserProfile>("/auth/me"),
  updateMe: (payload: { fullName: string; phone?: string | null }) => request<UserProfile>("/auth/me", { method: "PUT", body: JSON.stringify(payload) }),
  fruits: (q?: string) => request<Fruit[]>(`/fruits${q ? `?${query({ q })}` : ""}`),
  fruit: (slug: string) => request<FruitNutrition>(`/fruits/${encodeURIComponent(slug)}`),
  shops: (lat?: number, lng?: number, radiusKm?: number) => request<Shop[]>(`/shops?${query({ lat, lng, radiusKm })}`),
  products: (filters: { q?: string; fruitSlug?: string; lat?: number; lng?: number; radiusKm?: number } = {}) => request<Product[]>(`/products?${query(filters)}`),
  product: (id: number) => request<Product>(`/products/${id}`),
  prices: (fruitSlug: string) => request<PriceComparison>(`/market/prices?${query({ fruitSlug })}`),
  scan: async (file: File, shopId?: number) => {
    const form = new FormData();
    form.set("file", file);
    return request<ScanResult>(`/scans${shopId ? `?${query({ shopId })}` : ""}`, { method: "POST", body: form });
  },
  scans: () => request<ScanResult[]>("/scans/mine"),
  scanById: (id: number) => request<ScanResult>(`/scans/${id}`),
  trace: (batchCode: string) => request<BatchTrace>(`/trace/${encodeURIComponent(batchCode)}`),
  createOrder: (payload: { items: { productId: number; quantityKg: number }[]; paymentMethod: string; deliveryName: string; deliveryPhone: string; deliveryAddress: string; deliveryProvinceName: string; deliveryWardName: string; note?: string }) => request<OrderDetail>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  ghnProvinces: () => request<GhnAddress[]>("/shipping/ghn/provinces"),
  ghnWards: (provinceId: number) => request<GhnAddress[]>(`/shipping/ghn/wards?provinceId=${provinceId}`),
  ghnQuote: (payload: { items: { productId: number; quantityKg: number }[]; paymentMethod: string; deliveryName: string; deliveryPhone: string; deliveryAddress: string; deliveryProvinceName: string; deliveryWardName: string }) => request<GhnShippingQuote>("/shipping/ghn/quote", { method: "POST", body: JSON.stringify(payload) }),
  order: (id: number) => request<OrderDetail>(`/orders/${id}`),
  confirmOrderReceived: (id: number) => request<{ walletCredited: boolean }>(`/orders/${id}/confirm-received`, { method: "POST" }),
  cancelPayment: (id: number) => request<void>(`/orders/${id}/cancel-payment`, { method: "POST" }),
  orders: () => request<OrderSummary[]>("/orders/mine"),
  createReview: (payload: { shopId: number; orderId?: number; scanId?: number; rating: number; comment: string }) => request<Review>("/reviews", { method: "POST", body: JSON.stringify(payload) }),
  reviews: (shopId: number) => request<Review[]>(`/shops/${shopId}/reviews`),
  productReviews: (productId: number) => request<ProductReviewSummary>(`/products/${productId}/reviews`),
  productReviewEligibility: (productId: number) => request<ProductReviewEligibility>(`/products/${productId}/review-eligibility`),
  createProductReview: (productId: number, payload: { rating: number; comment?: string | null }) => request<ProductReviewResponse>(`/products/${productId}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
  paymentMethods: () => request<PaymentMethods>("/payment-methods"),
  articles: (filters: { q?: string; category?: string } = {}) => request<Article[]>(`/articles?${query(filters)}`),
  article: (slug: string) => request<Article>(`/articles/${encodeURIComponent(slug)}`),
  adminArticles: (filters: { q?: string; status?: string } = {}) => request<AdminArticle[]>(`/admin/articles?${query(filters)}`),
  createArticle: (payload: ArticleWritePayload) => request<AdminArticle>("/admin/articles", { method: "POST", body: JSON.stringify(payload) }),
  updateArticle: (id: number, payload: ArticleWritePayload) => request<AdminArticle>(`/admin/articles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteArticle: (id: number) => request<void>(`/admin/articles/${id}`, { method: "DELETE" }),
  uploadArticleImage: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/admin/articles/images", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  uploadShopProductImage: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/shop/products/images", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  uploadBusinessLogo: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/shop/profile/logo", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  uploadFarmImage: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/shop/farms/images", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  uploadFarmCertification: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/shop/farms/certifications", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  uploadBatchEvidence: async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const image = await request<{ url: string; contentType: string }>("/shop/batches/evidence", { method: "POST", body: form });
    return { ...image, url: image.url.startsWith("http") ? image.url : `${API_ORIGIN}${image.url}` };
  },
  adminOverview: () => request<AdminOverview>("/admin/overview"),
  adminUsers: () => request<AdminUser[]>("/admin/users"),
  adminShops: () => request<AdminShop[]>("/admin/shops"),
  adminBusinessApplications: () => request<BusinessApplication[]>("/admin/business-applications"),
  adminBusinessLicense: (id: number) => requestBlob(`/admin/business-applications/${id}/license`),
  decideBusinessApplication: (id: number, approved: boolean, reason?: string, location?: { latitude: number; longitude: number; address?: string }) => request<BusinessApplication>(`/admin/business-applications/${id}/decision`, { method: "POST", body: JSON.stringify({ approved, reason, ...location }) }),
  resendBusinessApplicationNotification: (id: number) => request<BusinessApplication>(`/admin/business-applications/${id}/notification`, { method: "POST" }),
  adminProducts: () => request<AdminProduct[]>("/admin/products"),
  decideAdminProduct: (id: number, approved: boolean, note?: string) => request<{ id: number; approvalStatus: string; status: string; reviewNote?: string | null }>(`/admin/products/${id}/decision`, { method: "POST", body: JSON.stringify({ approved, note }) }),
  adminOrders: () => request<AdminOrder[]>("/admin/orders"),
  adminReviews: () => request<AdminReview[]>("/admin/reviews"),
  adminProductReviews: () => request<AdminProductReview[]>("/admin/product-reviews"),
  adminScans: () => request<AdminScan[]>("/admin/scans"),
  adminNutrition: () => request<AdminNutrition[]>("/admin/nutrition"),
  adminTraceability: () => request<ShopBatch[]>("/admin/traceability/review-queue"),
  decideBatch: (batchCode: string, approved: boolean, note?: string) => request<ShopBatch>(`/admin/traceability/${encodeURIComponent(batchCode)}/decision`, { method: "POST", body: JSON.stringify({ approved, note }) }),
  adminUpdateBatchStatus: (batchCode: string, batchStatus: string, note?: string) => request<ShopBatch>(`/admin/traceability/${encodeURIComponent(batchCode)}/status`, { method: "PUT", body: JSON.stringify({ batchStatus, note }) }),
  adminFarms: () => request<Farm[]>("/admin/farms"),
  decideFarm: (id: number, approved: boolean, reason?: string) => request<Farm>(`/admin/farms/${id}/decision`, { method: "POST", body: JSON.stringify({ approved, reason }) }),
  adminPriceSources: () => request<AdminPriceSource[]>("/admin/prices/sources"),
  refreshPrices: () => request<{ sources: number; updated: number; failed: number; completedAt: string }>("/admin/prices/refresh", { method: "POST" }),
  shopProfile: () => request<ShopProfile>("/shop/profile"),
  updateShopProfile: (payload: { name?: string; address: string; latitude: number; longitude: number; businessEmail?: string; businessPhone?: string; taxCode?: string; representativeName?: string; representativePhone?: string; logoUrl?: string; pickupProvinceName?: string; pickupWardName?: string }) => request<ShopProfile>("/shop/profile", { method: "PUT", body: JSON.stringify(payload) }),
  shopWallet: () => request<WalletSummary>("/shop/wallet"),
  shopWalletTransactions: () => request<WalletTransaction[]>("/shop/wallet/transactions"),
  shopWithdrawalRequests: () => request<ShopWithdrawalRequest[]>("/shop/wallet/withdrawal-requests"),
  createShopWithdrawalRequest: (payload: { amount: number; bankCode: string; bankName: string; accountNumber: string; accountName: string }) => request<ShopWithdrawalRequest>("/shop/wallet/withdrawal-requests", { method: "POST", body: JSON.stringify(payload) }),
  cancelShopWithdrawalRequest: (id: number) => request<ShopWithdrawalRequest>(`/shop/wallet/withdrawal-requests/${id}/cancel`, { method: "POST" }),
  adminWallets: () => request<WalletSummary[]>("/admin/wallets"),
  adminWalletTransactions: (shopId: number) => request<WalletTransaction[]>(`/admin/wallets/${shopId}/transactions`),
  adminWithdrawalRequests: (status?: AdminWithdrawalRequest["status"]) => request<AdminWithdrawalRequest[]>(`/admin/wallet-withdrawal-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  approveWithdrawalRequest: (id: number) => request<AdminWithdrawalRequest>(`/admin/wallet-withdrawal-requests/${id}/approve`, { method: "POST" }),
  rejectWithdrawalRequest: (id: number, reason: string) => request<AdminWithdrawalRequest>(`/admin/wallet-withdrawal-requests/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  markWithdrawalRequestPaid: (id: number, payload: { reference: string; note?: string }) => request<AdminWithdrawalRequest>(`/admin/wallet-withdrawal-requests/${id}/mark-paid`, { method: "POST", body: JSON.stringify(payload) }),
  updateShopCommission: (shopId: number, payload: { tier: WalletSummary["commissionTier"]; customRate?: number | null }) => request<void>(`/admin/wallets/${shopId}/commission`, { method: "PUT", body: JSON.stringify(payload) }),
  collectCod: (orderId: number, reference?: string) => request<void>(`/admin/wallets/orders/${orderId}/collect-cod`, { method: "POST", body: JSON.stringify({ reference }) }),
  mapAddressSearch: (query: string) => request<{ place_id: number; display_name: string; lat: string; lon: string }[]>(`/map/geocoding/search?q=${encodeURIComponent(query)}`),
  mapAddressReverse: (point: { lat: number; lng: number }) => request<{ display_name?: string | null }>(`/map/geocoding/reverse?lat=${point.lat}&lon=${point.lng}`),
  nearbyChainShops: (point: { lat: number; lng: number }) => request<NearbyChainShop[]>(`/map/nearby-chain-stores?lat=${point.lat}&lon=${point.lng}`),
  shopProducts: () => request<ShopProduct[]>("/shop/products"),
  createShopProduct: (payload: { fruitId: number | null; category: string; displayName: string; pricePerKg: number; stockKg: number; onSale: boolean; productOrigin: string; supplierName: string; lotCode: string; traceabilityProof: string; imageUrl?: string; imageUrls: string[] }) => request<ShopProduct>("/shop/products", { method: "POST", body: JSON.stringify(payload) }),
  updateShopProduct: (id: number, payload: { fruitId: number | null; category: string; displayName: string; pricePerKg: number; stockKg: number; onSale: boolean; productOrigin: string; supplierName: string; lotCode: string; traceabilityProof: string; imageUrl?: string; imageUrls: string[] }) => request<ShopProduct>(`/shop/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateShopProductVisibility: (id: number, onSale: boolean) => request<ShopProduct>(`/shop/products/${id}/visibility`, { method: "PUT", body: JSON.stringify({ onSale }) }),
  shopOrders: () => request<ShopOrder[]>("/shop/orders"),
  shipShopOrder: (id: number) => request<void>(`/shop/orders/${id}/ship`, { method: "POST" }),
  shopReviews: () => request<ShopReview[]>("/shop/reviews"),
  shopProductReviews: () => request<ShopProductReview[]>("/shop/product-reviews"),
  shopTraceability: () => request<ShopTrace[]>("/shop/traceability"),
  shopFarms: () => request<Farm[]>("/shop/farms"),
  createFarm: (payload: Omit<Farm, "id" | "shopId" | "status" | "rejectionReason" | "createdAt" | "updatedAt" | "reviewedAt" | "shopName">) => request<Farm>("/shop/farms", { method: "POST", body: JSON.stringify(payload) }),
  updateFarm: (id: number, payload: Omit<Farm, "id" | "shopId" | "status" | "rejectionReason" | "createdAt" | "updatedAt" | "reviewedAt" | "shopName">) => request<Farm>(`/shop/farms/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteFarm: (id: number) => request<void>(`/shop/farms/${id}`, { method: "DELETE" }),
  shopBatches: () => request<ShopBatch[]>("/shop/batches"),
  createBatch: (payload: BatchWritePayload) => request<ShopBatch>("/shop/batches", { method: "POST", body: JSON.stringify(payload) }),
  updateBatch: (batchCode: string, payload: BatchWritePayload) => request<ShopBatch>(`/shop/batches/${encodeURIComponent(batchCode)}`, { method: "PUT", body: JSON.stringify(payload) }),
  shopOverview: () => request<ShopOverview>("/shop/overview"),
  submitBusinessApplication: (payload: { businessName: string; taxCode?: string; contactName: string; representativePhone: string; email: string; phone: string; address: string; password: string; licenseFile?: File; logoFile: File; latitude: number; longitude: number }) => {
    const form = new FormData();
    form.set("businessName", payload.businessName);
    if (payload.taxCode) form.set("taxCode", payload.taxCode);
    form.set("contactName", payload.contactName);
    form.set("representativePhone", payload.representativePhone);
    form.set("email", payload.email);
    form.set("phone", payload.phone);
    form.set("address", payload.address);
    form.set("latitude", String(payload.latitude));
    form.set("longitude", String(payload.longitude));
    form.set("password", payload.password);
    if (payload.licenseFile) form.set("licenseFile", payload.licenseFile);
    if (payload.logoFile) form.set("logoFile", payload.logoFile);
    return request<{ id: number; status: string; createdAt: string }>("/business/applications", { method: "POST", body: form });
  },
  updates: () => request<AppUpdate[]>("/updates"),
};

export function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+07:00`) : new Date(value);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
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
