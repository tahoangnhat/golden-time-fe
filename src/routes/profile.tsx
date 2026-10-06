import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Heart, Store, History, Settings, LogOut, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { api, clearAuth, hasAuth, logout, type UserProfile } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Cá nhân — Golden Time" }] }),
  component: Profile,
});

const goals = ["Sống khỏe", "Eat Clean", "Tập gym", "Giảm cân"];

function Profile() {
  const nav = useNavigate();
  const [goal, setGoal] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!hasAuth()) { setLoading(false); return; }
    api.me().then(setUser).catch(() => clearAuth());
    api.scans().then((items) => setScanCount(items.length)).catch(() => setScanCount(0));
    api.orders().then((items) => setOrderCount(items.length)).catch(() => setOrderCount(0));
    setLoading(false);
  }, []);
  const initials = user?.fullName.split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase() || "GT";
  const menu = [
    { icon: Heart, label: "Trái cây yêu thích", value: "Sắp có" },
    { icon: Store, label: "Cửa hàng yêu thích", value: "Sắp có" },
    { icon: History, label: "Lịch sử mua hàng", value: `${orderCount} đơn` },
    { icon: Settings, label: "Cài đặt", value: "" },
  ];
  return (
    <PhoneShell>
      <StatusBar title="Cá nhân" />
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

        <h3 className="mt-5 font-bold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Mục tiêu sức khỏe</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {goals.map((g) => (
              <button key={g} onClick={() => setGoal(g)} className={`py-3 rounded-2xl text-sm font-semibold border-2 transition-colors ${goal === g ? "gt-gradient text-white border-transparent gt-shadow" : "bg-white border-border text-foreground"}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="mt-5 bg-white rounded-2xl gt-shadow-soft border border-border divide-y divide-border">
          {menu.map(({ icon: Icon, label, value }) => (
            <button key={label} className="w-full flex items-center gap-3 p-4 text-left">
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
    </PhoneShell>
  );
}
