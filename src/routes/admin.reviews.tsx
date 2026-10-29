import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, Package, RotateCcw, Search, Star, Store } from "lucide-react";
import { AdminShell, FilterBar } from "@/components/AdminShell";
import { api, type AdminProductReview, type AdminReview } from "@/lib/api";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  const [activeTab, setActiveTab] = useState<"SHOP" | "PRODUCT">("SHOP");
  const [storeReviews, setStoreReviews] = useState<AdminReview[]>([]);
  const [productReviews, setProductReviews] = useState<AdminProductReview[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.adminReviews(), api.adminProductReviews()])
      .then(([stores, products]) => {
        if (!active) return;
        setStoreReviews(stores);
        setProductReviews(products);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Không tải được danh sách đánh giá.");
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

  const filteredStoreReviews = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeReviews;
    return storeReviews.filter((review) =>
      `${review.user} ${review.shop}`.toLowerCase().includes(q)
    );
  }, [storeReviews, query]);

  const filteredProductReviews = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productReviews;
    return productReviews.filter((review) =>
      `${review.productName} ${review.shopName} ${review.author}`.toLowerCase().includes(q)
    );
  }, [productReviews, query]);

  const filteredCount = activeTab === "SHOP" ? filteredStoreReviews.length : filteredProductReviews.length;
  const subtitle = activeTab === "SHOP"
    ? `${storeReviews.length} đánh giá cửa hàng từ người dùng`
    : `${productReviews.length} đánh giá sản phẩm từ người dùng`;

  return (
    <AdminShell title="Đánh giá" subtitle={subtitle}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab("SHOP"); setQuery(""); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "SHOP"
                ? "gt-gradient text-white shadow-sm"
                : "bg-white border border-border text-foreground/70 hover:bg-muted/50"
            }`}
          >
            <Store className="h-4 w-4" />
            Đánh giá cửa hàng
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === "SHOP" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
              {storeReviews.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("PRODUCT"); setQuery(""); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "PRODUCT"
                ? "gt-gradient text-white shadow-sm"
                : "bg-white border border-border text-foreground/70 hover:bg-muted/50"
            }`}
          >
            <Package className="h-4 w-4" />
            Đánh giá sản phẩm
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === "PRODUCT" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
              {productReviews.length}
            </span>
          </button>
        </div>
      </div>

      <FilterBar>
        <div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={activeTab === "SHOP" ? "Tìm theo người dùng hoặc cửa hàng..." : "Tìm theo sản phẩm, cửa hàng hoặc người đánh giá..."}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </FilterBar>

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

      {loading ? (
        <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
          Đang tải đánh giá...
        </div>
      ) : activeTab === "SHOP" ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStoreReviews.map((review) => (
            <article key={review.id} className="bg-white rounded-2xl border border-border gt-shadow-soft p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{review.user}</p>
                    <p className="text-xs text-muted-foreground">{review.shop}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                    {review.purchased ? "Đã mua" : "Đã quét"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3" aria-label={`${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${value <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold">{review.rating}/5</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                {new Date(review.createdAt).toLocaleString("vi-VN")}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProductReviews.map((review) => (
            <article key={review.id} className="bg-white rounded-2xl border border-border gt-shadow-soft p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate" title={review.productName}>{review.productName}</p>
                    <p className="text-xs text-muted-foreground truncate" title={review.shopName}>{review.shopName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md shrink-0">
                    {review.author}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3" aria-label={`${review.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${value <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold">{review.rating}/5</span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                {new Date(review.createdAt).toLocaleString("vi-VN")}
              </p>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && filteredCount === 0 && (
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">
          {query ? "Không tìm thấy đánh giá nào phù hợp." : "Chưa có đánh giá."}
        </div>
      )}
    </AdminShell>
  );
}
