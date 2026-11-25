import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ChevronDown, Clock3, PackageCheck, Send, Star, Truck } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { api, type OrderDetail, type OrderSummary, type ProductReviewEligibility } from "@/lib/api";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Lịch sử mua hàng — Golden Time" }] }),
  component: Orders,
});

const statusLabel: Record<string, string> = {
  PENDING: "Chờ cửa hàng xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_TRANSIT: "Đang giao",
  DELIVERED: "Đã nhận hàng",
  CANCELLED: "Đã hủy",
};

const paymentLabel: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán PayOS",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy thanh toán",
  FAILED: "Thanh toán lỗi",
};

const carrierStatusLabel: Record<string, string> = {
  ready_to_pick: "Chờ GHN lấy hàng", picking: "GHN đang lấy hàng", picked: "GHN đã lấy hàng",
  storing: "Đang ở kho GHN", transporting: "Đang trung chuyển", sorting: "Đang phân loại",
  delivering: "GHN đang giao", delivered: "GHN báo đã giao", delivery_fail: "Giao chưa thành công",
  waiting_to_return: "Chờ hoàn hàng", returning: "Đang hoàn hàng", returned: "Đã hoàn về shop",
  cancel: "Đơn GHN đã hủy", exception: "GHN cần xử lý thêm",
};

