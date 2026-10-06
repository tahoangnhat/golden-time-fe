import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";
import { ApiError, api, logout } from "@/lib/api";

export const Route = createFileRoute("/business/login")({
  head: () => ({ meta: [{ title: "Đăng nhập doanh nghiệp — Golden Time" }] }),
  component: BusinessLogin,
});

function BusinessLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const auth = await api.login(identifier, password);
      if (auth.user.role !== "SHOP_OWNER") { await logout(); throw new Error("Tài khoản này không có quyền truy cập cổng doanh nghiệp."); }
      await api.shopProfile();
      navigate({ to: "/business/dashboard" });
    } catch (cause) {
      setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Đăng nhập chưa thành công.");
    } finally { setBusy(false); }
  }
  return <div className="min-h-screen grid lg:grid-cols-2 bg-[oklch(0.97_0.04_95)]">
    <div className="hidden lg:flex flex-col justify-between p-12 gt-gradient text-white"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center text-2xl">🍊</div><div><p className="font-extrabold text-lg">Golden Time</p><p className="text-xs uppercase tracking-widest opacity-80">Golden Time Business</p></div></div><div><h2 className="text-4xl font-extrabold leading-tight">Cổng quản lý doanh nghiệp</h2><p className="mt-4 text-white/85 max-w-md">Đăng nhập sau khi hồ sơ doanh nghiệp được Admin chấp nhận.</p></div><p className="text-xs opacity-70">Golden Time Business</p></div>
    <div className="flex items-center justify-center p-6 lg:p-12"><form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl gt-shadow-soft border border-border p-8">
      <div className="h-12 w-12 rounded-2xl bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] grid place-items-center mb-4"><Building2 className="h-6 w-6" /></div>
      <h1 className="text-2xl font-extrabold">Đăng nhập doanh nghiệp</h1><p className="text-sm text-muted-foreground mt-1">Chỉ doanh nghiệp đã được Admin chấp nhận mới có thể đăng nhập.</p>
      <div className="mt-6 space-y-4"><label className="block"><span className="text-xs font-semibold">Email hoặc số điện thoại</span><input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-white" /></label>
        <label className="block"><span className="text-xs font-semibold">Mật khẩu</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-1 w-full h-11 px-4 rounded-xl border border-border bg-white" /></label>
        <button disabled={busy} className="w-full h-11 rounded-xl gt-gradient text-white font-semibold gt-shadow disabled:opacity-50">{busy ? "Đang đăng nhập…" : "Đăng nhập doanh nghiệp"}</button>
        {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</p>}
      </div>
      <p className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">Chưa có tài khoản doanh nghiệp?</p>
      <Link to="/business/register" className="mt-3 block text-center font-semibold text-primary hover:underline">Gửi hồ sơ đăng ký doanh nghiệp</Link>
      <p className="mt-4 text-center text-xs text-muted-foreground">Tài khoản chỉ hoạt động sau khi Admin duyệt hồ sơ.</p>
    </form></div>
  </div>;
}
