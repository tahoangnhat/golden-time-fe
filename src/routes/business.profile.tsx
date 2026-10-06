import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopProfile } from "@/lib/api";

export const Route = createFileRoute("/business/profile")({ head: () => ({ meta: [{ title: "Hồ sơ cửa hàng — Golden Time Business" }] }), component: Profile });

function Profile() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.shopProfile().then(setShop).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được hồ sơ.")); }, []);
  return <BusinessShell title="Hồ sơ cửa hàng" subtitle="Thông tin đang lưu trong hồ sơ cửa hàng">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {shop ? <div className="bg-white rounded-2xl border border-border gt-shadow-soft p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">{shop.name}</h2><p className="mt-2 text-sm text-muted-foreground">{shop.description || "Chưa có mô tả."}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{shop.status}</span></div><div className="mt-5 space-y-3 text-sm"><p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" />{shop.address || "Chưa có địa chỉ"}</p><p><span className="text-muted-foreground">Tọa độ:</span> {shop.latitude}, {shop.longitude}</p><p><span className="text-muted-foreground">Đánh giá:</span> {Number(shop.rating).toFixed(1)} ({shop.reviewCount})</p></div><p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">Số điện thoại, giờ hoạt động, phí giao hàng và ảnh cửa hàng chưa có trường dữ liệu trong phiên bản hiện tại.</p></div> : !error && <div className="rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground">Chưa có hồ sơ cửa hàng liên kết với tài khoản này.</div>}
  </BusinessShell>;
}
