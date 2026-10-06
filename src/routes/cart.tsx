import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Banknote, Minus, Plus, Trash2, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";
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
  const shipping = 15000;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.items.length === 0) return setError("Giỏ hàng đang trống.");
    if (!hasAuth()) return setError("Để đặt hàng, hãy đăng nhập trong ứng dụng Golden Time.");
    setBusy(true); setError("");
    try {
      const created = await api.createOrder({ items: cart.items.map((item) => ({ productId: item.productId, quantityKg: item.quantityKg })), paymentMethod: "COD", deliveryName: name, deliveryPhone: phone, deliveryAddress: address });
      setOrder(created);
      window.localStorage.setItem(userStorageKey("golden-time-order-proof"), JSON.stringify({ orderId: created.id, shopId: created.shopId, shopName: created.shopName }));
      cart.clear();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không tạo được đơn hàng.");
    } finally { setBusy(false); }
  }
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2"><Link to="/shop" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border"><ChevronLeft className="h-5 w-5" /></Link><span className="font-semibold text-sm">Giỏ hàng</span><span className="w-9" /></div>
      {!order ? <form onSubmit={submit} className="px-5 space-y-4 pb-8">
        {cart.items.length === 0 ? <div className="mt-6 bg-white rounded-2xl p-6 text-center border border-border"><p className="font-semibold">Giỏ hàng đang trống</p><Link to="/shop" className="inline-block mt-3 text-primary font-semibold">Chọn trái cây</Link></div> : <>
          <div className="rounded-xl bg-cream px-3 py-2 text-xs font-semibold">Cửa hàng: {cart.items[0].shopName}</div>
          <div className="space-y-3">{cart.items.map((item) => <div key={item.productId} className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border"><FruitThumb emoji={item.emoji} size="md" /><div className="flex-1 min-w-0"><h4 className="font-bold text-sm truncate">{item.displayName}</h4><p className="text-[11px] text-muted-foreground">{item.pricePerKg.toLocaleString("vi-VN")}đ/kg</p><p className="text-sm font-extrabold text-primary mt-0.5">{Math.round(item.pricePerKg * item.quantityKg).toLocaleString("vi-VN")}đ</p></div><div className="flex flex-col items-end gap-2"><div className="flex items-center gap-1 bg-cream rounded-full p-1"><button type="button" onClick={() => cart.setQuantity(item.productId, item.quantityKg - 0.5)} className="h-7 w-7 grid place-items-center rounded-full bg-white border border-border"><Minus className="h-3 w-3" /></button><span className="min-w-12 text-center text-xs font-semibold">{item.quantityKg} kg</span><button type="button" disabled={item.quantityKg >= item.stockKg} onClick={() => cart.setQuantity(item.productId, item.quantityKg + 0.5)} className="h-7 w-7 grid place-items-center rounded-full gt-gradient text-white disabled:opacity-40"><Plus className="h-3 w-3" /></button></div><button type="button" onClick={() => cart.remove(item.productId)} className="text-muted-foreground hover:text-red-600" aria-label="Xóa sản phẩm"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Thông tin nhận hàng</div><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên người nhận" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="w-full rounded-xl border border-border px-3 py-2 text-sm" /><textarea required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Địa chỉ giao hàng" rows={2} className="w-full rounded-xl border border-border px-3 py-2 text-sm" /></div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border"><div className="flex items-center gap-3"><span className="h-10 w-10 rounded-xl gt-gradient text-white grid place-items-center"><Banknote className="h-4 w-4" /></span><div><p className="text-sm font-semibold">Thanh toán khi nhận hàng</p><p className="text-[11px] text-muted-foreground">Đơn demo, chưa tích hợp cổng thanh toán.</p></div><span className="ml-auto h-4 w-4 rounded-full border-2 border-primary bg-primary" /></div></div>
          <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span className="font-semibold">{cart.subtotal.toLocaleString("vi-VN")}đ</span></div><div className="flex justify-between"><span className="text-muted-foreground">Phí giao hàng</span><span className="font-semibold">{shipping.toLocaleString("vi-VN")}đ</span></div><div className="border-t border-border pt-2 flex justify-between"><span className="font-bold">Tổng cộng</span><span className="font-extrabold text-primary text-lg">{(cart.subtotal + shipping).toLocaleString("vi-VN")}đ</span></div></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
          <button disabled={busy || cart.items.length === 0} className="w-full py-4 rounded-2xl gt-gradient text-white font-bold gt-shadow disabled:opacity-50">{busy ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tạo đơn…</span> : "Đặt hàng demo"}</button>
        </>}
      </form> : <div className="px-5 mt-10"><div className="bg-white rounded-3xl p-6 text-center border border-border"><div className="h-16 w-16 mx-auto rounded-full gt-gradient grid place-items-center text-white gt-shadow"><CheckCircle2 className="h-8 w-8" /></div><h3 className="font-extrabold text-lg mt-3">Đặt hàng thành công 🎉</h3><p className="text-sm text-muted-foreground mt-1">Đơn demo #{order.id} • {order.shopName}</p><p className="font-bold text-primary mt-2">{order.total.toLocaleString("vi-VN")}đ</p><Link to="/map" className="mt-5 block py-3 rounded-2xl gt-gradient text-white font-semibold">Đánh giá cửa hàng</Link><Link to="/home" className="mt-2 block py-3 rounded-2xl bg-cream font-semibold">Về trang chủ</Link></div></div>}
    </PhoneShell>
  );
}
