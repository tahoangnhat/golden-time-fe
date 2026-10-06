import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  QrCode,
  Tag,
  Star,
  Store,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { api, logout, type ShopProfile } from "@/lib/api";

const NAV = [
  { to: "/business/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/business/products", label: "Sản phẩm", icon: Package },
  { to: "/business/orders", label: "Đơn hàng", icon: ShoppingBag },
  { to: "/business/inventory", label: "Tồn kho", icon: Boxes },
  { to: "/business/traceability", label: "Truy xuất nguồn gốc", icon: QrCode },
  { to: "/business/promotions", label: "Khuyến mãi", icon: Tag },
  { to: "/business/reviews", label: "Đánh giá", icon: Star },
  { to: "/business/profile", label: "Hồ sơ doanh nghiệp", icon: Store },
  { to: "/business/support", label: "Hỗ trợ", icon: LifeBuoy },
];

export function BusinessShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    let active = true;
    api.me().then(async (user) => {
      if (!active) return;
      if (user.role !== "SHOP_OWNER") {
        navigate({ to: user.role === "ADMIN" ? "/admin/dashboard" : "/home", replace: true });
        return;
      }
      try {
        const profile = await api.shopProfile();
        if (active) { setShop(profile); setAuthorized(true); }
      } catch {
        if (active) navigate({ to: "/business/login", replace: true });
      }
    }).catch(() => navigate({ to: "/business/login", replace: true }));
    return () => { active = false; };
  }, [navigate]);

  if (!authorized) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Đang xác thực tài khoản doanh nghiệp…</div>;

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.02_100)] text-foreground">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-border flex-col">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white flex flex-col animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarInner pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <button
              className="lg:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-muted"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base lg:text-lg font-extrabold truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 py-2 rounded-xl w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Tìm đơn, sản phẩm..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-muted">
              <Bell className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-9 w-9 rounded-full gt-gradient grid place-items-center text-white font-bold text-sm">
                {(shop?.name ?? "").split(/\s+/).slice(0, 2).map((word) => word[0]).join("") || "—"}
              </div>
              <div className="text-xs leading-tight">
                <p className="font-semibold">{shop?.name ?? "Chưa liên kết doanh nghiệp"}</p>
                <p className="text-muted-foreground">{shop?.status ?? "Tài khoản doanh nghiệp"}</p>
              </div>
            </div>
          </div>
          {actions && (
            <div className="px-4 lg:px-8 pb-3 flex flex-wrap gap-2">{actions}</div>
          )}
        </header>

        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-5 py-5 border-b border-border">
        <Link to="/business/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="h-10 w-10 rounded-xl gt-gradient grid place-items-center text-white text-lg">
            🍊
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-sm">Golden Time</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Golden Time Business
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "gt-gradient text-white gt-shadow"
                  : "text-foreground/70 hover:bg-[oklch(0.97_0.04_95)] hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link
          to="/business/login"
          onClick={() => { void logout(); onNavigate?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Link>
      </div>
    </>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "primary",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "orange" | "yellow" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones: Record<string, string> = {
    primary: "bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)]",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-[oklch(0.97_0.12_95)] text-[oklch(0.55_0.14_75)]",
    neutral: "bg-muted text-foreground",
  };
  return (
    <div className="bg-white rounded-2xl p-4 border border-border gt-shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {Icon && (
          <div className={`h-8 w-8 rounded-lg grid place-items-center ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold mt-2">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Chờ xác nhận": "bg-yellow-100 text-yellow-700",
    "Đang chuẩn bị": "bg-blue-100 text-blue-700",
    "Đang giao": "bg-orange-100 text-orange-700",
    "Hoàn tất": "bg-green-100 text-green-700",
    "Đã hủy": "bg-red-100 text-red-700",
    "Đang bán": "bg-green-100 text-green-700",
    "Ẩn": "bg-gray-100 text-gray-600",
    "Sắp hết": "bg-yellow-100 text-yellow-700",
    "Hết hàng": "bg-red-100 text-red-700",
    "Còn hàng": "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        map[status] ?? "bg-muted text-foreground"
      }`}
    >
      {status}
    </span>
  );
}
