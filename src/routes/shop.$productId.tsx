import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Send,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { ProductThumb } from "@/components/FruitThumb";
import {
  api,
  formatDate,
  hasAuth,
  type Product,
  type ProductReviewEligibility,
  type ProductReviewSummary,
} from "@/lib/api";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/shop/$productId")({
  head: () => ({ meta: [{ title: "Chi tiết sản phẩm — Golden Time" }] }),
  component: ProductDetail,
});

const categoryLabels: Record<string, string> = {
  LOCAL: "Trái cây Việt Nam",
  IMPORTED: "Trái cây nhập khẩu",
  SEASONAL: "Trái cây theo mùa",
  PREPARED: "Trái cây sơ chế",
};

function ProductDetail() {
  const { productId: rawProductId } = Route.useParams();
  const productId = Number(rawProductId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [portionKg, setPortionKg] = useState(0.5);
  const cart = useCart();

  // Product reviews state
  const [reviewsSummary, setReviewsSummary] = useState<ProductReviewSummary | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  // Review eligibility state
  const [eligibility, setEligibility] = useState<ProductReviewEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");

  // Review creation form state
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Active product tracker to prevent race conditions on rapid product switching
  const currentProductIdRef = useRef(productId);

  // Load product details
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProduct(null);
    setImageIndex(0);
    api.product(productId)
      .then((result) => { if (active) setProduct(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  // Load product reviews function
  const loadProductReviews = useCallback(async (targetId = productId): Promise<boolean> => {
    if (!Number.isFinite(targetId) || targetId <= 0) return false;
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const summary = await api.productReviews(targetId);
      if (currentProductIdRef.current !== targetId) return false;
      setReviewsSummary(summary);
      return true;
    } catch (cause) {
      if (currentProductIdRef.current !== targetId) return false;
      setReviewsError(cause instanceof Error ? cause.message : "Không tải được đánh giá sản phẩm.");
      return false;
    } finally {
      if (currentProductIdRef.current === targetId) {
        setReviewsLoading(false);
      }
    }
  }, [productId]);

  // Load review eligibility function
  const loadEligibility = useCallback(async (targetId = productId): Promise<boolean> => {
    if (!Number.isFinite(targetId) || targetId <= 0 || !hasAuth()) {
      if (currentProductIdRef.current === targetId) {
        setEligibility(null);
        setEligibilityLoading(false);
        setEligibilityError("");
      }
      return true;
    }
    setEligibilityLoading(true);
    setEligibilityError("");
    try {
      const result = await api.productReviewEligibility(targetId);
      if (currentProductIdRef.current !== targetId) return false;
      setEligibility(result);
      return true;
    } catch (cause) {
      if (currentProductIdRef.current !== targetId) return false;
      setEligibilityError(cause instanceof Error ? cause.message : "Không kiểm tra được quyền đánh giá.");
      return false;
    } finally {
      if (currentProductIdRef.current === targetId) {
        setEligibilityLoading(false);
      }
    }
  }, [productId]);

  // Load reviews and eligibility when product ID changes
  useEffect(() => {
    currentProductIdRef.current = productId;
    setReviewsSummary(null);
    setEligibility(null);
    setFormRating(5);
    setFormComment("");
    setSubmitError("");
    void loadProductReviews(productId);
    void loadEligibility(productId);
    return () => {
      currentProductIdRef.current = 0;
    };
  }, [productId, loadProductReviews, loadEligibility]);

  // Submit product review handler
  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (formRating < 1 || formRating > 5) {
      setSubmitError("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }
    if (formComment.length > 2000) {
      setSubmitError("Nội dung đánh giá không được vượt quá 2000 ký tự.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.createProductReview(productId, {
        rating: formRating,
        comment: formComment.trim() ? formComment.trim() : null,
      });
      setFormComment("");
      setFormRating(5);

      // Refresh reviews and eligibility
      const [reviewsRefreshed, eligibilityRefreshed] = await Promise.all([
        loadProductReviews(productId),
        loadEligibility(productId),
      ]);

      if (reviewsRefreshed && eligibilityRefreshed) {
        toast.success("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
      } else {
        toast.success("Đánh giá đã được gửi thành công!");
        toast.info("Chưa thể cập nhật danh sách hiển thị ngay. Bạn có thể nhấn 'Thử lại' bên dưới hoặc tải lại trang.");
      }
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Không gửi được đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function addToCart() {
    if (!product) return;
    if (Number(product.stockKg) <= 0) return toast.error("Sản phẩm hiện đã hết hàng.");
    if (!cart.add(product, portionKg)) return toast.error("Giỏ hàng chỉ nhận sản phẩm từ một cửa hàng. Hãy xóa giỏ hàng trước khi đổi cửa hàng.");
    toast.success(`Đã thêm ${portionKg} kg (${Math.round(portionKg / 0.5)} phần) ${product.displayName} vào giỏ.`);
  }

  const images = product?.imageUrls?.length
    ? product.imageUrls
    : product?.imageUrl ? [product.imageUrl] : [];

  const ratingAvg = reviewsSummary?.ratingAvg ?? 0;
  const reviewCount = reviewsSummary?.reviewCount ?? 0;
  const distribution = reviewsSummary?.distribution ?? [
    { star: 5, count: 0 },
    { star: 4, count: 0 },
    { star: 3, count: 0 },
    { star: 2, count: 0 },
    { star: 1, count: 0 },
  ];
  const reviews = reviewsSummary?.reviews ?? [];

  return (
    <PhoneShell>
      <StatusBar title="Chi tiết sản phẩm" right={<Link to="/cart" aria-label="Giỏ hàng" className="relative"><ShoppingCart className="h-4 w-4" />{cart.items.length > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-white">{cart.items.length}</span>}</Link>} />
      <div className="px-5 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <Link to="/shop" aria-label="Quay lại cửa hàng" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white"><ChevronLeft className="h-5 w-5" /></Link>
          <span className="text-[11px] text-muted-foreground">Mua hàng <span className="mx-1">/</span> Chi tiết</span>
          <Link to="/cart" aria-label="Mở giỏ hàng" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white"><ShoppingCart className="h-4 w-4" /></Link>
        </div>

        {loading ? (
          <div className="grid min-h-72 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div>
        ) : error || !product ? (
          <div className="mt-5 rounded-2xl border border-border bg-white p-5 text-center">
            <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy sản phẩm."}</p>
            <Link to="/shop" className="mt-4 inline-flex rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white">Quay lại cửa hàng</Link>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white p-2 gt-shadow-soft">
              <ProductThumb emoji={product.emoji} imageUrl={images[imageIndex] ?? product.imageUrl} alt={product.displayName} size="xl" className="!h-72 !w-full !rounded-[1.3rem] !text-8xl" />
              {product.aiScore != null && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold shadow-sm">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />AI {product.aiScore}/100
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button type="button" aria-label="Ảnh trước" onClick={() => setImageIndex((index) => (index + images.length - 1) % images.length)} className="absolute left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setImageIndex((index) => (index + 1) % images.length)} className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronRight className="h-5 w-5" /></button>
                  <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white">{imageIndex + 1}/{images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.map((url, index) => (
                  <button key={`${url}-${index}`} type="button" onClick={() => setImageIndex(index)} aria-label={`Xem ảnh ${index + 1}`} className={`shrink-0 rounded-xl border-2 ${index === imageIndex ? "border-primary" : "border-transparent"}`}>
                    <img src={url} alt="" className="h-14 w-16 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">{categoryLabels[product.category ?? ""] ?? "Trái cây tươi"}</span>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight">{product.displayName}</h1>
              <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                {reviewCount === 0 ? (
                  <span className="text-amber-500">☆☆☆☆☆</span>
                ) : (
                  <>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground">{ratingAvg.toFixed(1)}</span>
                  </>
                )}
                <span>
                  {reviewsLoading
                    ? "Đang tải đánh giá…"
                    : reviewsError
                    ? "(Chưa tải được đánh giá)"
                    : reviewCount === 0
                    ? "(Chưa có đánh giá)"
                    : `(${reviewCount} đánh giá từ khách hàng)`}
                </span>
              </a>
              <p className="mt-3 text-2xl font-extrabold text-primary">
                {product.pricePerKg.toLocaleString("vi-VN")}đ <span className="text-sm font-semibold text-muted-foreground">/ kg</span>
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  ({Math.round(product.pricePerKg * 0.5).toLocaleString("vi-VN")}đ / phần 0,5 kg)
                </span>
              </p>
            </div>

            <section className="mt-4 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><PackageCheck className="h-4 w-4" />Tình trạng</span>
                <span className={`font-semibold ${Number(product.stockKg) > 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {Number(product.stockKg) > 0 ? `Còn ${Number(product.stockKg).toLocaleString("vi-VN")} kg` : "Tạm hết hàng"}
                </span>
              </div>
              <div className="my-3 border-t border-border" />
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="inline-flex shrink-0 items-center gap-2 text-muted-foreground"><Store className="h-4 w-4" />Cửa hàng</span>
                <span className="text-right font-semibold">{product.shopName}</span>
              </div>
              {product.distanceKm != null && (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Khoảng cách</span>
                  <span className="font-semibold">{product.distanceKm.toFixed(1)} km</span>
                </div>
              )}
              {product.batchCode && (
                <>
                  <div className="my-3 border-t border-border" />
                  <a href={`/trace?batchCode=${encodeURIComponent(product.batchCode)}`} className="flex items-center justify-between gap-2 text-sm font-semibold">
                    <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Kiểm định & truy xuất nguồn gốc</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </>
              )}
            </section>

            {Number(product.stockKg) > 0 && (
              <div className="mt-4 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Chọn khẩu phần mua</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Quy chuẩn 0,5 kg / phần</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-cream rounded-full p-1 border border-border">
                    <button
                      type="button"
                      disabled={portionKg <= 0.5}
                      onClick={() => setPortionKg((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10))}
                      className="h-8 w-8 grid place-items-center rounded-full bg-white border border-border disabled:opacity-40"
                      aria-label="Giảm 0,5 kg"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-16 text-center text-xs font-bold leading-tight">
                      {portionKg} kg
                      <span className="block text-[9px] font-normal text-muted-foreground">
                        {Math.round(portionKg / 0.5)} phần
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={portionKg >= Number(product.stockKg)}
                      onClick={() => setPortionKg((prev) => Math.min(Number(product.stockKg), Math.round((prev + 0.5) * 10) / 10))}
                      className="h-8 w-8 grid place-items-center rounded-full gt-gradient text-white disabled:opacity-40"
                      aria-label="Tăng 0,5 kg"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tạm tính ({portionKg} kg):</span>
                  <span className="font-extrabold text-primary text-base">
                    {Math.round(product.pricePerKg * portionKg).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            )}

            <button type="button" disabled={Number(product.stockKg) <= 0} onClick={addToCart} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl gt-gradient py-3.5 text-sm font-bold text-white gt-shadow disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingCart className="h-4 w-4" />Thêm {portionKg} kg vào giỏ hàng • {Math.round(product.pricePerKg * portionKg).toLocaleString("vi-VN")}đ
            </button>

            {/* Product Reviews Section */}
            <section id="reviews" className="mt-7 scroll-mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold">Đánh giá sản phẩm</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Đánh giá thực tế từ người mua đã nhận hàng</p>
                </div>
              </div>

              {/* Reviews Loading State */}
              {reviewsLoading && (
                <div className="mt-4 grid h-28 place-items-center">
                  <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {/* Reviews Error State */}
              {reviewsError && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  <span>{reviewsError}</span>
                  <button type="button" onClick={() => void loadProductReviews(productId)} className="inline-flex items-center gap-1 font-semibold underline">
                    <RotateCcw className="h-3 w-3" /> Thử lại
                  </button>
                </div>
              )}

              {/* Rating Summary & Distribution */}
              {!reviewsLoading && !reviewsError && (
                <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                  <div className="text-center">
                    <p className="text-4xl font-extrabold">{reviewCount > 0 ? ratingAvg.toFixed(1) : "0.0"}</p>
                    <div className="mt-1 flex justify-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-3 w-3 ${value <= Math.round(ratingAvg) && reviewCount > 0 ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{reviewCount} đánh giá</p>
                  </div>
                  <div className="space-y-1.5">
                    {distribution.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2 text-[10px]">
                        <span className="w-5 text-right font-semibold">{star}</span>
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${reviewCount > 0 ? (count / reviewCount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility & Review Form Area */}
              {!hasAuth() ? (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-white p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    <Link to="/profile" className="font-bold text-primary underline">Đăng nhập</Link> để viết đánh giá nếu bạn đã mua và nhận sản phẩm này.
                  </p>
                </div>
              ) : eligibilityLoading ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-white p-3 text-xs text-muted-foreground">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Đang kiểm tra điều kiện đánh giá…</span>
                </div>
              ) : eligibilityError ? (
                <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">
                  <span>{eligibilityError}</span>
                  <button type="button" onClick={() => void loadEligibility(productId)} className="inline-flex items-center gap-1 font-semibold underline">
                    <RotateCcw className="h-3 w-3" /> Thử lại
                  </button>
                </div>
              ) : eligibility?.alreadyReviewed ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
                  <p className="font-semibold">✓ Bạn đã gửi đánh giá cho sản phẩm này.</p>
                  <p className="mt-0.5 text-[11px] text-emerald-700">Cảm ơn bạn đã chia sẻ trải nghiệm với cộng đồng Golden Time!</p>
                </div>
              ) : eligibility?.eligible ? (
                <form onSubmit={handleSubmitReview} className="mt-4 rounded-2xl border border-primary/20 bg-white p-4 gt-shadow-soft">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Viết đánh giá của bạn</h3>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Đủ điều kiện đánh giá
                    </span>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-muted-foreground">Chọn mức độ hài lòng *</label>
                    <div className="mt-1 flex items-center gap-1" aria-label="Chọn số sao">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormRating(value)}
                          className="p-1 text-2xl transition-transform active:scale-110 focus:outline-none"
                          aria-label={`${value} sao`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              value <= formRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-600">
                        {formRating === 5
                          ? "Rất hài lòng"
                          : formRating === 4
                          ? "Hài lòng"
                          : formRating === 3
                          ? "Bình thường"
                          : formRating === 2
                          ? "Chưa hài lòng"
                          : "Rất tệ"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="review-comment" className="font-semibold text-muted-foreground">
                        Nhận xét (không bắt buộc)
                      </label>
                      <span className={`text-[10px] ${formComment.length > 2000 ? "font-bold text-red-600" : "text-muted-foreground"}`}>
                        {formComment.length}/2000
                      </span>
                    </div>
                    <textarea
                      id="review-comment"
                      rows={3}
                      maxLength={2000}
                      value={formComment}
                      onChange={(event) => setFormComment(event.target.value)}
                      placeholder="Chia sẻ cảm nhận về độ tươi ngon, chất lượng hoặc đóng gói của sản phẩm..."
                      className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {submitError && (
                    <p role="alert" className="mt-2 text-xs text-red-600">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gt-gradient py-2.5 text-sm font-semibold text-white gt-shadow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span>Đang gửi đánh giá…</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Gửi đánh giá</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-white p-3.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Bạn chưa thể đánh giá sản phẩm này</p>
                  <p className="mt-0.5 text-[11px]">Chỉ người mua có đơn hàng đã giao thành công (trạng thái Đã giao) chứa sản phẩm này mới có thể viết đánh giá.</p>
                </div>
              )}

              {/* Reviews List */}
              {!reviewsLoading && !reviewsError && reviews.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{review.authorName || "Khách hàng"}</p>
                        </div>
                        <time className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </time>
                      </div>
                      <div className="mt-1.5 flex">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-3.5 w-3.5 ${
                              value <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && review.comment.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {review.comment.trim()}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : !reviewsLoading && !reviewsError ? (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-white px-5 py-8 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cream text-xl">💬</div>
                  <p className="mt-3 text-sm font-semibold">Chưa có đánh giá nào cho sản phẩm này</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hãy là người đầu tiên chia sẻ cảm nhận sau khi nhận hàng!
                  </p>
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
    </PhoneShell>
  );
}
