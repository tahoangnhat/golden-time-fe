import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, MapPin, Save } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { LocationPicker } from "@/components/LocationPicker";
import { api, type ShopProfile } from "@/lib/api";
import type { Coordinates } from "@/lib/geo";

export const Route = createFileRoute("/business/profile")({ head: () => ({ meta: [{ title: "Hồ sơ cửa hàng — Golden Time Business" }] }), component: Profile });

function Profile() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.shopProfile().then((profile) => {
      setShop(profile);
      setAddress(profile.address ?? "");
      setLocation({ lat: profile.latitude, lng: profile.longitude });
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được hồ sơ."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (address.trim().length < 5) return setError("Vui lòng nhập địa chỉ cửa hàng đầy đủ.");
    if (!location) return setError("Vui lòng ghim vị trí cửa hàng trên bản đồ.");
    setBusy(true);
    try {
      const updated = await api.updateShopProfile({ address: address.trim(), latitude: location.lat, longitude: location.lng });
      setShop(updated);
      setAddress(updated.address ?? "");
      setLocation({ lat: updated.latitude, lng: updated.longitude });
      setNotice("Đã cập nhật địa chỉ và vị trí cửa hàng. Người dùng sẽ thấy vị trí mới khi tìm cửa hàng gần đây.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được địa chỉ cửa hàng.");
    } finally {
      setBusy(false);
    }
  }

  return <BusinessShell title="Hồ sơ cửa hàng" subtitle="Thông tin đang lưu trong hồ sơ cửa hàng">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {shop ? <form onSubmit={save} className="bg-white rounded-2xl border border-border gt-shadow-soft p-6">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">{shop.name}</h2><p className="mt-2 text-sm text-muted-foreground">{shop.description || "Cập nhật địa chỉ để khách hàng tìm được cửa hàng của bạn."}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{shop.status}</span></div>
      <div className="mt-5 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /><span>Đánh giá: {Number(shop.rating).toFixed(1)} ({shop.reviewCount})</span></div>
      <LocationPicker address={address} value={location} onAddressChange={setAddress} onChange={setLocation} />
      <button disabled={busy} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl gt-gradient px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Đang lưu…</> : <><Save className="h-4 w-4" /> Lưu địa chỉ và vị trí</>}</button>
    </form> : !error && <div className="rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />Đang tải hồ sơ cửa hàng…</div>}
  </BusinessShell>;
}
