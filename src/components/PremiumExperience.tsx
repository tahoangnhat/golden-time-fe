import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Bot, Check, Crown, LoaderCircle, MessageCircle, Send, ShieldCheck, Trash2 } from "lucide-react";
import { api, type PremiumChatTurn, type PremiumHealthProfile, type PremiumRecommendationResponse } from "@/lib/api";

type ProfileField = "ageGroup" | "heightCm" | "weightKg" | "allergies" | "chronicConditions" | "medications" | "healthGoals";
type HealthForm = Record<ProfileField, string>;
type Screen = "assessment" | "recommendations" | "chat";

const emptyForm: HealthForm = {
  ageGroup: "", heightCm: "", weightKg: "", allergies: "", chronicConditions: "", medications: "", healthGoals: "",
};

const fields: { key: ProfileField; label: string; hint: string; multiline?: boolean }[] = [
  { key: "ageGroup", label: "Nhóm tuổi", hint: "Chọn nhóm tuổi" },
  { key: "heightCm", label: "Chiều cao (cm)", hint: "Ví dụ: 165" },
  { key: "weightKg", label: "Cân nặng (kg)", hint: "Ví dụ: 55" },
  { key: "allergies", label: "Dị ứng", hint: "Liệt kê loại trái cây hoặc thực phẩm bạn dị ứng", multiline: true },
  { key: "chronicConditions", label: "Bệnh nền", hint: "Thông tin bạn muốn chia sẻ", multiline: true },
  { key: "medications", label: "Thuốc đang dùng", hint: "Thông tin bạn muốn chia sẻ", multiline: true },
  { key: "healthGoals", label: "Mục tiêu", hint: "Ví dụ: ăn đa dạng hơn, bổ sung chất xơ", multiline: true },
];

function formFromProfile(profile: PremiumHealthProfile): HealthForm {
  return {
    ageGroup: profile.ageGroup ?? "",
    heightCm: profile.heightCm?.toString() ?? "",
    weightKg: profile.weightKg?.toString() ?? "",
    allergies: profile.allergies ?? "",
    chronicConditions: profile.chronicConditions ?? "",
    medications: profile.medications ?? "",
    healthGoals: profile.healthGoals ?? "",
  };
}

function profileFromForm(form: HealthForm, declined: string[]): PremiumHealthProfile {
  const value = (key: ProfileField) => declined.includes(key) ? null : form[key].trim() || null;
  const numberValue = (key: "heightCm" | "weightKg") => {
    const raw = value(key);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };
  return {
    ageGroup: value("ageGroup"),
    heightCm: numberValue("heightCm"),
    weightKg: numberValue("weightKg"),
    allergies: value("allergies"),
    chronicConditions: value("chronicConditions"),
    medications: value("medications"),
    healthGoals: value("healthGoals"),
    notProvidedFields: declined,
  };
}

