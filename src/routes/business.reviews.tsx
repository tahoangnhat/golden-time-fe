import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RotateCcw, Star } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopProductReview } from "@/lib/api";

export const Route = createFileRoute("/business/reviews")({
  head: () => ({ meta: [{ title: "Đánh giá sản phẩm — Golden Time Business" }] }),
  component: Reviews,
});

function Reviews() {
  const [productReviews, setProductReviews] = useState<ShopProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.shopProductReviews()
      .then((products) => { if (active) setProductReviews(products); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được đánh giá sản phẩm."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => loadReviews(), [loadReviews]);

  const average = useMemo(() => productReviews.length
    ? productReviews.reduce((total, review) => total + review.rating, 0) / productReviews.length
    : null, [productReviews]);

  return (
    <BusinessShell title="Đánh giá sản phẩm" subtitle={`${productReviews.length} lượt đánh giá sản phẩm`}>
      {error && <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={loadReviews} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"><RotateCcw className="h-3.5 w-3.5" />Thử lại</button></div>}

      <section className="mb-5 rounded-2xl border border-border bg-white p-5 text-center">
        <p className="text-xs text-muted-foreground">Điểm trung bình sản phẩm</p>
        <p className="mt-2 text-5xl font-extrabold">{average == null ? "—" : average.toFixed(1)}</p>
        <p className="mt-2 text-xs text-muted-foreground">{productReviews.length} lượt đánh giá</p>
      </section>

      {loading ? <div className="flex items-center justify-center p-16 text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Đang tải đánh giá…</div>
        : <div className="space-y-3">
          {productReviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-border/60 bg-[oklch(0.97_0.04_95)] px-2.5 py-1 text-xs font-semibold">{review.productName}</span>
              <p className="text-sm font-bold">{review.author}</p>
              <div className="flex" aria-label={`${review.rating} sao`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3 w-3 ${value <= review.rating ? "fill-orange-400 text-orange-400" : "text-muted"}`} />)}</div>
              <span className="text-xs text-muted-foreground">· {new Date(review.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            {review.comment?.trim() ? <p className="mt-2 text-sm leading-relaxed">{review.comment}</p> : <p className="mt-2 text-xs italic text-muted-foreground">Khách hàng không để lại nhận xét.</p>}
          </article>)}
          {!productReviews.length && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có đánh giá sản phẩm.</p>}
        </div>}
    </BusinessShell>
  );
}
