import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, KeyRound, LoaderCircle, MapPin, Save, Unplug } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { LocationPicker } from "@/components/LocationPicker";
import { api, type ShopPayOSSettings, type ShopProfile } from "@/lib/api";
import type { Coordinates } from "@/lib/geo";

export const Route = createFileRoute("/business/profile")({ head: () => ({ meta: [{ title: "Hồ sơ cửa hàng — Golden Time Business" }] }), component: Profile });

function Profile() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [name, setName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativePhone, setRepresentativePhone] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [payosSettings, setPayosSettings] = useState<ShopPayOSSettings | null>(null);
  const [payosClientId, setPayosClientId] = useState("");
  const [payosApiKey, setPayosApiKey] = useState("");
  const [payosChecksumKey, setPayosChecksumKey] = useState("");
  const [payosBusy, setPayosBusy] = useState(false);
  const [payosError, setPayosError] = useState("");
  const [payosNotice, setPayosNotice] = useState("");
  useEffect(() => {
    api.shopProfile().then((profile) => {
      setShop(profile);
      setAddress(profile.address ?? "");
      setLocation({ lat: profile.latitude, lng: profile.longitude });
      setName(profile.name);
      setLogoUrl(profile.logoUrl ?? "");
      setBusinessEmail(profile.businessEmail ?? "");
      setBusinessPhone(profile.businessPhone ?? "");
      setTaxCode(profile.taxCode ?? "");
      setRepresentativeName(profile.representativeName ?? "");
      setRepresentativePhone(profile.representativePhone ?? "");
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được hồ sơ."));
  }, []);
  useEffect(() => {
    api.shopPayOSSettings().then(setPayosSettings)
      .catch((cause) => setPayosError(cause instanceof Error ? cause.message : "Không tải được cấu hình PayOS."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (address.trim().length < 5) return setError("Vui lòng nhập địa chỉ cửa hàng đầy đủ.");
    if (!location) return setError("Vui lòng ghim vị trí cửa hàng trên bản đồ.");
    setBusy(true);
    try {
      const updated = await api.updateShopProfile({ name: name.trim(), address: address.trim(), latitude: location.lat, longitude: location.lng,
        businessEmail: businessEmail.trim(), businessPhone: businessPhone.trim(), taxCode: taxCode.trim(),
        representativeName: representativeName.trim(), representativePhone: representativePhone.trim(), logoUrl });
      setShop(updated);
      setAddress(updated.address ?? "");
      setLocation({ lat: updated.latitude, lng: updated.longitude });
      setLogoUrl(updated.logoUrl ?? "");
      setNotice("Đã cập nhật hồ sơ doanh nghiệp và vị trí cửa hàng.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được địa chỉ cửa hàng.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    try {
      const image = await api.uploadBusinessLogo(file);
      setLogoUrl(image.url);
      setLogoFile(file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được logo.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function savePayOS(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPayosError("");
    setPayosNotice("");
    setPayosBusy(true);
    try {
      await api.connectShopPayOS({ clientId: payosClientId.trim(), apiKey: payosApiKey.trim(), checksumKey: payosChecksumKey.trim() });
      setPayosSettings(await api.shopPayOSSettings());
      setPayosClientId("");
      setPayosApiKey("");
      setPayosChecksumKey("");
      setPayosNotice("Đã kết nối kênh PayOS của cửa hàng. PayOS sẽ chuyển tiền vào tài khoản ngân hàng cửa hàng đã liên kết với kênh này.");
    } catch (cause) {
      setPayosError(cause instanceof Error ? cause.message : "Không kết nối được PayOS.");
    } finally {
      setPayosBusy(false);
    }
  }

  async function disconnectPayOS() {
    if (!window.confirm("Ngắt PayOS của cửa hàng? Khách hàng sẽ không thể chọn PayOS cho đến khi kết nối lại.")) return;
    setPayosError("");
    setPayosNotice("");
    setPayosBusy(true);
    try {
      await api.disconnectShopPayOS();
      setPayosSettings(await api.shopPayOSSettings());
      setPayosNotice("Đã ngắt kết nối PayOS.");
    } catch (cause) {
      setPayosError(cause instanceof Error ? cause.message : "Không ngắt được PayOS.");
    } finally {
      setPayosBusy(false);
    }
  }

  return <BusinessShell title="Hồ sơ cửa hàng" subtitle="Thông tin đang lưu trong hồ sơ cửa hàng">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {shop ? <form onSubmit={save} className="bg-white rounded-2xl border border-border gt-shadow-soft p-6">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">Hồ sơ doanh nghiệp</h2><p className="mt-2 text-sm text-muted-foreground">Cập nhật thông tin liên hệ, người đại diện, logo và địa chỉ kinh doanh.</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{shop.status}</span></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2"><span className="text-xs font-semibold">Tên doanh nghiệp / shop</span><input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <label className="block"><span className="text-xs font-semibold">Email doanh nghiệp</span><input type="email" maxLength={255} value={businessEmail} onChange={(event) => setBusinessEmail(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <label className="block"><span className="text-xs font-semibold">Số điện thoại</span><input type="tel" maxLength={32} value={businessPhone} onChange={(event) => setBusinessPhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <label className="block"><span className="text-xs font-semibold">Mã số thuế</span><input maxLength={64} value={taxCode} onChange={(event) => setTaxCode(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <label className="block"><span className="text-xs font-semibold">Người đại diện</span><input maxLength={255} value={representativeName} onChange={(event) => setRepresentativeName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <label className="block"><span className="text-xs font-semibold">Điện thoại người đại diện</span><input type="tel" maxLength={32} value={representativePhone} onChange={(event) => setRepresentativePhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
        <div className="sm:col-span-2"><span className="text-xs font-semibold">Logo doanh nghiệp</span><div className="mt-2 flex items-center gap-3">{logoUrl && <img src={logoUrl} alt="Logo doanh nghiệp" className="h-16 w-16 rounded-xl border border-border object-cover" />}<input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => uploadLogo(event.target.files?.[0])} /><button type="button" disabled={uploadingLogo} onClick={() => logoInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"><ImagePlus className="h-4 w-4" />{uploadingLogo ? "Đang tải…" : logoFile ? "Đổi logo" : "Tải logo lên"}</button></div></div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /><span>Đánh giá: {Number(shop.rating).toFixed(1)} ({shop.reviewCount})</span></div>
      <LocationPicker address={address} value={location} onAddressChange={setAddress} onChange={setLocation} />
      <button disabled={busy} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl gt-gradient px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Đang lưu…</> : <><Save className="h-4 w-4" /> Lưu địa chỉ và vị trí</>}</button>
    </form> : !error && <div className="rounded-2xl bg-white p-10 text-center text-sm text-muted-foreground"><LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />Đang tải hồ sơ cửa hàng…</div>}
    {shop && <section className="mt-5 rounded-2xl border border-border bg-white p-6 gt-shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">Thanh toán PayOS của cửa hàng</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Kết nối kênh PayOS do cửa hàng sở hữu để tiền thanh toán được chuyển vào tài khoản ngân hàng cửa hàng đã liên kết. Không nhập khóa PayOS của nền tảng.</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payosSettings?.connected ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{payosSettings?.connected ? "Đã kết nối" : "Chưa kết nối"}</span></div>
      {payosError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{payosError}</p>}
      {payosNotice && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{payosNotice}</p>}
      <form onSubmit={savePayOS} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="text-xs font-semibold">Client ID</span><input required autoComplete="off" value={payosClientId} onChange={(event) => setPayosClientId(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" placeholder="Lấy trong my.payos.vn" /></label>
        <label className="block"><span className="text-xs font-semibold">API Key</span><input required type="password" autoComplete="new-password" value={payosApiKey} onChange={(event) => setPayosApiKey(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" placeholder={payosSettings?.connected ? "Nhập lại để thay khóa" : "Lấy trong my.payos.vn"} /></label>
        <label className="block sm:col-span-2"><span className="text-xs font-semibold">Checksum Key</span><input required type="password" autoComplete="new-password" value={payosChecksumKey} onChange={(event) => setPayosChecksumKey(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" placeholder={payosSettings?.connected ? "Nhập lại để thay khóa" : "Lấy trong my.payos.vn"} /></label>
        <div className="sm:col-span-2 rounded-xl bg-cream p-4 text-sm"><p className="font-semibold">Webhook PayOS sẽ được kết nối tự động khi lưu.</p><p className="mt-1 break-all text-xs text-muted-foreground">{payosSettings?.webhookUrl ?? "Đang tải địa chỉ webhook…"}</p><p className="mt-2 text-xs text-muted-foreground">Hãy dùng bộ khóa của chính cửa hàng. Khóa được mã hóa khi lưu và không hiển thị lại trên giao diện.</p></div>
        <div className="sm:col-span-2 flex flex-wrap gap-2"><button disabled={payosBusy} className="inline-flex h-11 items-center gap-2 rounded-xl gt-gradient px-5 text-sm font-semibold text-white disabled:opacity-60">{payosBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{payosSettings?.connected ? "Cập nhật kết nối PayOS" : "Kết nối PayOS"}</button>
          {payosSettings?.connected && <button type="button" disabled={payosBusy} onClick={disconnectPayOS} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold disabled:opacity-60"><Unplug className="h-4 w-4" />Ngắt kết nối</button>}</div>
      </form>
    </section>}
  </BusinessShell>;
}
