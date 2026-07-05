import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Music2, Mail, Download, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/knowledge", label: "Kiến thức" },
  { to: "/updates", label: "Cập nhật ứng dụng" },
  { to: "/about", label: "Về Golden Time" },
  { to: "/contact", label: "Liên hệ" },
] as const;

export const SOCIAL = {
  facebook: "https://facebook.com/goldentime",
  tiktok: "https://tiktok.com/@goldentime",
  appStore: "https://apps.apple.com/app/goldentime",
  googlePlay: "https://play.google.com/store/apps/details?id=vn.goldentime",
  apk: "https://goldentime.vn/download/goldentime.apk",
  email: "hello@goldentime.vn",
};

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="h-10 w-10 rounded-2xl gt-gradient grid place-items-center text-white font-extrabold gt-shadow transition-transform group-hover:scale-105">
        G
      </div>
      <div className="leading-tight">
        <div className="font-extrabold tracking-tight text-[17px]">Golden Time</div>
        <div className="text-[10px] text-muted-foreground -mt-0.5 font-medium">AI Fruit Intelligence</div>
      </div>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-primary hover:bg-cream transition-colors"
              activeProps={{ className: "text-primary bg-cream" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/app/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cream text-primary text-sm font-semibold hover:bg-primary/10 transition"
          >
            Đăng nhập
          </Link>
          <Link
            to="/download"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gt-gradient text-white text-sm font-semibold gt-shadow hover:opacity-95 transition"
          >
            <Download className="h-4 w-4" /> Tải ứng dụng
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-xl bg-cream"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border/60 bg-white px-5 py-4 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-cream"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/app/login"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-primary bg-cream"
          >
            Đăng nhập ứng dụng
          </Link>
          <Link
            to="/download"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl gt-gradient text-white text-sm font-semibold"
          >
            <Download className="h-4 w-4" /> Tải ứng dụng
          </Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[oklch(0.22_0.04_150)] text-white/80">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-2xl gt-gradient grid place-items-center text-white font-extrabold">G</div>
            <div className="font-extrabold text-white text-lg">Golden Time</div>
          </div>
          <p className="text-sm leading-relaxed">
            Nền tảng FoodTech giúp người Việt chọn mua trái cây thông minh với AI, dinh dưỡng và truy xuất nguồn gốc.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Liên kết nhanh</h4>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-white transition-colors">{n.label}</Link></li>
            ))}
            <li><Link to="/download" className="hover:text-white">Tải ứng dụng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Mạng xã hội</h4>
          <ul className="space-y-2 text-sm">
            <li><a href={SOCIAL.facebook} className="inline-flex items-center gap-2 hover:text-white"><Facebook className="h-4 w-4" /> Facebook Fanpage</a></li>
            <li><a href={SOCIAL.tiktok} className="inline-flex items-center gap-2 hover:text-white"><Music2 className="h-4 w-4" /> TikTok</a></li>
            <li><a href={`mailto:${SOCIAL.email}`} className="inline-flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4" /> {SOCIAL.email}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Trải nghiệm sản phẩm</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/app/login" className="hover:text-white">Ứng dụng người dùng</Link></li>
            <li><Link to="/shop/login" className="hover:text-white">Đối tác cửa hàng</Link></li>
            <li><Link to="/admin/login" className="hover:text-white">Quản trị nội bộ</Link></li>
            <li><Link to="/content-admin" className="hover:text-white">Quản lý nội dung</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 text-xs text-white/60 flex flex-wrap items-center justify-between gap-2">
          <div>© 2026 Golden Time. All rights reserved.</div>
          <div>Made with 🍊 in Vietnam</div>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-20", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("mb-12", center && "text-center max-w-2xl mx-auto")}>
      {eyebrow && (
        <div className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-cream px-3 py-1 rounded-full mb-4">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-4 text-base lg:text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}