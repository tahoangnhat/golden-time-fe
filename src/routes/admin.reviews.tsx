import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { AdminShell, FilterBar } from "@/components/AdminShell";
import { api, type AdminReview } from "@/lib/api";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api.adminReviews().then(setReviews).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được đánh giá.")); }, []);
  const filtered = useMemo(() => reviews.filter((review) => `${review.user} ${review.shop} ${review.comment}`.toLowerCase().includes(query.toLowerCase())), [reviews, query]);
  return <AdminShell title="Đánh giá cửa hàng" subtitle={`${reviews.length} đánh giá từ người dùng`}>
    <FilterBar><div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm đánh giá hoặc cửa hàng..." className="flex-1 bg-transparent outline-none text-sm" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map((review) => <article key={review.id} className="bg-white rounded-2xl border border-border gt-shadow-soft p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-sm">{review.user}</p><p className="text-xs text-muted-foreground">{review.shop}</p></div><span className="text-xs text-muted-foreground">{review.purchased ? "Đã mua" : "Đã quét"}</span></div><div className="flex items-center gap-1 mt-3" aria-label={`${review.rating} sao`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}<span className="ml-1 text-xs font-bold">{review.rating}/5</span></div><p className="text-sm mt-3 leading-relaxed">{review.comment}</p><p className="mt-3 text-[11px] text-muted-foreground">{new Date(review.createdAt).toLocaleString("vi-VN")}</p></article>)}
    </div>
    {!error && filtered.length === 0 && <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có đánh giá.</div>}
  </AdminShell>;
}
