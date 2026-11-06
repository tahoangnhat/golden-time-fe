import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Banknote, QrCode, Minus, Plus, Trash2, CheckCircle2, LoaderCircle, UserRound, Tag, Ticket, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { ProductThumb } from "@/components/FruitThumb";
import { ApiError, api, hasAuth, userStorageKey, type GhnAddress, type OrderDetail, type GhnShippingQuote, type ApplicableVoucherItem } from "@/lib/api";
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
  const [usingMyInfo, setUsingMyInfo] = useState(false);
  const [recipientInfoNotice, setRecipientInfoNotice] = useState("");
  const [ghnProvinces, setGhnProvinces] = useState<GhnAddress[]>([]);
  const [ghnWards, setGhnWards] = useState<GhnAddress[]>([]);
  const [deliveryProvinceName, setDeliveryProvinceName] = useState("");
  const [deliveryWardName, setDeliveryWardName] = useState("");
  const [shippingQuote, setShippingQuote] = useState<GhnShippingQuote | null>(null);
  const [shippingQuoteError, setShippingQuoteError] = useState("");
  const [loadingShippingQuote, setLoadingShippingQuote] = useState(false);
  const quoteRequestId = useRef(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "PAYOS">("COD");
  const [payosEnabled, setPayosEnabled] = useState(false);
  const [paymentReturnMode, setPaymentReturnMode] = useState("");
  const [paymentReturnOrder, setPaymentReturnOrder] = useState<OrderDetail | null>(null);
  const [applicableVouchers, setApplicableVouchers] = useState<ApplicableVoucherItem[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<ApplicableVoucherItem | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const shipping = shippingQuote?.shippingFee ?? 0;
  const discount = selectedVoucher ? selectedVoucher.estimatedDiscount : 0;
  const netSubtotal = Math.max(0, cart.subtotal - discount);
  const totalPayable = shippingQuote ? netSubtotal + shipping : 0;
  const paymentWasCancelledOnPayOS = paymentReturnMode.toUpperCase() === "CANCELLED" || paymentReturnMode.toLowerCase() === "cancelled";

  const shopId = cart.items[0]?.shopId;
  useEffect(() => {
    if (!hasAuth() || !shopId || cart.items.length === 0) {
      setApplicableVouchers([]);
      setSelectedVoucher(null);
      return;
    }
    let active = true;
    setLoadingVouchers(true);
    api.buyerApplicableVouchers(shopId, cart.subtotal)
      .then((items) => {
        if (!active) return;
        setApplicableVouchers(items);
        setSelectedVoucher((curr) => {
          if (!curr) return null;
          const match = items.find((v) => v.buyerVoucherId === curr.buyerVoucherId);
          return match && match.applicable ? match : null;
        });
      })
      .catch(() => {
        if (active) setApplicableVouchers([]);
      })
      .finally(() => {
        if (active) setLoadingVouchers(false);
      });
    return () => { active = false; };
  }, [shopId, cart.subtotal]);

  async function useMyInfo() {
    setUsingMyInfo(true);
    setRecipientInfoNotice("");
    try {
      const user = await api.me();
      setName(user.fullName.trim());
      if (user.phone?.trim()) {
        setPhone(user.phone.trim());
        setRecipientInfoNotice("Đã điền họ tên và số điện thoại từ tài khoản của bạn.");
      } else {
        setRecipientInfoNotice("Đã điền họ tên. Tài khoản chưa có số điện thoại; vui lòng nhập số nhận hàng bên dưới.");
      }
    } catch (cause) {
      setRecipientInfoNotice(cause instanceof Error ? cause.message : "Không lấy được thông tin tài khoản.");
    } finally {
      setUsingMyInfo(false);
    }
  }

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
    if (!hasAuth()) return;
    let active = true;
    api.ghnProvinces().then((items) => { if (active) setGhnProvinces(items); })
      .catch((cause) => { if (active) setShippingQuoteError(cause instanceof Error ? cause.message : "Không tải được danh mục địa chỉ GHN."); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const province = ghnProvinces.find((item) => item.name === deliveryProvinceName);
    setGhnWards([]);
    setDeliveryWardName((current) => current && !province ? "" : current);
    if (!province) return;
    api.ghnWards(province.id).then((items) => { if (active) setGhnWards(items); })
      .catch((cause) => { if (active) setShippingQuoteError(cause instanceof Error ? cause.message : "Không tải được phường/xã GHN."); });
    return () => { active = false; };
  }, [ghnProvinces, deliveryProvinceName]);

  useEffect(() => {
    const requestId = ++quoteRequestId.current;
    const ready = hasAuth() && cart.items.length > 0 && name.trim().length > 0 && phone.trim().length >= 9
      && address.trim().length >= 3 && deliveryProvinceName && deliveryWardName;
    setShippingQuote(null);
    setShippingQuoteError("");
    if (!ready) {
      setLoadingShippingQuote(false);
      return;
    }
    setLoadingShippingQuote(true);
    let active = true;
    const timer = window.setTimeout(() => {
      api.ghnQuote({
        items: cart.items.map((item) => ({ productId: item.productId, quantityKg: item.quantityKg })),
        paymentMethod, deliveryName: name.trim(), deliveryPhone: phone.trim(), deliveryAddress: address.trim(),
        deliveryProvinceName, deliveryWardName,
      }).then((quote) => { if (active && requestId === quoteRequestId.current) setShippingQuote(quote); }).catch((cause) => {
        if (active && requestId === quoteRequestId.current) {
          const message = cause instanceof Error ? cause.message : "Không tính được phí giao GHN.";
          setShippingQuoteError(
            /master_data_validate_phone|PHONE_INVALID/i.test(message)
              ? "Số điện thoại lấy hàng của cửa hàng chưa hợp lệ. Cửa hàng cần cập nhật số điện thoại trong Hồ sơ doanh nghiệp để GHN báo phí."
              : /Cửa hàng cần bổ sung/i.test(message)
              ? "Cửa hàng chưa hoàn tất cấu hình địa chỉ lấy hàng GHN (tỉnh/phường hoặc SĐT trong Hồ sơ cửa hàng) nên chưa thể tính phí giao hàng. Vui lòng liên hệ cửa hàng hoặc thử lại sau."
              : message
          );
        }
      }).finally(() => { if (active && requestId === quoteRequestId.current) setLoadingShippingQuote(false); });
    }, 500);
    return () => { active = false; window.clearTimeout(timer); };
  }, [cart.items, name, phone, address, deliveryProvinceName, deliveryWardName, paymentMethod]);

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
      if (!shippingQuote || loadingShippingQuote) throw new Error("Vui lòng chờ GHN tính phí giao hàng trước khi đặt đơn.");
      const created = await api.createOrder({
        items: cart.items.map((item) => ({ productId: item.productId, quantityKg: item.quantityKg })),
        paymentMethod,
        deliveryName: name,
        deliveryPhone: phone,
        deliveryAddress: address,
        deliveryProvinceName,
        deliveryWardName,
        buyerVoucherId: selectedVoucher ? selectedVoucher.buyerVoucherId : undefined,
      });
      window.localStorage.setItem(userStorageKey("golden-time-order-proof"), JSON.stringify({ orderId: created.id, shopId: created.shopId, shopName: created.shopName }));
      cart.clear();
      if (paymentMethod === "PAYOS") {
        if (!created.checkoutUrl) throw new Error("PayOS chưa trả về link thanh toán cho đơn hàng.");
        window.location.assign(created.checkoutUrl);
        return;
      }
      setOrder(created);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tạo được đơn hàng.");
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
          <div className="space-y-3">{cart.items.map((item) => <div key={item.productId} className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border"><ProductThumb emoji={item.emoji} imageUrl={item.imageUrl} alt={item.displayName} size="md" /><div className="flex-1 min-w-0"><h4 className="font-bold text-sm truncate">{item.displayName}</h4><p className="text-[11px] text-muted-foreground">{item.pricePerKg.toLocaleString("vi-VN")}đ/kg</p><p className="text-sm font-extrabold text-primary mt-0.5">{Math.round(item.pricePerKg * item.quantityKg).toLocaleString("vi-VN")}đ</p></div><div className="flex flex-col items-end gap-2"><div className="flex items-center gap-1 bg-cream rounded-full p-1"><button type="button" disabled={item.quantityKg <= 0.5} onClick={() => cart.setQuantity(item.productId, item.quantityKg - 0.5)} className="h-7 w-7 grid place-items-center rounded-full bg-white border border-border disabled:opacity-40" aria-label="Giảm 0,5 kg"><Minus className="h-3 w-3" /></button><span className="min-w-16 text-center text-xs font-semibold leading-tight">{item.quantityKg} kg<span className="block text-[9px] text-muted-foreground font-normal">{Math.round(item.quantityKg / 0.5)} phần</span></span><button type="button" disabled={item.quantityKg >= item.stockKg} onClick={() => cart.setQuantity(item.productId, item.quantityKg + 0.5)} className="h-7 w-7 grid place-items-center rounded-full gt-gradient text-white disabled:opacity-40" aria-label="Tăng 0,5 kg"><Plus className="h-3 w-3" /></button></div><button type="button" onClick={() => cart.remove(item.productId)} className="text-muted-foreground hover:text-red-600" aria-label="Xóa sản phẩm"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Thông tin nhận hàng</div><button type="button" onClick={() => void useMyInfo()} disabled={usingMyInfo} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[10px] font-semibold text-primary disabled:opacity-60">{usingMyInfo ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <UserRound className="h-3 w-3" />}{usingMyInfo ? "Đang lấy…" : "Tôi là người nhận"}</button></div>{recipientInfoNotice && <p role="status" className="rounded-lg bg-cream px-3 py-2 text-[11px] text-foreground/80">{recipientInfoNotice}</p>}<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên người nhận" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><textarea required maxLength={400} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Số nhà, tên đường" rows={2} className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><div className="grid grid-cols-2 gap-2"><select required value={deliveryProvinceName} onChange={(event) => { setDeliveryProvinceName(event.target.value); setDeliveryWardName(""); }} disabled={!ghnProvinces.length} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"><option value="">Tỉnh/thành</option>{ghnProvinces.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select><select required value={deliveryWardName} onChange={(event) => setDeliveryWardName(event.target.value)} disabled={!ghnWards.length} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"><option value="">Phường/xã</option>{ghnWards.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></div>{shippingQuoteError && <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{shippingQuoteError}</p>}</div>
          {/* Voucher Section */}
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Tag className="h-4 w-4 text-primary" /> Mã giảm giá của Shop
              </div>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                {selectedVoucher ? "Đổi mã" : "Chọn mã"}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {selectedVoucher ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="min-w-0 pr-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedVoucher.code}
                  </span>
                  <p className="text-xs font-bold mt-1 text-foreground truncate">{selectedVoucher.name}</p>
                  <p className="text-[11px] text-primary font-semibold mt-0.5">
                    Giảm {selectedVoucher.estimatedDiscount.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-red-500 font-medium px-2 py-1"
                >
                  Bỏ chọn
                </button>
              </div>
            ) : (
              <div
                onClick={() => setVoucherModalOpen(true)}
                className="cursor-pointer p-3 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground flex items-center justify-between"
              >
                <span>
                  {loadingVouchers
                    ? "Đang tìm voucher khả dụng…"
                    : applicableVouchers.filter((v) => v.applicable).length > 0
                    ? `Có ${applicableVouchers.filter((v) => v.applicable).length} voucher khả dụng cho đơn này`
                    : "Chưa áp dụng voucher nào"}
                </span>
                <span className="text-primary font-semibold">Chọn ngay</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3"><p className="text-xs text-muted-foreground">Phương thức thanh toán</p>
            <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-green-600" /><span className="h-9 w-9 rounded-xl gt-gradient text-white grid place-items-center"><Banknote className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">Thanh toán khi nhận hàng</span><span className="block text-[11px] text-muted-foreground">Thanh toán tiền mặt khi nhận được hàng.</span></span></label>
            {payosEnabled ? <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${paymentMethod === "PAYOS" ? "border-primary bg-primary/5" : "border-border"}`}><input type="radio" name="paymentMethod" value="PAYOS" checked={paymentMethod === "PAYOS"} onChange={() => setPaymentMethod("PAYOS")} className="accent-green-600" /><span className="h-9 w-9 rounded-xl bg-cream text-primary grid place-items-center"><QrCode className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">Thanh toán qua PayOS</span><span className="block text-[11px] text-muted-foreground">Thanh toán cho Golden Time; sàn sẽ đối soát và trả tiền cho cửa hàng.</span></span></label>
              : <p className="rounded-xl bg-cream px-3 py-2 text-[11px] text-muted-foreground">PayOS của sàn chưa được cấu hình. Hiện có thể thanh toán COD.</p>}
          </div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span className="font-semibold">{cart.subtotal.toLocaleString("vi-VN")}đ</span></div>{discount > 0 && <div className="flex justify-between text-green-600 font-semibold"><span>Giảm giá voucher</span><span>-{discount.toLocaleString("vi-VN")}đ</span></div>}<div className="flex justify-between"><span className="text-muted-foreground">Phí giao GHN</span><span className="font-semibold">{loadingShippingQuote ? "Đang tính…" : shippingQuote ? `${shipping.toLocaleString("vi-VN")}đ` : "Chọn địa chỉ nhận hàng"}</span></div>{shippingQuote?.expectedDeliveryAt && <p className="text-right text-xs text-muted-foreground">Dự kiến: {new Date(shippingQuote.expectedDeliveryAt).toLocaleString("vi-VN")}</p>}<div className="border-t border-border pt-2 flex justify-between"><span className="font-bold">Tổng cộng</span><span className="font-extrabold text-primary text-lg">{shippingQuote ? `${totalPayable.toLocaleString("vi-VN")}đ` : "—"}</span></div></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
          <button disabled={busy || cart.items.length === 0 || !shippingQuote || loadingShippingQuote} className="w-full py-4 rounded-2xl gt-gradient text-white font-bold gt-shadow disabled:opacity-50">{busy ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tạo đơn…</span> : loadingShippingQuote ? "Đang tính phí GHN…" : paymentMethod === "PAYOS" ? "Thanh toán qua PayOS" : "Đặt hàng COD"}</button>
        </>}
      </form> : <div className="px-5 mt-10"><div className="bg-white rounded-3xl p-6 text-center border border-border"><div className="h-16 w-16 mx-auto rounded-full gt-gradient grid place-items-center text-white gt-shadow"><CheckCircle2 className="h-8 w-8" /></div><h3 className="font-extrabold text-lg mt-3">Đặt hàng thành công 🎉</h3><p className="text-sm text-muted-foreground mt-1">Đơn hàng #{order.id} • {order.shopName}</p><p className="font-bold text-primary mt-2">{order.total.toLocaleString("vi-VN")}đ</p><Link to="/orders" className="mt-5 block py-3 rounded-2xl gt-gradient text-white font-semibold">Theo dõi đơn hàng</Link><Link to="/home" className="mt-2 block py-3 rounded-2xl bg-cream font-semibold">Về trang chủ</Link></div></div>}
      {voucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col gt-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-base">Chọn Voucher của Shop</h3>
              </div>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="h-8 w-8 rounded-full grid place-items-center bg-cream hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {loadingVouchers ? (
                <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải voucher…
                </div>
              ) : applicableVouchers.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <Ticket className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">Bạn chưa có voucher nào của cửa hàng này trong ví.</p>
                  <Link
                    to="/vouchers"
                    onClick={() => setVoucherModalOpen(false)}
                    className="inline-block px-4 py-2 rounded-xl gt-gradient text-white text-xs font-semibold"
                  >
                    Khám phá & Lưu Voucher
                  </Link>
                </div>
              ) : (
                applicableVouchers.map((v) => {
                  const isSelected = selectedVoucher?.buyerVoucherId === v.buyerVoucherId;
                  return (
                    <div
                      key={v.buyerVoucherId}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        !v.applicable
                          ? "opacity-50 border-border bg-gray-50/70"
                          : isSelected
                          ? "border-primary bg-primary/5 gt-shadow-soft"
                          : "border-border bg-white hover:border-primary/40 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (v.applicable) {
                          setSelectedVoucher(isSelected ? null : v);
                          setVoucherModalOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold uppercase">
                              {v.code}
                            </span>
                            <span className="text-xs font-extrabold text-foreground truncate">{v.name}</span>
                          </div>
                          <p className="text-xs font-bold text-primary mt-1.5">
                            {v.discountType === "PERCENT"
                              ? `Giảm ${v.discountValue}% (tối đa ${v.maxDiscountAmount ? v.maxDiscountAmount.toLocaleString("vi-VN") + "đ" : "không giới hạn"})`
                              : `Giảm ${v.discountValue.toLocaleString("vi-VN")}đ`}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Đơn tối thiểu {v.minOrderValue.toLocaleString("vi-VN")}đ
                          </p>
                          {!v.applicable && v.reasonNotApplicable && (
                            <p className="text-[11px] text-red-600 font-medium mt-1">
                              • {v.reasonNotApplicable}
                            </p>
                          )}
                        </div>
                        {v.applicable && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVoucher(isSelected ? null : v);
                              setVoucherModalOpen(false);
                            }}
                            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                              isSelected
                                ? "bg-primary text-white"
                                : "border border-primary text-primary hover:bg-primary/10"
                            }`}
                          >
                            {isSelected ? "Đang chọn" : "Áp dụng"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-border bg-cream/50 flex items-center justify-between">
              <Link
                to="/vouchers"
                onClick={() => setVoucherModalOpen(false)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Khám phá thêm voucher <ChevronRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-border text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}
