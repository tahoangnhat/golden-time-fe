import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { ArrowRight, Check, CircleAlert, Crown, LoaderCircle, LockKeyhole, Save, Sparkles, Trash2 } from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";
import { api, hasAuth, type PremiumHealthProfile, type PremiumOverview, type PremiumPayment, type PremiumRecommendationResponse } from "@/lib/api";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Premium — Golden Time" }] }),
  component: PremiumPage,
});

type ProfileField = "ageGroup" | "heightCm" | "weightKg" | "allergies" | "chronicConditions" | "medications" | "healthGoals";
const FIELDS: { key: ProfileField; label: string; hint: string }[] = [
  { key: "ageGroup", label: "Nhóm tuổi", hint: "Chọn nhóm tuổi phù hợp" },
  { key: "heightCm", label: "Chiều cao (cm)", hint: "Ví dụ: 165" },
  { key: "weightKg", label: "Cân nặng (kg)", hint: "Ví dụ: 58" },
  { key: "allergies", label: "Dị ứng thực phẩm", hint: "Liệt kê tên thực phẩm, cách nhau bằng dấu phẩy" },
  { key: "chronicConditions", label: "Bệnh nền", hint: "Thông tin bạn tự nguyện cung cấp" },
  { key: "medications", label: "Thuốc đang sử dụng", hint: "Tên thuốc nếu bạn muốn chia sẻ" },
  { key: "healthGoals", label: "Mục tiêu dinh dưỡng", hint: "Ví dụ: ăn đa dạng hơn, tăng chất xơ" },
];
const emptyProfile: PremiumHealthProfile = { notProvidedFields: [] };
const ageGroups = ["Dưới 18 tuổi", "18–29 tuổi", "30–44 tuổi", "45–59 tuổi", "Từ 60 tuổi"];
const money = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

