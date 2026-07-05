import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";

export const Route = createFileRoute("/app/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — Golden Time" }] }),
  component: UserLogin,
});

function UserLogin() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  return (
    <PhoneShell hideNav>
      <StatusBar title="Đăng nhập" />
      <div className="px-6 pt-4">
        <div className="mt-2 rounded-3xl gt-gradient text-white p-6 gt-shadow relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-25">🍎</div>
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-[10px] font-semibold">
              <Sparkles className="h-3 w-3" /> AI Fruit Intelligence
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight">Chào mừng đến với<br />Golden Time</h1>
            <p className="text-xs text-white/85 mt-1">Chọn trái cây thông minh cùng AI.</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/home" });
          }}
          className="mt-6 space-y-4"
        >
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80">Số điện thoại hoặc email</span>
            <input
              type="text"
              defaultValue="0912 345 678"
              className="mt-1 w-full h-12 px-4 rounded-2xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80">Mật khẩu</span>
            <div className="mt-1 relative">
              <input
                type={show ? "text" : "password"}
                defaultValue="goldentime"
                className="w-full h-12 px-4 pr-10 rounded-2xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[oklch(0.62_0.17_145)]" />
              Ghi nhớ đăng nhập
            </label>
            <a className="text-[oklch(0.45_0.17_145)] font-semibold">Quên mật khẩu?</a>
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-2xl gt-gradient text-white font-bold gt-shadow"
          >
            Đăng nhập
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> hoặc đăng nhập bằng <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Google", "Facebook", "Apple"].map((p) => (
            <button key={p} className="h-11 rounded-2xl bg-white border border-border text-xs font-semibold">
              {p}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Chưa có tài khoản?{" "}
          <button onClick={() => nav({ to: "/home" })} className="text-[oklch(0.45_0.17_145)] font-semibold">
            Đăng ký ngay
          </button>
        </p>

        <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cổng truy cập khác</p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">
            <Link to="/" className="px-3 py-1.5 rounded-full bg-cream font-semibold">Website</Link>
            <Link to="/shop/login" className="px-3 py-1.5 rounded-full bg-cream font-semibold">Cửa hàng</Link>
            <Link to="/admin/login" className="px-3 py-1.5 rounded-full bg-cream font-semibold">Admin</Link>
          </div>
        </div>
        <div className="h-6" />
      </div>
    </PhoneShell>
  );
}