function Orders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, OrderDetail>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<number | null>(null);
  const [activeReviewKey, setActiveReviewKey] = useState<string | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<Record<string, ProductReviewEligibility>>({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusyKey, setReviewBusyKey] = useState<string | null>(null);
  const [loadingReviewOrderId, setLoadingReviewOrderId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      setOrders(await api.orders());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được lịch sử mua hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  async function confirmReceived(order: OrderSummary) {
    setBusyOrderId(order.id);
    setError("");
    setNotice("");
    try {
      const result = await api.confirmOrderReceived(order.id);
      await refresh();
      setNotice(result.walletCredited
        ? `Bạn đã xác nhận nhận đơn #${order.id}. Doanh thu của cửa hàng đã được ghi nhận.`
        : `Bạn đã xác nhận nhận đơn #${order.id}. Đơn COD sẽ vào ví cửa hàng sau khi GHN chuyển tiền về sàn.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xác nhận đã nhận hàng.");
    } finally {
      setBusyOrderId(null);
    }
  }

  async function toggleDetails(order: OrderSummary) {
    const orderId = order.id;
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setActiveReviewKey(null);
      return;
    }
    setExpandedOrderId(orderId);
    setActiveReviewKey(null);
    setError("");
    setLoadingReviewOrderId(orderId);
    try {
      let detail = details[orderId];
      if (!detail) {
        setLoadingDetailsId(orderId);
        detail = await api.order(orderId);
        setDetails((current) => ({ ...current, [orderId]: detail }));
      }
      if (order.status === "DELIVERED") {
        const eligibility = await Promise.all(detail.items.map(async (item) => [
          `${orderId}:${item.productId}`,
          await api.productReviewEligibility(item.productId, orderId),
        ] as const));
        setReviewEligibility((current) => ({ ...current, ...Object.fromEntries(eligibility) }));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm trong đơn hàng.");
    } finally {
      setLoadingDetailsId(null);
      setLoadingReviewOrderId(null);
    }
  }

  async function submitProductReview(event: FormEvent<HTMLFormElement>, orderId: number, productId: number, productName: string) {
    event.preventDefault();
    const key = `${orderId}:${productId}`;
    setReviewBusyKey(key);
    setReviewError("");
    setNotice("");
    try {
      await api.createProductReview(productId, { orderId, rating: reviewRating, comment: reviewComment.trim() || null });
      const eligibility = await api.productReviewEligibility(productId, orderId);
      setReviewEligibility((current) => ({ ...current, [key]: eligibility }));
      setActiveReviewKey(null);
      setReviewComment("");
      setNotice(`Cảm ơn bạn đã đánh giá ${productName} trong lần mua này.`);
    } catch (cause) {
      setReviewError(cause instanceof Error ? cause.message : "Không gửi được đánh giá sản phẩm.");
    } finally {
      setReviewBusyKey(null);
    }
  }

  return (
    <PhoneShell>
      <StatusBar title="Lịch sử mua hàng" />
      <div className="px-5 pb-4">
        <div className="mt-2 mb-4">
          <h1 className="text-xl font-extrabold">Đơn hàng của bạn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Theo dõi trạng thái giao hàng và xác nhận khi đã nhận được hàng.</p>
        </div>

        {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        {loading ? <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">Đang tải đơn hàng…</div>
          : orders.length === 0 ? <div className="rounded-2xl border border-border bg-white p-8 text-center"><PackageCheck className="mx-auto h-9 w-9 text-primary" /><p className="mt-3 font-bold">Bạn chưa có đơn hàng</p><p className="mt-1 text-sm text-muted-foreground">Đơn hàng đã đặt sẽ xuất hiện tại đây.</p></div>
            : <div className="space-y-3">
              {orders.map((order) => {
                const delivering = order.status === "IN_TRANSIT";
                const received = order.status === "DELIVERED";
                return <article key={order.id} className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-mono text-xs text-muted-foreground">Đơn hàng #{order.id}</p><h2 className="mt-1 font-bold">{order.shopName}</h2></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${received ? "bg-green-100 text-green-800" : delivering ? "bg-blue-100 text-blue-800" : order.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-cream text-primary"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{new Date(order.createdAt).toLocaleString("vi-VN")}<span>·</span>{order.itemCount} sản phẩm</div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">{order.paymentMethod} · {paymentLabel[order.paymentStatus] ?? order.paymentStatus}</span>
                    <strong className="text-base">{order.total.toLocaleString("vi-VN")}đ</strong>
                  </div>
                  {order.trackingCode && <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900"><p><b>GHN · Mã vận đơn:</b> <span className="font-mono font-bold">{order.trackingCode}</span></p>{order.carrierStatus && <p className="mt-1">Trạng thái: {carrierStatusLabel[order.carrierStatus] ?? order.carrierStatus}</p>}{order.expectedDeliveryAt && <p className="mt-1">Dự kiến giao: {new Date(order.expectedDeliveryAt).toLocaleString("vi-VN")}</p>}</div>}
                  <button type="button" aria-expanded={expandedOrderId === order.id} onClick={() => void toggleDetails(order)} className="mt-3 flex w-full items-center justify-between rounded-xl bg-cream px-3 py-2.5 text-sm font-semibold">
                    <span>{expandedOrderId === order.id ? "Ẩn sản phẩm" : "Xem sản phẩm đã mua"}</span><ChevronDown className={`h-4 w-4 transition-transform ${expandedOrderId === order.id ? "rotate-180" : ""}`} />
                  </button>
                  {expandedOrderId === order.id && <div className="mt-2 rounded-xl border border-border px-3">
                    {loadingDetailsId === order.id ? <p className="py-3 text-sm text-muted-foreground">Đang tải chi tiết đơn…</p>
                      : details[order.id] ? <>
                        <ul className="divide-y divide-border">{details[order.id].items.map((item, index) => {
                          const key = `${order.id}:${item.productId}`;
                          const eligibility = reviewEligibility[key];
                          return <li key={`${order.id}-${index}`} className="py-3 text-sm">
                            <div className="flex items-start justify-between gap-3"><span>{item.emoji} {item.name}<span className="block text-xs text-muted-foreground">{item.quantityKg} kg × {item.unitPrice.toLocaleString("vi-VN")}đ/kg</span></span><strong className="shrink-0">{item.lineTotal.toLocaleString("vi-VN")}đ</strong></div>
                            {received && <div className="mt-2">
                              {loadingReviewOrderId === order.id ? <p className="text-xs text-muted-foreground">Đang kiểm tra quyền đánh giá…</p>
                                : eligibility?.eligible ? activeReviewKey === key ? <form onSubmit={(event) => void submitProductReview(event, order.id, item.productId, item.name)} className="rounded-xl border border-border bg-[#fbfcf9] p-3">
                                  <p className="text-xs font-semibold">Đánh giá {item.name} trong đơn #{order.id}</p>
                                  <div className="mt-2 flex items-center gap-1" role="group" aria-label={`Chọn số sao cho ${item.name}`}>
                                    {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} sao`} aria-pressed={reviewRating === star} onClick={() => setReviewRating(star)} className="rounded-md p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                                      <Star className={`h-5 w-5 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                                    </button>)}
                                    <span className="ml-1 text-xs font-semibold text-muted-foreground">{reviewRating}/5</span>
                                  </div>
                                  <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={2000} rows={2} placeholder="Nhận xét về sản phẩm (không bắt buộc)" className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary" />
                                  {reviewError && <p role="alert" className="mt-1 text-xs text-red-700">{reviewError}</p>}
                                  <div className="mt-2 flex gap-2">
                                    <button type="button" onClick={() => { setActiveReviewKey(null); setReviewError(""); }} className="flex-1 rounded-lg border border-border bg-white py-2 text-xs font-semibold">Để sau</button>
                                    <button type="submit" disabled={reviewBusyKey === key} className="flex flex-1 items-center justify-center gap-1 rounded-lg gt-gradient py-2 text-xs font-bold text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" />{reviewBusyKey === key ? "Đang gửi…" : "Gửi đánh giá"}</button>
                                  </div>
                                </form> : <button type="button" onClick={() => { setReviewRating(5); setReviewComment(""); setReviewError(""); setActiveReviewKey(key); }} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"><Star className="h-3.5 w-3.5" />Đánh giá sản phẩm</button>
                                : eligibility?.alreadyReviewed ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Bạn đã đánh giá sản phẩm trong lần mua này.</p>
                                : null}
                            </div>}
                          </li>;
                        })}</ul>
                        <div className="space-y-1 border-t border-border py-3 text-xs"><p className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{details[order.id].subtotal.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between"><span className="text-muted-foreground">Phí giao hàng</span><span>{details[order.id].shippingFee.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between font-bold"><span>Tổng đơn</span><span>{details[order.id].total.toLocaleString("vi-VN")}đ</span></p><p className="pt-1 text-muted-foreground">Giao đến: {details[order.id].deliveryAddress}</p></div>
                      </> : null}
                  </div>}
                  {delivering && <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
                    <div className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4" /> Cửa hàng đã gửi đơn đi</div>
                    <p className="mt-1 text-xs text-blue-800">{order.carrierStatus === "delivered" ? "GHN báo đã giao. Nếu bạn đã nhận đủ hàng, xác nhận bên dưới." : "Khi đã nhận đủ hàng, hãy xác nhận bên dưới."}</p>
                    <button type="button" disabled={busyOrderId === order.id} onClick={() => void confirmReceived(order)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl gt-gradient py-2.5 text-sm font-bold text-white disabled:opacity-50">
                      <CheckCircle2 className="h-4 w-4" />{busyOrderId === order.id ? "Đang xác nhận…" : "Tôi đã nhận được hàng"}
                    </button>
                  </div>}
                  {received && <p className="mt-3 rounded-xl bg-green-50 p-3 text-xs text-green-800">Bạn đã xác nhận nhận được hàng.</p>}
                </article>;
              })}
            </div>}
      </div>
    </PhoneShell>
  );
}