function PremiumPage() {
  const [overview, setOverview] = useState<PremiumOverview | null>(null);
  const [profile, setProfile] = useState<PremiumHealthProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [pageError, setPageError] = useState("");
  const [payment, setPayment] = useState<PremiumPayment | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [saveConsent, setSaveConsent] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [recommendations, setRecommendations] = useState<PremiumRecommendationResponse | null>(null);
  const [recommendBusy, setRecommendBusy] = useState(false);

  useEffect(() => {
    const authenticated = hasAuth();
    setSignedIn(authenticated);
    if (!authenticated) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      try {
        const status = await api.premiumStatus();
        if (!active) return;
        setOverview(status);
        if (status.healthProfile) setProfile({ ...status.healthProfile, notProvidedFields: status.healthProfile.notProvidedFields || [] });
        setLoading(false);
        const orderCode = Number(new URLSearchParams(window.location.search).get("orderCode"));
        if (Number.isSafeInteger(orderCode) && orderCode > 0) {
          for (let attempt = 0; attempt < 12 && active; attempt += 1) {
            const current = await api.premiumPaymentStatus(orderCode);
            if (!active) return;
            setPayment(current);
            if (current.status !== "PENDING") break;
            await new Promise((resolve) => window.setTimeout(resolve, 2500));
          }
          const refreshed = await api.premiumStatus();
          if (active) setOverview(refreshed);
        }
      } catch (cause) {
        if (active) setPageError(cause instanceof Error ? cause.message : "Không tải được trạng thái Premium.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  async function beginPayment() {
    setPaymentBusy(true); setPageError("");
    try {
      const created = await api.createPremiumPayment();
      setPayment(created);
      if (created.checkoutUrl) window.location.assign(created.checkoutUrl);
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "Không thể tạo thanh toán PayOS.");
    } finally { setPaymentBusy(false); }
  }

  function updateField(field: ProfileField, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: field === "heightCm" || field === "weightKg" ? (value === "" ? null : Number(value)) : value || null,
    }));
  }

  function setNotProvided(field: ProfileField, checked: boolean) {
    setProfile((current) => {
      const notProvidedFields = checked
        ? [...new Set([...current.notProvidedFields, field])]
        : current.notProvidedFields.filter((item) => item !== field);
      return { ...current, [field]: checked ? null : current[field], notProvidedFields };
    });
  }

  async function deleteProfile() {
    setProfileBusy(true); setProfileMessage(""); setPageError("");
    try {
      await api.deletePremiumHealthProfile();
      setProfile(emptyProfile); setSaveConsent(false);
      setOverview((current) => current ? { ...current, healthProfile: null } : current);
      setProfileMessage("Đã xóa hồ sơ sức khỏe đã lưu.");
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "Không xóa được hồ sơ sức khỏe.");
    } finally { setProfileBusy(false); }
  }

  async function requestRecommendations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!overview?.premiumActive) return;
    if (!aiConsent) return;
    setRecommendBusy(true); setPageError(""); setRecommendations(null);
    try {
      const result = await api.premiumRecommendations({ profile, consentToAi: aiConsent, saveProfileConsent: saveConsent });
      setRecommendations(result);
      if (saveConsent) setOverview((current) => current ? { ...current, healthProfile: profile } : current);
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "Không tạo được gợi ý trái cây.");
    } finally { setRecommendBusy(false); }
  }

  async function saveProfileFromButton(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!saveConsent) return;
    setProfileBusy(true); setProfileMessage(""); setPageError("");
    try {
      const saved = await api.savePremiumHealthProfile({ ...profile, consentToSave: true });
      setProfile({ ...saved, notProvidedFields: saved.notProvidedFields || [] });
      setProfileMessage("Đã lưu hồ sơ sức khỏe. Bạn có thể sửa hoặc xóa bất cứ lúc nào.");
      setOverview((current) => current ? { ...current, healthProfile: saved } : current);
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "Không lưu được hồ sơ sức khỏe.");
    } finally { setProfileBusy(false); }
  }

  const hasSavedProfile = Boolean(overview?.healthProfile);

  return (
    <SiteShell>
      <Section className="max-w-5xl">
        <header className="rounded-[2rem] border border-green-100 bg-gradient-to-br from-cream via-white to-green-50 p-7 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm"><Crown className="h-4 w-4" /> GOLDEN TIME PREMIUM</div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">Chọn trái cây phù hợp hơn với bạn</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">Nhận gợi ý từ hồ sơ tự nguyện cung cấp, dữ liệu dinh dưỡng và các sản phẩm đang bán, còn hàng tại Golden Time.</p>
        </header>

        {pageError && <p role="alert" className="mt-5 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><CircleAlert className="h-5 w-5 shrink-0" />{pageError}</p>}

        {!signedIn ? (
          <div className="mt-6 rounded-3xl border border-border bg-white p-7 text-center gt-shadow-soft">
            <LockKeyhole className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Đăng nhập để mua và sử dụng Premium</h2>
            <p className="mt-2 text-sm text-muted-foreground">Hồ sơ sức khỏe và quyền Premium được gắn với tài khoản của bạn.</p>
            <Link to="/app/login" className="mt-5 inline-flex items-center gap-2 rounded-xl gt-gradient px-5 py-3 text-sm font-bold text-white">Đăng nhập <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-3xl border border-border bg-white p-8 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải gói Premium…</div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <section className="rounded-3xl border border-border bg-white p-6 gt-shadow-soft">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-primary"><Crown className="h-5 w-5" /></span><div><h2 className="font-extrabold">Premium 30 ngày</h2><p className="text-xs text-muted-foreground">Thanh toán một lần · Không tự gia hạn</p></div></div>
                <p className="mt-6 text-3xl font-extrabold text-foreground">{overview?.priceVnd ? money(overview.priceVnd) : "Chưa mở bán"}</p>
                {overview?.premiumActive ? (
                  <>
                    <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800"><p className="flex items-center gap-2 font-bold"><Check className="h-4 w-4" /> Gói đang hoạt động</p><p className="mt-1">Hết hạn: {overview.expiresAt ? new Date(overview.expiresAt).toLocaleString("vi-VN") : "—"}</p></div>
                    <button type="button" disabled={paymentBusy || !overview.priceVnd || !overview.payosConfigured} onClick={() => void beginPayment()} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-50">{paymentBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}Mua thêm 30 ngày</button>
                  </>
                ) : (
                  <>
                    <button type="button" disabled={paymentBusy || !overview?.priceVnd || !overview?.payosConfigured} onClick={() => void beginPayment()} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl gt-gradient text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                      {paymentBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                      {paymentBusy ? "Đang tạo thanh toán…" : "Mua gói qua PayOS"}
                    </button>
                    {!overview?.payosConfigured && <p className="mt-2 text-xs text-muted-foreground">PayOS chưa được cấu hình trên máy chủ.</p>}
                    {!overview?.priceVnd && <p className="mt-2 text-xs text-muted-foreground">Admin cần đặt giá để mở bán gói.</p>}
                  </>
                )}
                {payment && <div className="mt-4 rounded-2xl border border-border p-4 text-sm"><p>Thanh toán #{payment.orderCode}: <strong>{payment.status === "PAID" ? "Đã thanh toán" : payment.status === "PENDING" ? "Đang chờ thanh toán" : payment.status === "EXPIRED" ? "Hết hạn" : "Đã hủy"}</strong></p>{payment.status === "PENDING" && payment.checkoutUrl && <a href={payment.checkoutUrl} className="mt-3 inline-flex items-center gap-2 font-bold text-primary underline">Mở trang thanh toán PayOS <ArrowRight className="h-4 w-4" /></a>}</div>}
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />Gợi ý từ sản phẩm đang bán và còn hàng</li><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />Kết hợp quy tắc dinh dưỡng và Gemini</li><li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />Hồ sơ sức khỏe có thể sửa hoặc xóa</li></ul>
              </section>

              <section className="rounded-3xl border border-border bg-white p-6 gt-shadow-soft sm:p-7">
                {!overview?.premiumActive && !hasSavedProfile ? (
                  <div className="grid min-h-56 content-center text-center"><Sparkles className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-3 text-xl font-bold">Gợi ý sức khỏe dành cho thành viên</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Sau khi PayOS xác nhận thanh toán, bạn có thể nhập hồ sơ tùy chọn và nhận đề xuất trái cây.</p></div>
                ) : (
                  <form onSubmit={(event) => void requestRecommendations(event)}>
                    <h2 className="text-xl font-extrabold">Hồ sơ sức khỏe</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Mọi mục đều tùy chọn. Khi tích “Không muốn cung cấp”, trường đó sẽ được bỏ qua.</p>
                    {!overview?.premiumActive && <p className="mt-3 rounded-xl bg-cream p-3 text-sm text-muted-foreground">Gói đã hết hạn. Bạn vẫn có thể sửa hoặc xóa hồ sơ; mua lại Premium để nhận gợi ý mới.</p>}
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {FIELDS.map(({ key, label, hint }) => {
                        const declined = profile.notProvidedFields.includes(key);
                        return <div key={key} className="block text-sm font-semibold">
                          <span className="block">{label}</span>
                          {key === "ageGroup" ? (
                            <select aria-label={label} value={profile.ageGroup || ""} disabled={declined} onChange={(event) => updateField(key, event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-3 font-normal outline-none focus:border-primary disabled:bg-muted/50">
                              <option value="">Chọn nếu muốn</option>{ageGroups.map((age) => <option value={age} key={age}>{age}</option>)}
                            </select>
                          ) : key === "heightCm" || key === "weightKg" ? (
                            <input aria-label={label} type="number" min={key === "heightCm" ? 30 : 1} max={key === "heightCm" ? 250 : 500} step="0.1" value={(profile[key] as number | null | undefined) ?? ""} disabled={declined} onChange={(event) => updateField(key, event.target.value)} placeholder={hint} className="mt-1.5 h-11 w-full rounded-xl border border-border px-3 font-normal outline-none focus:border-primary disabled:bg-muted/50" />
                          ) : (
                            <textarea aria-label={label} rows={2} maxLength={2000} value={(profile[key] as string | null | undefined) ?? ""} disabled={declined} onChange={(event) => updateField(key, event.target.value)} placeholder={hint} className="mt-1.5 w-full resize-y rounded-xl border border-border px-3 py-2.5 font-normal outline-none focus:border-primary disabled:bg-muted/50" />
                          )}
                          <label className="mt-2 flex items-center gap-2 text-xs font-normal text-muted-foreground"><input type="checkbox" checked={declined} onChange={(event) => setNotProvided(key, event.target.checked)} />Không muốn cung cấp</label>
                        </div>;
                      })}
                    </div>

                    <label className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-cream/60 p-4 text-sm leading-6">
                      <input type="checkbox" checked={saveConsent} onChange={(event) => setSaveConsent(event.target.checked)} className="mt-1" />
                      <span><strong>Cho phép lưu hồ sơ để dùng lần sau.</strong> Nếu không tích, nội dung bạn vừa nhập chỉ dùng cho yêu cầu hiện tại. Nếu đã có hồ sơ được lưu trước đây, bỏ tích không xóa bản đó; bạn có thể xóa riêng bên dưới.</span>
                    </label>
                    {hasSavedProfile && <button type="button" disabled={profileBusy} onClick={() => void deleteProfile()} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" />Xóa hồ sơ đã lưu</button>}
                    {saveConsent && <button type="button" disabled={profileBusy} onClick={(event) => void saveProfileFromButton(event)} className="mt-3 ml-4 inline-flex items-center gap-2 text-xs font-semibold text-primary disabled:opacity-50"><Save className="h-4 w-4" />Lưu hồ sơ</button>}

                    {overview?.premiumActive && overview.geminiConfigured ? (
                      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                        <input type="checkbox" required checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} className="mt-1" />
                        <span><strong>Đồng ý gửi thông tin sức khỏe đã nhập và danh sách sản phẩm/dinh dưỡng cho Google Gemini để tạo gợi ý.</strong> Không gửi tên, email hoặc ID tài khoản. Yêu cầu API tắt lưu tương tác (`store=false`). Chỉ sử dụng API key thuộc dự án Google đã bật thanh toán; theo điều khoản Google, dữ liệu API trả phí không được dùng để cải thiện sản phẩm. <Link to="/privacy" className="font-bold underline">Xem chính sách quyền riêng tư</Link>.</span>
                      </label>
                    ) : overview?.premiumActive ? <p className="mt-5 rounded-2xl border border-border bg-cream/60 p-4 text-sm leading-6 text-muted-foreground">Gemini chưa được cấu hình. Gợi ý sẽ chỉ dùng quy tắc dinh dưỡng và dữ liệu sản phẩm; thông tin không được gửi sang dịch vụ AI.</p> : null}
                    {overview?.premiumActive && <p className="mt-3 text-xs leading-5 text-muted-foreground">Gợi ý là thông tin dinh dưỡng phổ thông, không chẩn đoán hay điều trị. Quy tắc chỉ loại sản phẩm khi từ khóa dị ứng khớp; hãy xác minh nguy cơ dị ứng và tương tác thuốc với chuyên gia.</p>}
                    {profileMessage && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{profileMessage}</p>}
                    {overview?.premiumActive && <button type="submit" disabled={recommendBusy || (overview.geminiConfigured && !aiConsent)} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl gt-gradient text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                      {recommendBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {recommendBusy ? "Đang tạo gợi ý…" : "Đề xuất trái cây phù hợp"}
                    </button>}
                  </form>
                )}
              </section>
            </div>
            {recommendations && <section className="mt-6 rounded-3xl border border-border bg-white p-6 gt-shadow-soft sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Kết quả cá nhân hóa</p><h2 className="mt-1 text-2xl font-extrabold">Gợi ý trái cây</h2></div><span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold">{recommendations.aiEnhanced ? "Quy tắc + AI" : "Quy tắc dinh dưỡng"}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{recommendations.message}</p>
              {recommendations.recommendations.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{recommendations.recommendations.map((item) => <article key={item.productId} className="rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="text-2xl">{item.emoji}</p><h3 className="mt-2 font-bold">{item.displayName}</h3><p className="text-xs text-muted-foreground">{item.fruitName} · {item.shopName}</p></div><p className="shrink-0 text-sm font-bold text-primary">{money(item.pricePerKg)}/kg</p></div>
                <p className="mt-4 text-sm leading-6">{item.reason}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Lưu ý: {item.caution}</p>
                <a href={item.productUrl} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cream px-4 py-2.5 text-sm font-bold text-primary">Xem sản phẩm <ArrowRight className="h-4 w-4" /></a>
              </article>)}</div> : <p className="mt-5 rounded-2xl bg-cream p-5 text-sm">{recommendations.message}</p>}
              <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">{recommendations.safetyNote}</p>
            </section>}
          </>
        )}
      </Section>
    </SiteShell>
  );
}
