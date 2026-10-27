import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft, ChevronRight, LoaderCircle, MapPin, PackageCheck, ShoppingCart, Star, Store, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { ProductThumb } from "@/components/FruitThumb";
import { api, type Product, type Review } from "@/lib/api";
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const cart = useCart();

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

  useEffect(() => {
    if (!product) return;
    let active = true;
    setReviewsLoading(true);
    setReviewsError("");
    api.reviews(product.shopId)
      .then((result) => { if (active) setReviews(result.filter((review) => review.purchased)); })
      .catch((cause) => { if (active) setReviewsError(cause instanceof Error ? cause.message : "Không tải được đánh giá."); })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [product]);

  const average = useMemo(() => reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null, [reviews]);
  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  })), [reviews]);

  function addToCart() {
    if (!product) return;
    if (Number(product.stockKg) <= 0) return toast.error("Sản phẩm hiện đã hết hàng.");
    if (!cart.add(product)) return toast.error("Giỏ hàng chỉ nhận sản phẩm từ một cửa hàng. Hãy xóa giỏ hàng trước khi đổi cửa hàng.");
    toast.success(`${product.displayName} đã được thêm vào giỏ.`);
  }

  const images = product?.imageUrls?.length
    ? product.imageUrls
    : product?.imageUrl ? [product.imageUrl] : [];

  return (
    <PhoneShell>
      <StatusBar title="Chi tiết sản phẩm" right={<Link to="/cart" aria-label="Giỏ hàng" className="relative"><ShoppingCart className="h-4 w-4" />{cart.items.length > 0 && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-white">{cart.items.length}</span>}</Link>} />
      <div className="px-5 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <Link to="/shop" aria-label="Quay lại cửa hàng" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white"><ChevronLeft className="h-5 w-5" /></Link>
          <span className="text-[11px] text-muted-foreground">Mua hàng <span className="mx-1">/</span> Chi tiết</span>
          <Link to="/cart" aria-label="Mở giỏ hàng" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white"><ShoppingCart className="h-4 w-4" /></Link>
        </div>

        {loading ? <div className="grid min-h-72 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div> : error || !product ? (
          <div className="mt-5 rounded-2xl border border-border bg-white p-5 text-center">
            <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy sản phẩm."}</p>
            <Link to="/shop" className="mt-4 inline-flex rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white">Quay lại cửa hàng</Link>
          </div>
        ) : <>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-white p-2 gt-shadow-soft">
            <ProductThumb emoji={product.emoji} imageUrl={images[imageIndex] ?? product.imageUrl} alt={product.displayName} size="xl" className="!h-72 !w-full !rounded-[1.3rem] !text-8xl" />
            {product.aiScore != null && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold shadow-sm"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />AI {product.aiScore}/100</span>}
            {images.length > 1 && <>
              <button type="button" aria-label="Ảnh trước" onClick={() => setImageIndex((index) => (index + images.length - 1) % images.length)} className="absolute left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setImageIndex((index) => (index + 1) % images.length)} className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronRight className="h-5 w-5" /></button>
              <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white">{imageIndex + 1}/{images.length}</span>
            </>}
          </div>
          {images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{images.map((url, index) => <button key={`${url}-${index}`} type="button" onClick={() => setImageIndex(index)} aria-label={`Xem ảnh ${index + 1}`} className={`shrink-0 rounded-xl border-2 ${index === imageIndex ? "border-primary" : "border-transparent"}`}><img src={url} alt="" className="h-14 w-16 rounded-lg object-cover" /></button>)}</div>}

          <div className="mt-4">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">{categoryLabels[product.category ?? ""] ?? "Trái cây tươi"}</span>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight">{product.displayName}</h1>
            <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              {average == null ? <span className="text-amber-500">☆☆☆☆☆</span> : <><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="font-bold text-foreground">{average.toFixed(1)}</span></>}
              <span>{reviewsLoading ? "Đang tải đánh giá…" : `(${reviews.length} đánh giá từ khách đã mua)`}</span>
            </a>
            <p className="mt-3 text-2xl font-extrabold text-primary">{product.pricePerKg.toLocaleString("vi-VN")}đ <span className="text-sm font-semibold text-muted-foreground">/ kg</span></p>
          </div>

          <section className="mt-4 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
            <div className="flex items-center justify-between gap-3 text-sm"><span className="inline-flex items-center gap-2 text-muted-foreground"><PackageCheck className="h-4 w-4" />Tình trạng</span><span className={`font-semibold ${Number(product.stockKg) > 0 ? "text-emerald-700" : "text-red-600"}`}>{Number(product.stockKg) > 0 ? `Còn ${Number(product.stockKg).toLocaleString("vi-VN")} kg` : "Tạm hết hàng"}</span></div>
            <div className="my-3 border-t border-border" />
            <div className="flex items-start justify-between gap-3 text-sm"><span className="inline-flex shrink-0 items-center gap-2 text-muted-foreground"><Store className="h-4 w-4" />Cửa hàng</span><span className="text-right font-semibold">{product.shopName}</span></div>
            {product.distanceKm != null && <div className="mt-3 flex items-center justify-between gap-3 text-sm"><span className="inline-flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Khoảng cách</span><span className="font-semibold">{product.distanceKm.toFixed(1)} km</span></div>}
            {product.batchCode && <><div className="my-3 border-t border-border" /><a href={`/trace?batchCode=${encodeURIComponent(product.batchCode)}`} className="flex items-center justify-between gap-2 text-sm font-semibold"><span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Kiểm định & truy xuất nguồn gốc</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></a></>}
          </section>

          <button type="button" disabled={Number(product.stockKg) <= 0} onClick={addToCart} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl gt-gradient py-3.5 text-sm font-bold text-white gt-shadow disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart className="h-4 w-4" />Thêm vào giỏ hàng</button>

          <section id="reviews" className="mt-7 scroll-mt-4">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="text-lg font-extrabold">Đánh giá khách hàng</h2><p className="mt-0.5 text-[11px] text-muted-foreground">Đánh giá cửa hàng từ những người đã mua</p></div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-800"><BadgeCheck className="h-3 w-3" />Đã mua hàng</span>
            </div>

            {reviewsError && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{reviewsError}</p>}
            {reviewsLoading ? <div className="grid h-32 place-items-center"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /></div> : reviews.length > 0 ? <>
              <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                <div className="text-center"><p className="text-4xl font-extrabold">{average?.toFixed(1)}</p><div className="mt-1 flex justify-center">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3 w-3 ${value <= Math.round(average ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div><p className="mt-1 text-[10px] text-muted-foreground">{reviews.length} đánh giá</p></div>
                <div className="space-y-1.5">{distribution.map(({ rating, count }) => <div key={rating} className="flex items-center gap-2 text-[10px]"><span className="w-5 text-right font-semibold">{rating}</span><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-amber-400" style={{ width: `${reviews.length ? count / reviews.length * 100 : 0}%` }} /></div><span className="w-4 text-right text-muted-foreground">{count}</span></div>)}</div>
              </div>
              <div className="mt-3 space-y-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{review.author}</p><span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-800"><BadgeCheck className="h-3 w-3" />Đã mua hàng</span></div><time className="shrink-0 text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</time></div>
                <div className="mt-2 flex">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3.5 w-3.5 ${value <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{review.comment}</p>
              </article>)}</div>
            </> : !reviewsError && <div className="mt-4 rounded-2xl border border-dashed border-border bg-white px-5 py-8 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cream text-xl">💬</div><p className="mt-3 text-sm font-semibold">Chưa có đánh giá từ khách đã mua</p><p className="mt-1 text-xs text-muted-foreground">Hãy quay lại sau khi khách hàng chia sẻ trải nghiệm.</p></div>}
          </section>
        </>}
      </div>
    </PhoneShell>
  );
}
