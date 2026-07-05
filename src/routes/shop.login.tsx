import { createFileRoute, Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export const Route = createFileRoute("/shop/login")({
  head: () => ({ meta: [{ title: "Đăng nhập đối tác — Golden Time" }] }),
  component: ShopLogin,
});

function ShopLogin() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[oklch(0.97_0.04_95)]">
      <div className="hidden lg:flex flex-col justify-between p-12 gt-gradient text-white">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center text-2xl">🍊</div>
          <div>
            <p className="font-extrabold text-lg">Golden Time</p>
            <p className="text-xs uppercase tracking-widest opacity-80">Partner Shop</p>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Quản lý cửa hàng trái cây <br />của bạn thông minh hơn
          </h2>
          <p className="mt-4 text-white/85 max-w-md">
            Hệ thống quản lý đơn hàng, tồn kho, đánh giá và truy xuất nguồn gốc dành riêng cho đối tác Golden Time.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            <li>✓ Tiếp cận hơn 250.000 khách hàng yêu trái cây sạch</li>
            <li>✓ AI đánh giá chất lượng sản phẩm tự động</li>
            <li>✓ Báo cáo doanh thu chi tiết theo ngày</li>
          </ul>
        </div>
        <p className="text-xs opacity-70">© 2026 Golden Time JSC.</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl gt-shadow-soft border border-border p-8">
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <div className="h-10 w-10 rounded-xl gt-gradient grid place-items-center text-white text-lg">🍊</div>
            <div className="leading-tight">
              <p className="font-extrabold">Golden Time</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Partner Shop</p>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] grid place-items-center mb-4">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold">Đăng nhập cửa hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chào mừng trở lại với Golden Time Partner Shop.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground/80">Email hoặc số điện thoại</label>
              <input
                type="text"
                defaultValue="traicaytuoi@gmail.com"
                className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/80">Mật khẩu</label>
              <input
                type="password"
                defaultValue="••••••••"
                className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[oklch(0.62_0.17_145)]" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-[oklch(0.45_0.17_145)] font-semibold">Quên mật khẩu?</a>
            </div>
            <Link
              to="/shop/dashboard"
              className="block text-center w-full h-11 leading-[44px] rounded-xl gt-gradient text-white font-semibold gt-shadow"
            >
              Đăng nhập cửa hàng
            </Link>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm">
            Chưa có cửa hàng trên Golden Time?{" "}
            <a href="#" className="text-orange-600 font-semibold">Đăng ký trở thành đối tác</a>
          </div>
        </div>
      </div>
    </div>
  );
}