export function PremiumExperience({ onBack, geminiConfigured }: { onBack: () => void; geminiConfigured: boolean }) {
  const [screen, setScreen] = useState<Screen>("assessment");
  const [form, setForm] = useState<HealthForm>(emptyForm);
  const [declined, setDeclined] = useState<string[]>([]);
  const [savedProfileExists, setSavedProfileExists] = useState(false);
  const [saveConsent, setSaveConsent] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeProfile, setActiveProfile] = useState<PremiumHealthProfile | null>(null);
  const [recommendation, setRecommendation] = useState<PremiumRecommendationResponse | null>(null);
  const [chat, setChat] = useState<PremiumChatTurn[]>([]);
  const [chatDraft, setChatDraft] = useState("");

  useEffect(() => {
    let active = true;
    api.premiumHealthProfile().then((profile) => {
      if (!active || !profile) return;
      setForm(formFromProfile(profile));
      setDeclined(profile.notProvidedFields ?? []);
      setSavedProfileExists(true);
      setSaveConsent(true);
    }).catch(() => {}).finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, []);

  function updateField(key: ProfileField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleDeclined(key: ProfileField) {
    setDeclined((current) => current.includes(key) ? current.filter((field) => field !== key) : [...current, key]);
    if (!declined.includes(key)) setForm((current) => ({ ...current, [key]: "" }));
  }

  async function deleteSavedProfile() {
    setBusy(true);
    setError("");
    try {
      await api.deletePremiumHealthProfile();
      setSavedProfileExists(false);
      setSaveConsent(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa hồ sơ sức khỏe đã lưu.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const profile = profileFromForm(form, declined);
    try {
      const result = await api.premiumRecommendations({
        profile,
        consentToAi: aiConsent,
        saveProfileConsent: saveConsent,
      });
      setActiveProfile(profile);
      setRecommendation(result);
      setScreen("recommendations");
      if (saveConsent) setSavedProfileExists(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa thể tạo gợi ý trái cây.");
    } finally {
      setBusy(false);
    }
  }

  async function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = chatDraft.trim();
    if (!message || !activeProfile || busy) return;
    setChatDraft("");
    setError("");
    setBusy(true);
    try {
      const result = await api.premiumChat({
        profile: activeProfile,
        history: chat.slice(-12),
        message,
        consentToAi: aiConsent,
        recommendedProductIds: recommendation?.recommendations.map((item) => item.productId) ?? [],
      });
      setChat((current) => [...current, { role: "user", content: message }, { role: "assistant", content: result.answer }]);
    } catch (cause) {
      setChat((current) => [...current, { role: "user", content: message }]);
      setError(cause instanceof Error ? cause.message : "Chat Premium chưa thể trả lời lúc này.");
    } finally {
      setBusy(false);
    }
  }

  const pageTitle = screen === "assessment" ? "Bài test sức khỏe" : screen === "recommendations" ? "Gợi ý cho bạn" : "Chat với Golden Time";
  return (
    <div className="px-5 pb-6">
      <button type="button" onClick={screen === "assessment" ? onBack : () => setScreen(screen === "chat" ? "recommendations" : "assessment")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> {screen === "assessment" ? "Quay lại cá nhân" : screen === "chat" ? "Quay lại gợi ý" : "Sửa bài test"}
      </button>

      <section className="mb-4 rounded-3xl border border-green-200 bg-gradient-to-br from-cream via-white to-green-50 p-5 gt-shadow-soft">
        <div className="flex items-center gap-2 text-primary"><Crown className="h-5 w-5" /><span className="text-xs font-extrabold uppercase tracking-wide">Golden Time Premium</span></div>
        <h1 className="mt-2 text-xl font-extrabold">{pageTitle}</h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Gợi ý trái cây dựa trên thông tin bạn tự nguyện cung cấp và sản phẩm đang bán, còn hàng.</p>
      </section>

      {screen === "assessment" && profileLoading ? <div className="rounded-2xl border border-border bg-white p-5 text-sm text-muted-foreground">Đang tải hồ sơ sức khỏe…</div> : screen === "assessment" && <form onSubmit={submitAssessment} className="space-y-4">
        <section className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
          <h2 className="font-extrabold">Thông tin sức khỏe</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Tất cả trường đều tùy chọn. Bạn có thể bỏ trống hoặc chọn “Không muốn cung cấp”.</p>
          <div className="mt-4 space-y-4">
            {fields.map(({ key, label, hint, multiline }) => {
              const declinedValue = declined.includes(key);
              return <div key={key}>
                <label htmlFor={`premium-${key}`} className="mb-1.5 block text-xs font-bold">{label}</label>
                {key === "ageGroup" ? (
                  <select id={`premium-${key}`} value={form.ageGroup} disabled={declinedValue} onChange={(event) => updateField(key, event.target.value)} className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary disabled:bg-muted">
                    <option value="">Không muốn trả lời hoặc chọn sau</option>
                    <option value="Dưới 18">Dưới 18 tuổi</option>
                    <option value="18-30">18–30 tuổi</option>
                    <option value="31-45">31–45 tuổi</option>
                    <option value="46-60">46–60 tuổi</option>
                    <option value="Trên 60">Trên 60 tuổi</option>
                  </select>
                ) : multiline ? (
                  <textarea id={`premium-${key}`} value={form[key]} disabled={declinedValue} onChange={(event) => updateField(key, event.target.value)} placeholder={hint} maxLength={2000} rows={2} className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-muted" />
                ) : (
                  <input id={`premium-${key}`} type="number" min={key === "heightCm" ? 30 : 1} max={key === "heightCm" ? 250 : 500} step="any" value={form[key]} disabled={declinedValue} onChange={(event) => updateField(key, event.target.value)} placeholder={hint} className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary disabled:bg-muted" />
                )}
                <label className="mt-2 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                  <input type="checkbox" checked={declinedValue} onChange={() => toggleDeclined(key)} className="accent-green-700" />
                  Không muốn cung cấp thông tin này
                </label>
              </div>;
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
          <label className="flex items-start gap-2.5 text-xs leading-5">
            <input type="checkbox" checked={saveConsent} onChange={(event) => setSaveConsent(event.target.checked)} className="mt-0.5 accent-green-700" />
            <span><strong>Lưu hồ sơ sức khỏe để tự điền lần sau.</strong> Hồ sơ được mã hóa; bạn có thể sửa tại đây hoặc xóa bất cứ lúc nào.</span>
          </label>
          <label className="flex items-start gap-2.5 text-xs leading-5">
            <input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} className="mt-0.5 accent-green-700" />
            <span><strong>Đồng ý dùng Gemini.</strong> Chỉ các trường sức khỏe đã nhập, nội dung câu hỏi chat và dữ liệu sản phẩm cần thiết được gửi tới Gemini. Không gửi tên, email hay ID tài khoản. Nếu bỏ chọn, bài test vẫn tạo gợi ý theo quy tắc; chat AI cần lựa chọn này.</span>
          </label>
          <div className="flex items-start gap-2 rounded-xl bg-cream p-3 text-[11px] leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Lịch sử chat chỉ giữ tạm trong phiên Premium đang mở và không được lưu vào tài khoản Golden Time.</div>
          {savedProfileExists && <button type="button" onClick={() => void deleteSavedProfile()} disabled={busy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" /> Xóa hồ sơ đã lưu</button>}
        </section>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl gt-gradient px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {busy ? "Đang phân tích…" : "Xem gợi ý trái cây"}
        </button>
      </form>}

      {screen === "recommendations" && <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
          <div className="flex items-center justify-between gap-2"><h2 className="font-extrabold">Trái cây phù hợp</h2><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">{recommendation?.aiEnhanced ? "GỢI Ý GEMINI" : "GỢI Ý THEO QUY TẮC"}</span></div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{recommendation?.message}</p>
          <div className="mt-3 space-y-3">
            {recommendation?.recommendations.map((item) => <article key={item.productId} className="rounded-xl border border-border p-3">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-xl">{item.emoji}</span><div className="min-w-0 flex-1"><h3 className="font-bold text-sm">{item.displayName}</h3><p className="text-[11px] text-muted-foreground">{item.shopName} · còn {Number(item.stockKg).toLocaleString("vi-VN")} kg</p><p className="mt-1 text-sm font-extrabold text-primary">{item.pricePerKg.toLocaleString("vi-VN")}₫/kg</p></div></div>
              <p className="mt-2 text-xs leading-5">{item.reason}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.caution}</p>
              <a href={item.productUrl} className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-cream px-3 text-xs font-bold text-primary">Xem sản phẩm</a>
            </article>)}
          </div>
          <p className="mt-3 rounded-xl bg-cream p-3 text-[11px] leading-5 text-muted-foreground">{recommendation?.safetyNote}</p>
        </section>
        <button type="button" onClick={() => setScreen("chat")} disabled={!geminiConfigured} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl gt-gradient px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle className="h-4 w-4" /> Chat với trợ lý Gemini</button>
        {!geminiConfigured && <p className="text-xs leading-5 text-muted-foreground">Chat hiện chưa khả dụng vì máy chủ chưa báo Gemini đã cấu hình.</p>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
      </div>}

      {screen === "chat" && <div className="flex min-h-[58dvh] flex-col rounded-2xl border border-border bg-white p-4 gt-shadow-soft">
        <div className="flex items-center gap-2 border-b border-border pb-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cream text-primary"><Bot className="h-5 w-5" /></span><div><h2 className="font-extrabold text-sm">Trợ lý trái cây Golden Time</h2><p className="text-[10px] text-muted-foreground">Chỉ tham khảo dinh dưỡng và sản phẩm</p></div></div>
        <label className="mt-3 flex items-start gap-2.5 rounded-xl bg-cream p-3 text-xs leading-5"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} className="mt-0.5 accent-green-700" /><span>{aiConsent ? "Bạn đã đồng ý gửi các trường sức khỏe đã nhập, câu hỏi và vài lượt chat gần nhất tới Gemini. Bỏ chọn để dừng gửi các tin nhắn tiếp theo." : "Đồng ý gửi các trường sức khỏe đã nhập, câu hỏi và vài lượt chat gần nhất tới Gemini để trả lời. Không gửi tên, email hoặc ID tài khoản; Golden Time không lưu lịch sử chat vào tài khoản."}</span></label>
        {aiConsent && chat.length === 0 && <p className="mt-4 rounded-2xl bg-cream p-3 text-xs leading-5 text-muted-foreground">Bạn có thể hỏi về dinh dưỡng trái cây, gợi ý vừa nhận hoặc sản phẩm đang bán. Chat không chẩn đoán bệnh hay hướng dẫn thay đổi thuốc.</p>}
        <div className="flex-1 space-y-3 overflow-y-auto py-3">
          {chat.map((turn, index) => <div key={`${index}-${turn.role}`} className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-xs leading-5 whitespace-pre-wrap ${turn.role === "user" ? "ml-auto bg-green-700 text-white" : "bg-cream text-foreground"}`}>{turn.content}</div>)}
          {busy && <p className="inline-flex items-center gap-2 rounded-2xl bg-cream px-3 py-2.5 text-xs text-muted-foreground"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Gemini đang trả lời…</p>}
        </div>
        {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{error}</p>}
        <form onSubmit={sendChat} className="flex items-end gap-2 border-t border-border pt-3">
          <textarea value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} maxLength={2000} rows={2} disabled={!aiConsent || busy} placeholder={aiConsent ? "Nhập câu hỏi…" : "Đồng ý dùng Gemini để bắt đầu chat"} className="min-h-11 flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-muted" />
          <button type="submit" disabled={!aiConsent || busy || !chatDraft.trim()} aria-label="Gửi câu hỏi" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gt-gradient text-white disabled:opacity-50"><Send className="h-4 w-4" /></button>
        </form>
        <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{recommendation?.safetyNote}</p>
      </div>}
    </div>
  );
}
