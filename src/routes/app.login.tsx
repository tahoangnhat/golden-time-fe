import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { ApiError, api, logout } from "@/lib/api";

export const Route = createFileRoute("/app/login")({
  head: () => ({ meta: [{ title: "Đăng nhập — Golden Time" }] }),
  component: UserLogin,
});

function UserLogin() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let role: string;
      if (isRegistering) {
        role = (await api.register({ email: identifier.trim(), fullName: fullName.trim(), password, phone: phone.trim() || undefined })).user.role;
      } else {
        role = (await api.login(identifier, password)).user.role;
      }
      if (role !== "USER") {
        await logout();
        throw new Error(role === "ADMIN"
          ? "Đây là tài khoản quản trị. Vui lòng đăng nhập tại Cổng quản trị."
          : "Đây là tài khoản doanh nghiệp. Vui lòng đăng nhập tại Cổng doanh nghiệp.");
      }
      nav({ to: "/home" });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Đăng nhập chưa thành công.");
    } finally {
      setBusy(false);
    }
  }
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

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isRegistering && <label className="block">
            <span className="text-xs font-semibold text-foreground/80">Họ và tên</span>
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required className="mt-1 w-full h-12 px-4 rounded-2xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30" />
          </label>}
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80">{isRegistering ? "Email" : "Số điện thoại hoặc email"}</span>
            <input
              type={isRegistering ? "email" : "text"}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
              className="mt-1 w-full h-12 px-4 rounded-2xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
            />
          </label>
          {isRegistering && <label className="block">
            <span className="text-xs font-semibold text-foreground/80">Số điện thoại (không bắt buộc)</span>
            <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className="mt-1 w-full h-12 px-4 rounded-2xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30" />
          </label>}
          <label className="block">
            <span className="text-xs font-semibold text-foreground/80">Mật khẩu</span>
            <div className="mt-1 relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
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
          <button
            type="submit"
            className="w-full h-12 rounded-2xl gt-gradient text-white font-bold gt-shadow"
          >
            {busy ? (isRegistering ? "Đang tạo tài khoản…" : "Đang đăng nhập…") : (isRegistering ? "Tạo tài khoản" : "Đăng nhập")}
          </button>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isRegistering ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(""); }} className="text-[oklch(0.45_0.17_145)] font-semibold">
            {isRegistering ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </p>

        <div className="mt-6 pt-4 border-t border-border text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cổng truy cập khác</p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">
            <Link to="/" className="px-3 py-1.5 rounded-full bg-cream font-semibold">Website</Link>
            <Link to="/business/login" className="px-3 py-1.5 rounded-full bg-cream font-semibold">Doanh nghiệp</Link>
          </div>
        </div>
        <div className="h-6" />
      </div>
    </PhoneShell>
  );
}
