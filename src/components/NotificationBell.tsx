import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { api, type NotificationInbox as NotificationInboxData } from "@/lib/api";

export function NotificationBell({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState<NotificationInboxData>({ items: [], unreadCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setInbox(await api.notificationInbox());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead();
      setInbox((current) => ({
        unreadCount: 0,
        items: current.items.map((item) => ({ ...item, read: true, readAt: item.readAt ?? new Date().toISOString() })),
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được thông báo.");
    }
  }

  async function openNotification(id: number, targetPath?: string | null) {
    try {
      await api.markNotificationRead(id);
      setInbox((current) => ({
        unreadCount: Math.max(0, current.unreadCount - (current.items.find((item) => item.id === id && !item.read) ? 1 : 0)),
        items: current.items.map((item) => item.id === id ? { ...item, read: true, readAt: item.readAt ?? new Date().toISOString() } : item),
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được thông báo.");
    }
    setOpen(false);
    if (targetPath?.startsWith("/") && !targetPath.startsWith("//")) {
      navigate({ to: targetPath as never });
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label={inbox.unreadCount ? `${inbox.unreadCount} thông báo chưa đọc` : "Thông báo"}
        aria-expanded={open}
        onClick={() => { setOpen((current) => !current); if (!open) void refresh(); }}
        className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
      >
        <Bell className="h-5 w-5" />
        {inbox.unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-none text-white">{inbox.unreadCount > 99 ? "99+" : inbox.unreadCount}</span>}
      </button>

      {open && (
        <section className="absolute right-0 top-full z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-white text-foreground shadow-xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div><h2 className="text-sm font-bold">Thông báo</h2><p className="text-[11px] text-muted-foreground">{inbox.unreadCount} chưa đọc</p></div>
            <button type="button" disabled={!inbox.unreadCount} onClick={() => void markAllRead()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-primary hover:bg-cream disabled:opacity-40"><CheckCheck className="h-3.5 w-3.5" />Đọc tất cả</button>
          </header>
          <div className="max-h-[min(26rem,65dvh)] overflow-y-auto">
            {loading && inbox.items.length === 0 && <div className="flex items-center justify-center gap-2 p-7 text-xs text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải thông báo…</div>}
            {error && <p role="alert" className="m-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
            {!loading && !error && inbox.items.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">Bạn chưa có thông báo nào.</p>}
            {inbox.items.map((item) => (
              <button key={item.id} type="button" onClick={() => void openNotification(item.id, item.targetPath)} className={`flex w-full gap-3 border-b border-border/70 px-4 py-3 text-left transition hover:bg-cream/70 ${item.read ? "bg-white" : "bg-primary/[0.04]"}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-primary"}`} />
                <span className="min-w-0 flex-1"><strong className="block text-xs font-bold">{item.title}</strong><span className="mt-0.5 block text-xs leading-relaxed text-foreground/75">{item.message}</span><time className="mt-1 block text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</time></span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
