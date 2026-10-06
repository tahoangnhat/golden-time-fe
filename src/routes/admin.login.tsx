import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { ApiError, api, logout } from "@/lib/api";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const auth = await api.login(email, password);
      if (auth.user.role !== "ADMIN") {
        await logout();
        throw new Error("Tài khoản này không có quyền quản trị.");
      }
      nav({ to: "/admin/dashboard" });
    } catch (cause) {
      setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Đăng nhập chưa thành công.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[oklch(0.98_0.02_100)]">
      <div className="hidden lg:flex flex-col justify-between p-12 gt-gradient text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center text-2xl">🍊</div>
            <div>
              <p className="font-extrabold text-lg">Golden Time</p>
              <p className="text-xs uppercase tracking-widest text-white/80">Admin Portal</p>
            </div>
          </div>
        </div>
        <div className="relative space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            Quản trị toàn bộ hệ sinh thái <br />trái cây thông minh
          </h2>
          <p className="text-white/85 max-w-md">
            Theo dõi người dùng, cửa hàng đối tác, đơn hàng, dữ liệu AI và báo cáo kinh doanh
            của Golden Time tại một nơi duy nhất.
          </p>
        </div>
        <p className="relative text-xs text-white/70">© 2026 Golden Time JSC</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] text-xs font-semibold">
              <Shield className="h-3.5 w-3.5" /> Truy cập nội bộ
            </div>
            <h1 className="text-3xl font-extrabold mt-3">Golden Time Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Đăng nhập để quản lý hệ thống.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Mật khẩu</span>
              <div className="mt-1 relative">
                <input
                  type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                  className="w-full h-11 px-3 pr-10 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full hover:bg-muted"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                Ghi nhớ phiên đăng nhập
              </label>
              <a className="text-[oklch(0.55_0.18_145)] font-semibold cursor-pointer">
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl gt-gradient text-white font-bold gt-shadow hover:opacity-95 transition"
          >
            {busy ? "Đang đăng nhập…" : "Đăng nhập Admin"}
          </button>
          {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}

          <p className="text-[11px] text-center text-muted-foreground">
            <Link to="/" className="text-[oklch(0.55_0.18_145)] font-semibold">
              Website
            </Link>
            {" • "}
            <Link to="/business/login" className="text-[oklch(0.55_0.18_145)] font-semibold">
              Doanh nghiệp
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
