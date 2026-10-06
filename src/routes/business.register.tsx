import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileCheck2, LoaderCircle, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError, api } from "@/lib/api";

export const Route = createFileRoute("/business/register")({
  head: () => ({ meta: [{ title: "Đăng ký doanh nghiệp — Golden Time" }] }),
  component: BusinessRegister,
});

function BusinessRegister() {
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận chưa khớp.");
    if (!licenseFile) return setError("Vui lòng đính kèm giấy phép kinh doanh.");
    if (licenseFile.size > 10 * 1024 * 1024) return setError("Tệp giấy phép không được vượt quá 10 MB.");
    setBusy(true);
    try {
      await api.submitBusinessApplication({ businessName, registrationNumber, contactName, email, phone, address, password, licenseFile });
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
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Admin sẽ xem thông tin doanh nghiệp và giấy phép kinh doanh. Kết quả sẽ được gửi đến <span className="font-semibold text-foreground">{email}</span>. Bạn có thể đăng nhập sau khi hồ sơ được chấp nhận.</p>
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
          <label className="block"><span className="text-xs font-semibold">Mã số đăng ký kinh doanh</span><input required minLength={3} maxLength={64} value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Người đại diện / liên hệ</span><input required maxLength={255} value={contactName} onChange={(event) => setContactName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Email doanh nghiệp</span><input required type="email" maxLength={255} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Số điện thoại</span><input required type="tel" maxLength={32} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block md:col-span-2"><span className="text-xs font-semibold">Địa chỉ kinh doanh</span><input required minLength={5} maxLength={512} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Mật khẩu</span><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block"><span className="text-xs font-semibold">Nhập lại mật khẩu</span><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3" /></label>
          <label className="block md:col-span-2"><span className="text-xs font-semibold">Giấy phép kinh doanh</span><span className="mt-1 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-cream"><Upload className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{licenseFile?.name || "Tải tệp PDF, PNG hoặc JPG lên (tối đa 10 MB)"}</span><input required type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" onChange={(event) => setLicenseFile(event.target.files?.[0] ?? null)} className="sr-only" /></span></label>
          {error && <p role="alert" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="md:col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl gt-gradient font-semibold text-white gt-shadow disabled:opacity-60">{busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Đang gửi hồ sơ…</> : "Gửi hồ sơ đăng ký"}</button>
        </form>
      </section>
    </div>
  </main>;
}
