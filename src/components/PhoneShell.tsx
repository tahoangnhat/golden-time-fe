import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, ScanLine, ShoppingBag, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, hasAuth } from "@/lib/api";

const tabs = [
  { to: "/home", label: "Trang chủ", icon: Home },
  { to: "/scan", label: "Quét AI", icon: ScanLine },
  { to: "/shop", label: "Mua hàng", icon: ShoppingBag },
  { to: "/map", label: "Bản đồ", icon: MapPin },
  { to: "/profile", label: "Cá nhân", icon: User },
] as const;

export function PhoneShell({
  children,
  hideNav = false,
  bg = "bg-cream",
}: {
  children: ReactNode;
  hideNav?: boolean;
  bg?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [checkingRole, setCheckingRole] = useState(() => hasAuth());
  useEffect(() => {
    let active = true;
    if (!hasAuth()) {
      setCheckingRole(false);
      return () => { active = false; };
    }
    api.me().then((user) => {
      if (!active) return;
      if (user.role === "ADMIN") navigate({ to: "/admin/dashboard", replace: true });
      else if (user.role === "SHOP_OWNER") navigate({ to: "/business/dashboard", replace: true });
      else setCheckingRole(false);
    }).catch(() => {
      if (active) setCheckingRole(false);
    });
    return () => { active = false; };
  }, [navigate]);
  if (checkingRole) {
    return <div className="min-h-screen grid place-items-center bg-cream text-sm text-muted-foreground">Đang xác thực tài khoản…</div>;
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top,_oklch(0.95_0.08_120),_oklch(0.97_0.04_95))] py-6 px-4">
      <div className={cn("relative w-full max-w-[420px] min-h-[860px] rounded-[2.5rem] overflow-hidden gt-shadow border border-border", bg)}>
        <div className={cn("pb-24 min-h-[860px]", hideNav && "pb-0")}>{children}</div>
        {!hideNav && (
          <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-border px-2 pt-2 pb-3">
            <ul className="flex items-center justify-between">
              {tabs.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <li key={to} className="flex-1">
                    <Link
                      to={to}
                      className={cn(
                        "flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <span className={cn("grid place-items-center h-9 w-9 rounded-2xl transition-all", active && "gt-gradient text-white gt-shadow")}>
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                      </span>
                      <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export function StatusBar({ title, right }: { title?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2 text-xs text-foreground/70 font-medium">
      <span>9:41</span>
      {title && <span className="text-foreground font-semibold text-[13px]">{title}</span>}
      <div className="flex items-center gap-1">{right ?? <span>100%</span>}</div>
    </div>
  );
}
