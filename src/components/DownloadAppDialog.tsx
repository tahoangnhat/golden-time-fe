import type { ReactElement, ReactNode } from "react";
import { Apple, Download } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// This stable Play URL will continue to work after the app moves from internal
// testing to public release. During testing, only invited tester accounts can install it.
export const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=vn.goldentime.customer";
export const IOS_APP_URL = "IOS_APP_URL";

function isStoreUrl(url: string) {
  return /^https:\/\//i.test(url) && !url.endsWith("_APP_URL");
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M7 8.5a5 5 0 0 1 10 0v1H7v-1Z" fill="currentColor" />
      <path d="M6.5 10h11v6a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-6Z" fill="currentColor" />
      <path d="m8 5-1.5-2M16 5l1.5-2M4.5 11v5M19.5 11v5M9 18v3M15 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="7.5" r=".6" fill="white" />
      <circle cx="14" cy="7.5" r=".6" fill="white" />
    </svg>
  );
}

function StoreOption({
  label,
  platform,
  href,
  children,
}: {
  label: string;
  platform: string;
  href: string;
  children: ReactNode;
}) {
  const className = "h-auto min-h-14 w-full justify-start rounded-2xl px-4 py-3 text-left";

  return isStoreUrl(href) ? (
    <Button asChild className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs font-normal opacity-75">{platform}</span>
        </span>
      </a>
    </Button>
  ) : (
    <Button type="button" disabled className={className} aria-label={`${label} — liên kết sẽ được cập nhật sau`}>
      {children}
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs font-normal opacity-75">{platform}</span>
      </span>
    </Button>
  );
}

export function DownloadAppDialog({
  trigger,
}: {
  trigger: ReactElement;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto rounded-3xl border-border/70 p-6 sm:p-7">
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl gt-gradient text-white shadow-sm">
            <Download className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Tải ứng dụng Golden Time</DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed">
            Chọn Google Play để mở trang tải ứng dụng Golden Time trên Android.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-2xl bg-cream/70 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
          Ứng dụng hiện đang ở đợt thử nghiệm nội bộ. Bạn cần dùng tài khoản Google đã được thêm vào danh sách tester để cài đặt.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <StoreOption label="Google Play" platform="Android" href={ANDROID_APP_URL}>
            <AndroidIcon />
          </StoreOption>
          <StoreOption label="App Store" platform="iOS" href={IOS_APP_URL}>
            <Apple className="h-5 w-5" />
          </StoreOption>
        </div>

        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button variant="outline" className="min-w-24 rounded-xl">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
