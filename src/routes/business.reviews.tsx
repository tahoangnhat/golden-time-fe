import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopReview } from "@/lib/api";

export const Route = createFileRoute("/business/reviews")({ head: () => ({ meta: [{ title: "Đánh giá — Golden Time Business" }] }), component: Reviews });

function Reviews() {
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.shopReviews().then(setReviews).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được đánh giá.")); }, []);
  const average = useMemo(() => reviews.length ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length : null, [reviews]);
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((item) => item.rating === rating).length }));
  return <BusinessShell title="Đánh giá từ khách hàng" subtitle={`${reviews.length} đánh giá đã ghi nhận`}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid lg:grid-cols-2 gap-4"><section className="bg-white rounded-2xl p-5 border border-border text-center"><p className="text-xs text-muted-foreground">Đánh giá trung bình</p><p className="text-5xl font-extrabold mt-2">{average == null ? "—" : average.toFixed(1)}</p><p className="text-xs text-muted-foreground mt-2">{reviews.length} lượt đánh giá</p></section><section className="bg-white rounded-2xl p-5 border border-border"><p className="font-bold mb-3 text-sm">Phân bổ sao</p><div className="space-y-2">{distribution.map((item) => <div key={item.rating} className="flex items-center gap-2 text-xs"><span className="w-7 font-semibold">{item.rating}★</span><div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full gt-gradient" style={{ width: `${reviews.length ? item.count / reviews.length * 100 : 0}%` }} /></div><span className="w-6 text-right text-muted-foreground">{item.count}</span></div>)}</div></section></div>
    <div className="mt-5 space-y-3">{reviews.map((review) => <article key={review.id} className="bg-white rounded-2xl p-4 border border-border"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-sm">{review.author}</p><div className="flex">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3 w-3 ${value <= review.rating ? "text-orange-400 fill-orange-400" : "text-muted"}`} />)}</div><span className="text-xs text-muted-foreground">· {new Date(review.createdAt).toLocaleString("vi-VN")} · {review.purchased ? "Đã mua" : "Đã quét"}</span></div><p className="mt-2 text-sm">{review.comment}</p></article>)}{!error && reviews.length === 0 && <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">Chưa có đánh giá.</p>}</div>
  </BusinessShell>;
}
