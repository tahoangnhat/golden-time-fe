import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, History, Settings, LogOut, Save, UserRound, Phone, Mail, LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { api, clearAuth, hasAuth, logout, type UserProfile } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Cá nhân — Golden Time" }] }),
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  useEffect(() => {
    if (!hasAuth()) { setLoading(false); return; }
    api.me().then((profile) => {
      setUser(profile);
      setFullName(profile.fullName);
      setPhone(profile.phone ?? "");
    }).catch(() => clearAuth()).finally(() => setLoading(false));
    api.scans().then((items) => setScanCount(items.length)).catch(() => setScanCount(0));
    api.orders().then((items) => setOrderCount(items.length)).catch(() => setOrderCount(0));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const updated = await api.updateMe({ fullName: fullName.trim(), phone: phone.trim() || null });
      setUser(updated);
      setFullName(updated.fullName);
      setPhone(updated.phone ?? "");
      setSaveSuccess("Thông tin tài khoản đã được cập nhật.");
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Không thể cập nhật thông tin tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  const initials = user?.fullName.split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase() || "GT";
  const menu = [
    { icon: History, label: "Lịch sử mua hàng", value: `${orderCount} đơn` },
    { icon: Settings, label: "Cài đặt", value: "" },
  ];
  return (
    <PhoneShell>
      <StatusBar title={settingsOpen ? "Cài đặt tài khoản" : "Cá nhân"} />
      {settingsOpen ? (
        <div className="px-5 pb-6">
          <button type="button" onClick={() => { setSettingsOpen(false); setSaveError(""); setSaveSuccess(""); }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4" /> Quay lại hồ sơ
          </button>
          <form onSubmit={saveProfile} className="rounded-3xl border border-border bg-white p-5 gt-shadow-soft">
            <div className="mb-5">
              <h1 className="text-lg font-extrabold">Thông tin tài khoản</h1>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Cập nhật thông tin để dùng khi liên hệ và nhận đơn hàng.</p>
            </div>
            <label className="mb-4 block text-sm font-semibold">
              <span className="mb-1.5 flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /> Họ và tên</span>
              <input required maxLength={255} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-11 w-full rounded-xl border border-border px-3 font-normal outline-none focus:border-primary" placeholder="Nhập họ và tên" />
            </label>
            <label className="mb-2 block text-sm font-semibold">
              <span className="mb-1.5 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email đăng nhập</span>
              <input type="email" value={user?.email ?? ""} readOnly className="h-11 w-full rounded-xl border border-border bg-muted/50 px-3 font-normal text-muted-foreground" />
              <span className="mt-1.5 block text-[11px] font-normal text-muted-foreground">Email chưa thể thay đổi vì cần xác minh địa chỉ mới.</span>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              <span className="mb-1.5 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Số điện thoại</span>
              <input type="tel" maxLength={32} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 w-full rounded-xl border border-border px-3 font-normal outline-none focus:border-primary" placeholder="Nhập số điện thoại" />
            </label>
            {saveError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{saveError}</p>}
            {saveSuccess && <p role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">{saveSuccess}</p>}
            <button type="submit" disabled={saving || loading} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl gt-gradient text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </form>
        </div>
      ) : (
      <div className="px-5">
        <div className="rounded-3xl gt-gradient text-white p-5 gt-shadow relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-25">🍏</div>
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white text-foreground grid place-items-center text-2xl font-extrabold">{initials}</div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/80">Tài khoản Golden Time</p>
              <h2 className="font-extrabold text-xl">{loading ? "Đang tải…" : user?.fullName || "Khách"}</h2>
              <p className="text-xs text-white/85">{user?.email || "Dùng ứng dụng Golden Time để đồng bộ dữ liệu"}</p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/15 rounded-xl py-2"><p className="font-extrabold">{scanCount}</p><p className="text-[10px] opacity-80">Lần quét</p></div>
            <div className="bg-white/15 rounded-xl py-2"><p className="font-extrabold">{orderCount}</p><p className="text-[10px] opacity-80">Đơn hàng</p></div>
            <div className="bg-white/15 rounded-xl py-2"><p className="font-extrabold">—</p><p className="text-[10px] opacity-80">Trái cây/tuần</p></div>
          </div>
        </div>

        <div className="mt-5 bg-white rounded-2xl gt-shadow-soft border border-border divide-y divide-border">
          {menu.map(({ icon: Icon, label, value }) => (
            <button key={label} onClick={() => { if (label === "Lịch sử mua hàng") nav({ to: "/orders" }); else setSettingsOpen(true); }} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="h-9 w-9 rounded-xl bg-cream grid place-items-center text-primary"><Icon className="h-4 w-4" /></span>
              <span className="flex-1 font-semibold text-sm">{label}</span>
              <span className="text-xs text-muted-foreground">{value}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {user && <button onClick={() => { void logout(); nav({ to: "/" }); }} className="mt-4 w-full py-3 rounded-2xl bg-white border border-border font-semibold text-sm flex items-center justify-center gap-2 text-muted-foreground"><LogOut className="h-4 w-4" /> Đăng xuất</button>}
        <p className="text-center text-[11px] text-muted-foreground mt-3">Golden Time</p>
        <div className="h-4" />
      </div>
      )}
    </PhoneShell>
  );
}
