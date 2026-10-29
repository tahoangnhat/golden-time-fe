import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Package, RotateCcw, Star, Store } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopProductReview, type ShopReview } from "@/lib/api";

export const Route = createFileRoute("/business/reviews")({
  head: () => ({ meta: [{ title: "Đánh giá — Golden Time Business" }] }),
  component: Reviews,
});

function Reviews() {
  const [activeTab, setActiveTab] = useState<"SHOP" | "PRODUCT">("SHOP");
  const [storeReviews, setStoreReviews] = useState<ShopReview[]>([]);
  const [productReviews, setProductReviews] = useState<ShopProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.shopReviews(), api.shopProductReviews()])
      .then(([stores, products]) => {
        if (!active) return;
        setStoreReviews(stores);
        setProductReviews(products);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Không tải được đánh giá.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadReviews();
    return cleanup;
  }, [loadReviews]);

  const currentReviews = activeTab === "SHOP" ? storeReviews : productReviews;

  const average = useMemo(() => {
    const list = activeTab === "SHOP" ? storeReviews : productReviews;
    return list.length ? list.reduce((total, item) => total + item.rating, 0) / list.length : null;
  }, [activeTab, storeReviews, productReviews]);

  const distribution = useMemo(() => {
    const list = activeTab === "SHOP" ? storeReviews : productReviews;
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: list.filter((item) => item.rating === rating).length,
    }));
  }, [activeTab, storeReviews, productReviews]);

  const subtitle = activeTab === "SHOP"
    ? `${storeReviews.length} đánh giá cửa hàng đã ghi nhận`
    : `${productReviews.length} đánh giá sản phẩm đã ghi nhận`;

  return (
    <BusinessShell title="Đánh giá từ khách hàng" subtitle={subtitle}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("SHOP")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "SHOP"
                ? "gt-gradient text-white shadow-sm"
                : "bg-white border border-border text-foreground/70 hover:bg-muted/50"
            }`}
          >
            <Store className="h-4 w-4" />
            Đánh giá cửa hàng
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === "SHOP" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {storeReviews.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PRODUCT")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "PRODUCT"
                ? "gt-gradient text-white shadow-sm"
                : "bg-white border border-border text-foreground/70 hover:bg-muted/50"
            }`}
          >
            <Package className="h-4 w-4" />
            Đánh giá sản phẩm
            <span
              className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === "PRODUCT" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {productReviews.length}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadReviews}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Thử lại
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl p-5 border border-border text-center">
          <p className="text-xs text-muted-foreground">Đánh giá trung bình</p>
          <p className="text-5xl font-extrabold mt-2">{average == null ? "—" : average.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-2">{currentReviews.length} lượt đánh giá</p>
        </section>
        <section className="bg-white rounded-2xl p-5 border border-border">
          <p className="font-bold mb-3 text-sm">Phân bổ sao</p>
          <div className="space-y-2">
            {distribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-2 text-xs">
                <span className="w-7 font-semibold">{item.rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gt-gradient"
                    style={{ width: `${currentReviews.length ? (item.count / currentReviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
          Đang tải đánh giá...
        </div>
      ) : activeTab === "SHOP" ? (
        <div className="mt-5 space-y-3">
          {storeReviews.map((review) => (
            <article key={review.id} className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-sm">{review.author}</p>
                <div className="flex" aria-label={`${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-3 w-3 ${value <= review.rating ? "text-orange-400 fill-orange-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  · {new Date(review.createdAt).toLocaleString("vi-VN")} · {review.purchased ? "Đã mua" : "Đã quét"}
                </span>
              </div>
              {review.comment?.trim() ? (
                <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
              ) : (
                <p className="mt-2 text-xs italic text-muted-foreground">Không có nhận xét văn bản.</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {productReviews.map((review) => (
            <article key={review.id} className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-xs bg-[oklch(0.97_0.04_95)] text-foreground border border-border/60 px-2.5 py-1 rounded-lg">
                  {review.productName}
                </span>
                <p className="font-bold text-sm">{review.author}</p>
                <div className="flex" aria-label={`${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-3 w-3 ${value <= review.rating ? "text-orange-400 fill-orange-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  · {new Date(review.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              {review.comment?.trim() ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground">{review.comment}</p>
              ) : (
                <p className="mt-2 text-xs italic text-muted-foreground">Khách hàng không để lại nhận xét văn bản.</p>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && !error && currentReviews.length === 0 && (
        <p className="mt-5 rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Chưa có đánh giá {activeTab === "SHOP" ? "về cửa hàng" : "về sản phẩm"}.
        </p>
      )}
    </BusinessShell>
  );
}
