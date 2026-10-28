import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Banknote, QrCode, Minus, Plus, Trash2, CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { ProductThumb } from "@/components/FruitThumb";
import { ApiError, api, hasAuth, userStorageKey, type OrderDetail } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Giỏ hàng — Golden Time" }] }),
  component: Cart,
});

function Cart() {
  const cart = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "PAYOS">("COD");
  const [payosEnabled, setPayosEnabled] = useState(false);
  const [paymentReturnMode, setPaymentReturnMode] = useState("");
  const [paymentReturnOrder, setPaymentReturnOrder] = useState<OrderDetail | null>(null);
  const shipping = 15000;
  const paymentWasCancelledOnPayOS = paymentReturnMode.toUpperCase() === "CANCELLED" || paymentReturnMode.toLowerCase() === "cancelled";

  useEffect(() => {
    setPayosEnabled(false);
    let active = true;
    api.paymentMethods().then((methods) => {
      if (active) setPayosEnabled(methods.payosEnabled);
    }).catch(() => {
      if (active) setPayosEnabled(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!payosEnabled && paymentMethod === "PAYOS") setPaymentMethod("COD");
  }, [payosEnabled, paymentMethod]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("payment") || params.get("status") || (params.get("cancel") === "true" ? "cancelled" : "returned");
    const orderCode = Number(params.get("orderCode"));
    if (!mode || !Number.isSafeInteger(orderCode) || orderCode <= 0) return;

    setPaymentReturnMode(mode);
    let active = true;
    let intervalId: number | undefined;
    let timeoutId: number | undefined;
    const refreshOrder = async () => {
      try {
        const latest = await api.order(orderCode);
        if (!active) return;
        setPaymentReturnOrder(latest);
        if (latest.paymentStatus !== "PENDING" && intervalId) window.clearInterval(intervalId);
      } catch (cause) {
        if (active) setError(cause instanceof ApiError ? cause.message : "Không tải được trạng thái thanh toán.");
        if (intervalId) window.clearInterval(intervalId);
      }
    };
    intervalId = window.setInterval(refreshOrder, 3000);
    timeoutId = window.setTimeout(() => intervalId && window.clearInterval(intervalId), 45000);
    void refreshOrder();
    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.items.length === 0) return setError("Giỏ hàng đang trống.");
    if (!hasAuth()) return setError("Để đặt hàng, hãy đăng nhập trong ứng dụng Golden Time.");
    setBusy(true); setError("");
    try {
      const created = await api.createOrder({ items: cart.items.map((item) => ({ productId: item.productId, quantityKg: item.quantityKg })), paymentMethod, deliveryName: name, deliveryPhone: phone, deliveryAddress: address });
      window.localStorage.setItem(userStorageKey("golden-time-order-proof"), JSON.stringify({ orderId: created.id, shopId: created.shopId, shopName: created.shopName }));
      cart.clear();
      if (paymentMethod === "PAYOS") {
        if (!created.checkoutUrl) throw new Error("PayOS chưa trả về link thanh toán cho đơn hàng.");
        window.location.assign(created.checkoutUrl);
        return;
      }
      setOrder(created);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không tạo được đơn hàng.");
    } finally { setBusy(false); }
  }
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2"><Link to="/shop" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link><span className="font-semibold text-sm">Giỏ hàng</span><span className="w-9" /></div>
      {paymentReturnMode ? <div className="px-5 mt-10"><div className="bg-white rounded-3xl p-6 text-center border border-border">
        <div className={`h-16 w-16 mx-auto rounded-full ${paymentReturnOrder?.paymentStatus === "PAID" ? "gt-gradient text-white" : "bg-cream text-primary"} grid place-items-center gt-shadow`}>
          {paymentReturnOrder?.paymentStatus === "PAID" ? <CheckCircle2 className="h-8 w-8" /> : <QrCode className="h-8 w-8" />}
        </div>
        <h3 className="font-extrabold text-lg mt-3">{paymentReturnOrder?.paymentStatus === "PAID" ? "Thanh toán thành công" : paymentReturnOrder?.paymentStatus === "CANCELLED" ? "Đơn hàng đã được hủy" : "Đang chờ xác nhận thanh toán"}</h3>
        {paymentReturnOrder ? <><p className="text-sm text-muted-foreground mt-1">Đơn hàng #{paymentReturnOrder.id} • {paymentReturnOrder.shopName}</p><p className="font-bold text-primary mt-2">{paymentReturnOrder.total.toLocaleString("vi-VN")}đ</p></> : <p className="text-sm text-muted-foreground mt-2">{error || "Đang tải trạng thái đơn hàng…"}</p>}
        {paymentReturnOrder?.paymentStatus === "PENDING" && <>
          <p className="text-xs text-muted-foreground mt-3">{paymentWasCancelledOnPayOS ? "Bạn đã hủy thao tác trên PayOS. Hãy hủy đơn bên dưới để hoàn lại tồn kho, hoặc kiểm tra lại nếu đã chuyển tiền." : "Trạng thái được xác nhận từ máy chủ PayOS. Nếu bạn vừa thanh toán, hệ thống sẽ tự cập nhật trong ít phút."}</p>
          {!paymentWasCancelledOnPayOS && paymentReturnOrder.checkoutUrl && <a href={paymentReturnOrder.checkoutUrl} className="mt-5 block py-3 rounded-2xl gt-gradient text-white font-semibold">Tiếp tục thanh toán</a>}
          <button type="button" disabled={busy} onClick={async () => {
            if (!paymentReturnOrder) return;
            setBusy(true); setError("");
            try { setPaymentReturnOrder(await api.order(paymentReturnOrder.id)); }
            catch (cause) { setError(cause instanceof ApiError ? cause.message : "Không tải được trạng thái thanh toán."); }
            finally { setBusy(false); }
          }} className="mt-2 w-full py-3 rounded-2xl bg-cream font-semibold disabled:opacity-50">Kiểm tra trạng thái</button>
          <button type="button" disabled={busy} onClick={async () => {
            if (!paymentReturnOrder) return;
            setBusy(true); setError("");
            try {
              await api.cancelPayment(paymentReturnOrder.id);
              setPaymentReturnOrder(await api.order(paymentReturnOrder.id));
            } catch (cause) {
              setError(cause instanceof ApiError ? cause.message : "Không thể hủy đơn hàng.");
            } finally { setBusy(false); }
          }} className="mt-2 w-full py-3 rounded-2xl border border-border font-semibold disabled:opacity-50">{busy ? "Đang hủy…" : "Hủy đơn hàng"}</button>
        </>}
        {error && paymentReturnOrder && <p role="alert" className="mt-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
        <Link to="/home" className="mt-3 block py-3 rounded-2xl bg-cream font-semibold">Về trang chủ</Link>
      </div></div> : !order ? <form onSubmit={submit} className="px-5 space-y-4 pb-8">
        {cart.items.length === 0 ? <div className="mt-6 bg-white rounded-2xl p-6 text-center border border-border"><p className="font-semibold">Giỏ hàng đang trống</p><Link to="/shop" className="inline-block mt-3 text-primary font-semibold">Chọn trái cây</Link></div> : <>
          <div className="rounded-xl bg-cream px-3 py-2 text-xs font-semibold">Cửa hàng: {cart.items[0].shopName}</div>
          <div className="space-y-3">{cart.items.map((item) => <div key={item.productId} className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border"><ProductThumb emoji={item.emoji} imageUrl={item.imageUrl} alt={item.displayName} size="md" /><div className="flex-1 min-w-0"><h4 className="font-bold text-sm truncate">{item.displayName}</h4><p className="text-[11px] text-muted-foreground">{item.pricePerKg.toLocaleString("vi-VN")}đ/kg</p><p className="text-sm font-extrabold text-primary mt-0.5">{Math.round(item.pricePerKg * item.quantityKg).toLocaleString("vi-VN")}đ</p></div><div className="flex flex-col items-end gap-2"><div className="flex items-center gap-1 bg-cream rounded-full p-1"><button type="button" onClick={() => cart.setQuantity(item.productId, item.quantityKg - 0.5)} className="h-7 w-7 grid place-items-center rounded-full bg-white border border-border"><Minus className="h-3 w-3" /></button><span className="min-w-12 text-center text-xs font-semibold">{item.quantityKg} kg</span><button type="button" disabled={item.quantityKg >= item.stockKg} onClick={() => cart.setQuantity(item.productId, item.quantityKg + 0.5)} className="h-7 w-7 grid place-items-center rounded-full gt-gradient text-white disabled:opacity-40"><Plus className="h-3 w-3" /></button></div><button type="button" onClick={() => cart.remove(item.productId)} className="text-muted-foreground hover:text-red-600" aria-label="Xóa sản phẩm"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Thông tin nhận hàng</div><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên người nhận" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><textarea required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Địa chỉ giao hàng" rows={2} className="w-full rounded-xl border border-border px-3 py-2 text-sm" /></div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3"><p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
            <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-green-600" /><span className="h-9 w-9 rounded-xl gt-gradient text-white grid place-items-center"><Banknote className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">Thanh toán khi nhận hàng</span><span className="block text-[11px] text-muted-foreground">Thanh toán tiền mặt khi nhận được hàng.</span></span></label>
            {payosEnabled ? <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${paymentMethod === "PAYOS" ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" name="paymentMethod" value="PAYOS" checked={paymentMethod === "PAYOS"} onChange={() => setPaymentMethod("PAYOS")} className="accent-green-600" /><span className="h-9 w-9 rounded-xl bg-cream text-primary grid place-items-center"><QrCode className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">Thanh toán qua PayOS</span><span className="block text-[11px] text-muted-foreground">Thanh toán cho Golden Time; sàn sẽ đối soát và trả tiền cho cửa hàng.</span></span></label>
              : <p className="rounded-xl bg-cream px-3 py-2 text-[11px] text-muted-foreground">PayOS của sàn chưa được cấu hình. Hiện có thể thanh toán COD.</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span className="font-semibold">{cart.subtotal.toLocaleString("vi-VN")}đ</span></div><div className="flex justify-between"><span className="text-muted-foreground">Phí giao hàng</span><span className="font-semibold">{shipping.toLocaleString("vi-VN")}đ</span></div><div className="border-t border-border pt-2 flex justify-between"><span className="font-bold">Tổng cộng</span><span className="font-extrabold text-primary text-lg">{(cart.subtotal + shipping).toLocaleString("vi-VN")}đ</span></div></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
          <button disabled={busy || cart.items.length === 0} className="w-full py-4 rounded-2xl gt-gradient text-white font-bold gt-shadow disabled:opacity-50">{busy ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tạo đơn…</span> : paymentMethod === "PAYOS" ? "Thanh toán qua PayOS" : "Đặt hàng COD"}</button>
        </>}
      </form> : <div className="px-5 mt-10"><div className="bg-white rounded-3xl p-6 text-center border border-border"><div className="h-16 w-16 mx-auto rounded-full gt-gradient grid place-items-center text-white gt-shadow"><CheckCircle2 className="h-8 w-8" /></div><h3 className="font-extrabold text-lg mt-3">Đặt hàng thành công 🎉</h3><p className="text-sm text-muted-foreground mt-1">Đơn hàng #{order.id} • {order.shopName}</p><p className="font-bold text-primary mt-2">{order.total.toLocaleString("vi-VN")}đ</p><Link to="/map" className="mt-5 block py-3 rounded-2xl gt-gradient text-white font-semibold">Đánh giá cửa hàng</Link><Link to="/home" className="mt-2 block py-3 rounded-2xl bg-cream font-semibold">Về trang chủ</Link></div></div>}
    </PhoneShell>
  );
}
