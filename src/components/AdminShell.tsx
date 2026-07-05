import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  ScanLine,
  Apple,
  QrCode,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/admin/users", label: "Người dùng", icon: Users },
  { to: "/admin/shops", label: "Cửa hàng", icon: Store },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { to: "/admin/ai-scans", label: "Dữ liệu AI", icon: ScanLine },
  { to: "/admin/nutrition", label: "Dinh dưỡng", icon: Apple },
  { to: "/admin/traceability", label: "Truy xuất nguồn gốc", icon: QrCode },
  { to: "/admin/reviews", label: "Đánh giá", icon: Star },
  { to: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
  { to: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminShell({
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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.02_100)] text-foreground">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-border flex-col">
        <SidebarInner pathname={pathname} />
      </aside>

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
            <div className="hidden md:flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 py-2 rounded-xl w-80">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Tìm người dùng, cửa hàng, đơn hàng..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-9 w-9 rounded-full gt-gradient grid place-items-center text-white font-bold text-sm">
                AD
              </div>
              <div className="text-xs leading-tight">
                <p className="font-semibold">Nguyễn Quản Trị</p>
                <p className="text-muted-foreground">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
        <Link to="/admin/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="h-10 w-10 rounded-xl gt-gradient grid place-items-center text-white text-lg">
            🍊
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-sm">Golden Time</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Admin Portal
            </p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {ADMIN_NAV.map((item) => {
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
          to="/admin/login"
          onClick={onNavigate}
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
  trend,
  tone = "primary",
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  tone?: "primary" | "orange" | "yellow" | "neutral" | "blue";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones: Record<string, string> = {
    primary: "bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)]",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-[oklch(0.97_0.12_95)] text-[oklch(0.55_0.14_75)]",
    blue: "bg-blue-50 text-blue-600",
    neutral: "bg-muted text-foreground",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        {Icon && (
          <div className={`h-9 w-9 rounded-lg grid place-items-center ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold mt-3">{value}</p>
      <div className="flex items-center justify-between mt-1">
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        {trend && (
          <span className="text-[11px] font-semibold text-[oklch(0.55_0.18_145)]">
            {trend}
          </span>
        )}
      </div>
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
    "Đã duyệt": "bg-green-100 text-green-700",
    "Chờ duyệt": "bg-yellow-100 text-yellow-700",
    "Từ chối": "bg-red-100 text-red-700",
    "Đã khóa": "bg-red-100 text-red-700",
    "Hoạt động": "bg-green-100 text-green-700",
    "Tạm khóa": "bg-gray-200 text-gray-700",
    "Ẩn": "bg-gray-100 text-gray-600",
    "Sắp hết": "bg-yellow-100 text-yellow-700",
    "Hết hàng": "bg-red-100 text-red-700",
    "Còn hàng": "bg-green-100 text-green-700",
    "Đã xác minh": "bg-green-100 text-green-700",
    "Chưa xác minh": "bg-yellow-100 text-yellow-700",
    "Bị báo cáo": "bg-red-100 text-red-700",
    "Đã ẩn": "bg-gray-200 text-gray-700",
    "Thành công": "bg-green-100 text-green-700",
    "Báo cáo sai": "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
        map[status] ?? "bg-muted text-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-border gt-shadow-soft ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-bold text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function MiniBarChart({
  data,
  color = "oklch(0.62 0.17 145)",
  height = 140,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full flex items-end" style={{ height: height - 24 }}>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: `linear-gradient(180deg, ${color} 0%, color-mix(in oklab, ${color} 70%, white) 100%)`,
              }}
              title={`${d.value}`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniLineChart({
  data,
  color = "oklch(0.72 0.18 55)",
  height = 140,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const w = 100;
  const h = 100;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.value - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[calc(100%-20px)]">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill={color}
          opacity="0.15"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function AdminTable({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            {head}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-3 flex flex-wrap items-center gap-2 mb-4">
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto gt-shadow animate-in zoom-in-95 fade-in`}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}