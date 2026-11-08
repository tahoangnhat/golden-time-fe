import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileCheck2, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { ApiError, api, type GhnAddress } from "@/lib/api";
import type { Coordinates } from "@/lib/geo";
import { normalizeVietnamMobilePhone } from "@/lib/vietnam-phone";

export const Route = createFileRoute("/business/register")({
  head: () => ({ meta: [{ title: "Đăng ký doanh nghiệp — Golden Time" }] }),
  component: BusinessRegister,
});

function BusinessRegister() {
  const [businessName, setBusinessName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [representativePhone, setRepresentativePhone] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [ghnProvinces, setGhnProvinces] = useState<GhnAddress[]>([]);
  const [ghnWards, setGhnWards] = useState<GhnAddress[]>([]);
  const [pickupProvinceName, setPickupProvinceName] = useState("");
  const [pickupWardName, setPickupWardName] = useState("");
  const [shippingAddressError, setShippingAddressError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.ghnProvinces().then(setGhnProvinces)
      .catch((cause) => setShippingAddressError(cause instanceof Error ? cause.message : "Không tải được danh mục tỉnh/thành GHN."));
  }, []);

  useEffect(() => {
    let active = true;
    const province = ghnProvinces.find((item) => item.name === pickupProvinceName);
    setGhnWards([]);
    setPickupWardName("");
    if (!province) return;
    api.ghnWards(province.id).then((items) => { if (active) setGhnWards(items); })
      .catch((cause) => { if (active) setShippingAddressError(cause instanceof Error ? cause.message : "Không tải được danh mục phường/xã GHN."); });
    return () => { active = false; };
  }, [ghnProvinces, pickupProvinceName]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận chưa khớp.");
    if (address.trim().length < 5) return setError("Vui lòng nhập địa chỉ kinh doanh đầy đủ.");
    const normalizedPhone = normalizeVietnamMobilePhone(phone);
    if (!normalizedPhone) return setError("Số điện thoại doanh nghiệp không hợp lệ. Nhập số di động Việt Nam 10 số hoặc đầu +84.");
    const normalizedRepresentativePhone = normalizeVietnamMobilePhone(representativePhone);
    if (!normalizedRepresentativePhone) return setError("Số điện thoại người đại diện không hợp lệ. Nhập số di động Việt Nam 10 số hoặc đầu +84.");
    if (pickupAddress.trim().length < 5) return setError("Vui lòng nhập địa chỉ lấy hàng chi tiết (ít nhất 5 ký tự).");
    if (!pickupProvinceName || !pickupWardName) return setError("Vui lòng chọn tỉnh/thành và phường/xã lấy hàng theo danh mục GHN.");
    if (!logoFile) return setError("Vui lòng tải logo doanh nghiệp lên.");
    if (!licenseFile) return setError("Vui lòng tải giấy phép kinh doanh lên.");
    if (licenseFile.size > 10 * 1024 * 1024) return setError("Tệp giấy phép không được vượt quá 10 MB.");
    if (logoFile && logoFile.size > 10 * 1024 * 1024) return setError("Logo không được vượt quá 10 MB.");
    if (!location) return setError("Vui lòng chọn địa chỉ và ghim vị trí cửa hàng trên bản đồ.");
    setBusy(true);
    try {
      await api.submitBusinessApplication({ businessName, taxCode, contactName, representativePhone: normalizedRepresentativePhone,
        email, phone: normalizedPhone, address, pickupAddress: pickupAddress.trim(), pickupProvinceName, pickupWardName,
        password, licenseFile, logoFile, latitude: location.lat, longitude: location.lng });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Không gửi được hồ sơ lúc này.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return <main className="min-h-screen bg-[oklch(0.97_0.04_95)] px-5 py-12 grid place-items-center">
      <section className="w-full max-w-xl rounded-3xl border border-border bg-white p-8 text-center gt-shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[oklch(0.95_0.06_145)] text-primary grid place-items-center"><FileCheck2 className="h-7 w-7" /></div>
        <h1 className="mt-5 text-2xl font-extrabold">Đã nhận hồ sơ đăng ký</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Admin sẽ xem thông tin doanh nghiệp. Kết quả sẽ được gửi đến <span className="font-semibold text-foreground">{email}</span>. Bạn có thể đăng nhập sau khi hồ sơ được chấp nhận.</p>
        <Link to="/business/login" className="mt-6 inline-flex items-center gap-2 rounded-xl gt-gradient px-5 py-3 font-semibold text-white">Về đăng nhập doanh nghiệp</Link>
      </section>
    </main>;
  }

  return <main className="min-h-screen bg-[oklch(0.97_0.04_95)] px-5 py-10">
    <div className="mx-auto max-w-3xl">
      <Link to="/business/login" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Đăng nhập doanh nghiệp</Link>
      <section className="mt-5 rounded-3xl border border-border bg-white p-6 md:p-9 gt-shadow-soft">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-2xl gt-gradient grid place-items-center text-white"><Building2 className="h-6 w-6" /></div>
          <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Golden Time Business</p><h1 className="mt-1 text-2xl font-extrabold">Đăng ký tài khoản doanh nghiệp</h1><p className="mt-2 text-sm text-muted-foreground">Gửi thông tin doanh nghiệp và giấy phép kinh doanh để Admin xem xét. Tài khoản chỉ được kích hoạt sau khi hồ sơ được chấp nhận.</p></div>
        </div>

        <form onSubmit={submit} className="mt-7 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2"><span className="text-xs font-semibold">Tên doanh nghiệp / cửa hàng</span><input required maxLength={255} value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Mã số thuế (không bắt buộc)</span><input maxLength={64} value={taxCode} onChange={(event) => setTaxCode(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Người đại diện / liên hệ</span><input required maxLength={255} value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Email doanh nghiệp</span><input required type="email" maxLength={255} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Số điện thoại doanh nghiệp</span><input required type="tel" maxLength={32} autoComplete="tel" inputMode="tel" placeholder="09xxxxxxxx hoặc +849xxxxxxxx" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /><span className="mt-1 block text-[11px] text-muted-foreground">Số di động Việt Nam hợp lệ, dùng cho liên hệ và giao hàng.</span></label>
          <label className="block"><span className="text-xs font-semibold">Số điện thoại người đại diện</span><input required type="tel" maxLength={32} inputMode="tel" placeholder="09xxxxxxxx hoặc +849xxxxxxxx" value={representativePhone} onChange={(event) => setRepresentativePhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <div className="md:col-span-2"><LocationPicker address={address} value={location} onAddressChange={setAddress} onChange={setLocation} /></div>
          <section className="md:col-span-2 rounded-2xl border border-border bg-cream/50 p-4">
            <h2 className="text-sm font-bold">Địa chỉ lấy hàng GHN</h2>
            <p className="mt-1 text-xs text-muted-foreground">Nhập đúng nơi đơn vị vận chuyển đến lấy hàng. Nếu trùng địa chỉ kinh doanh, bạn có thể sao chép từ địa chỉ phía trên.</p>
            {shippingAddressError && <p role="alert" className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{shippingAddressError}</p>}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="text-xs font-semibold">Tỉnh/thành *</span><select required value={pickupProvinceName} onChange={(event) => setPickupProvinceName(event.target.value)} disabled={!ghnProvinces.length} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"><option value="">Chọn tỉnh/thành</option>{ghnProvinces.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
              <label className="block"><span className="text-xs font-semibold">Phường/xã *</span><select required value={pickupWardName} onChange={(event) => setPickupWardName(event.target.value)} disabled={!ghnWards.length} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"><option value="">Chọn phường/xã</option>{ghnWards.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
              <label className="block sm:col-span-2"><span className="text-xs font-semibold">Địa chỉ chi tiết lấy hàng *</span><input required minLength={5} maxLength={512} value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} placeholder="Số nhà, tên đường, thôn/ấp..." className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm" /></label>
              <button type="button" onClick={() => setPickupAddress(address)} disabled={!address.trim()} className="justify-self-start text-xs font-semibold text-primary underline disabled:opacity-50">Dùng địa chỉ kinh doanh</button>
            </div>
          </section>
          <label className="block"><span className="text-xs font-semibold">Mật khẩu</span><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Nhập lại mật khẩu</span><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block md:col-span-2"><span className="text-xs font-semibold">Logo doanh nghiệp *</span><span className="mt-1 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-cream"><Upload className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{logoFile?.name || "Tải ảnh PNG, JPG hoặc WebP lên (tối đa 10 MB)"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} className="sr-only" /></span></label>
          <label className="block md:col-span-2"><span className="text-xs font-semibold">Giấy phép kinh doanh *</span><span className="mt-1 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-cream"><Upload className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{licenseFile?.name || "Bắt buộc · Tải tệp PDF, PNG hoặc JPG lên (tối đa 10 MB)"}</span><input type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" aria-required="true" onChange={(event) => setLicenseFile(event.target.files?.[0] ?? null)} className="sr-only" /></span></label>
          {error && <p role="alert" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="md:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl gt-gradient font-semibold text-white gt-shadow disabled:opacity-60">{busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Đang gửi hồ sơ…</> : "Gửi hồ sơ đăng ký"}</button>
        </form>
      </section>
    </div>
  </main>;
}
