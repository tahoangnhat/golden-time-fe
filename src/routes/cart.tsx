import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Wallet, Banknote, CreditCard, Minus, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Giỏ hàng — Golden Time" }] }),
  component: Cart,
});

function Cart() {
  const [qty, setQty] = useState<number[]>([1, 1]);
  const [pay, setPay] = useState<"cod" | "wallet" | "card">("wallet");
  const [done, setDone] = useState(false);

  const items = [
    { emoji: "🍎", name: "Táo Fuji", store: "Bách Hóa Xanh", price: 49000 },
    { emoji: "🥭", name: "Xoài cát Hòa Lộc", store: "GrabMart", price: 49000 },
  ];
  const subtotal = items.reduce((s, it, i) => s + it.price * qty[i], 0);
  const ship = 15000;
  const total = subtotal + ship;

  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/shop" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-sm">Giỏ hàng & Thanh toán</span>
        <span className="w-9" />
      </div>

      <div className="px-5 space-y-4 pb-32">
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={it.name} className="bg-white rounded-2xl p-3 flex items-center gap-3 gt-shadow-soft border border-border">
              <FruitThumb emoji={it.emoji} size="md" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{it.name}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{it.store}</p>
                <p className="text-sm font-extrabold text-primary mt-0.5">{(it.price * qty[i]).toLocaleString("vi-VN")}đ</p>
              </div>
              <div className="flex items-center gap-1 bg-cream rounded-full p-1">
                <button onClick={() => setQty(q => q.map((v, j) => j === i ? Math.max(1, v - 1) : v))} className="h-7 w-7 grid place-items-center rounded-full bg-white border border-border"><Minus className="h-3 w-3" /></button>
                <span className="w-5 text-center text-sm font-semibold">{qty[i]}</span>
                <button onClick={() => setQty(q => q.map((v, j) => j === i ? v + 1 : v))} className="h-7 w-7 grid place-items-center rounded-full gt-gradient text-white"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Địa chỉ giao hàng</div>
          <p className="font-semibold text-sm mt-1">Nguyễn Văn A • 0901 234 567</p>
          <p className="text-[12px] text-muted-foreground">123 Lê Lợi, P. Bến Nghé, Q.1, TP. HCM</p>
          <button className="text-[11px] text-primary font-semibold mt-1">Đổi địa chỉ</button>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2">Phương thức thanh toán</h3>
          <div className="space-y-2">
            {([
              { id: "wallet", label: "Ví điện tử", icon: Wallet, desc: "Momo, ZaloPay, ShopeePay" },
              { id: "card", label: "Thẻ ngân hàng", icon: CreditCard, desc: "Visa, Mastercard, JCB" },
              { id: "cod", label: "COD", icon: Banknote, desc: "Thanh toán khi nhận hàng" },
            ] as const).map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => setPay(id)} className={`w-full text-left bg-white rounded-2xl p-3 flex items-center gap-3 border-2 transition-colors ${pay === id ? "border-primary" : "border-border"}`}>
                <span className={`h-10 w-10 rounded-xl grid place-items-center ${pay === id ? "gt-gradient text-white" : "bg-cream text-foreground"}`}><Icon className="h-4 w-4" /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
                <span className={`h-4 w-4 rounded-full border-2 ${pay === id ? "border-primary bg-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span className="font-semibold">{subtotal.toLocaleString("vi-VN")}đ</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Phí giao hàng</span><span className="font-semibold">{ship.toLocaleString("vi-VN")}đ</span></div>
          <div className="border-t border-border pt-2 flex justify-between"><span className="font-bold">Tổng cộng</span><span className="font-extrabold text-primary text-lg">{total.toLocaleString("vi-VN")}đ</span></div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-border p-4">
        <button onClick={() => setDone(true)} className="w-full py-4 rounded-2xl gt-gradient text-white font-bold gt-shadow">Đặt hàng</button>
      </div>

      {done && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm grid place-items-center p-6 z-10">
          <div className="bg-white rounded-3xl p-6 text-center w-full">
            <div className="h-16 w-16 mx-auto rounded-full gt-gradient grid place-items-center text-white gt-shadow">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-lg mt-3">Đặt hàng thành công 🎉</h3>
            <p className="text-sm text-muted-foreground mt-1">Đơn hàng của bạn đang được chuẩn bị.</p>
            <Link to="/home" className="mt-5 block py-3 rounded-2xl gt-gradient text-white font-semibold">Về trang chủ</Link>
            <button onClick={() => setDone(false)} className="mt-2 text-xs text-muted-foreground">Đóng</button>
          </div>
        </div>
      )}
    </PhoneShell>
  );
}