import { useEffect, useState, type FormEvent } from "react";
import { Bot, Crown, LoaderCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { api, hasAuth, type PremiumChatTurn, type PremiumHealthProfile } from "@/lib/api";
import {
  appendPremiumAssistantMessage,
  bindPremiumAssistantOwner,
  PREMIUM_MEMBERSHIP_UPDATED_EVENT,
  readPremiumAssistantSession,
  setPremiumAssistantConsent,
  setPremiumAssistantContext,
} from "@/lib/premiumAssistantSession";

const emptyProfile: PremiumHealthProfile = {
  ageGroup: null,
  heightCm: null,
  weightKg: null,
  allergies: null,
  chronicConditions: null,
  medications: null,
  healthGoals: null,
  notProvidedFields: [],
};

const starterPrompts = [
  "Trái cây nào giàu chất xơ?",
  "Gợi ý món ăn nhẹ với trái cây",
  "Giải thích gợi ý của tôi",
];

export function PremiumAssistantFloat({ bottomNavVisible = true }: { bottomNavVisible?: boolean }) {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [profile, setProfile] = useState<PremiumHealthProfile | null>(() => readPremiumAssistantSession().profile);
  const [recommendedProductIds, setRecommendedProductIds] = useState<number[]>(() => readPremiumAssistantSession().recommendedProductIds);
  const [messages, setMessages] = useState<PremiumChatTurn[]>(() => readPremiumAssistantSession().messages);
  const [aiConsent, setAiConsent] = useState(() => readPremiumAssistantSession().aiConsent);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [safetyNote, setSafetyNote] = useState("");

  useEffect(() => {
    const inAndroidApp = new URLSearchParams(window.location.search).get("platform") === "android"
      || window.sessionStorage.getItem("golden-time-platform") === "android";
    if (!inAndroidApp || !hasAuth()) return;

    let active = true;
    const refreshMembership = () => {
      Promise.all([api.premiumStatus(), api.me()]).then(([status, user]) => {
        if (!active) return;
        bindPremiumAssistantOwner(user.id);
        setAvailable(status.premiumActive);
        setGeminiConfigured(status.geminiConfigured);
      }).catch(() => {
        if (active) setAvailable(false);
      });
    };
    refreshMembership();
    window.addEventListener(PREMIUM_MEMBERSHIP_UPDATED_EVENT, refreshMembership);
    window.addEventListener("focus", refreshMembership);
    return () => {
      active = false;
      window.removeEventListener(PREMIUM_MEMBERSHIP_UPDATED_EVENT, refreshMembership);
      window.removeEventListener("focus", refreshMembership);
    };
  }, []);

  function openAssistant() {
    const current = readPremiumAssistantSession();
    setMessages(current.messages);
    setAiConsent(current.aiConsent);
    setRecommendedProductIds(current.recommendedProductIds);
    if (current.profile) {
      setProfile(current.profile);
      setOpen(true);
      return;
    }

    setProfileLoading(true);
    setOpen(true);
    api.premiumHealthProfile().then((savedProfile) => {
      const currentProfile = readPremiumAssistantSession().profile ?? savedProfile ?? emptyProfile;
      setProfile(currentProfile);
      setPremiumAssistantContext(currentProfile, readPremiumAssistantSession().recommendedProductIds);
    }).catch(() => {
      setProfile(emptyProfile);
    }).finally(() => setProfileLoading(false));
  }

  function updateConsent(value: boolean) {
    setAiConsent(value);
    setPremiumAssistantConsent(value);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !profile || !aiConsent || busy || !geminiConfigured) return;
    const priorMessages = messages;
    const userTurn: PremiumChatTurn = { role: "user", content: message };
    setMessages((current) => [...current, userTurn]);
    appendPremiumAssistantMessage(userTurn);
    setDraft("");
    setError("");
    setBusy(true);
    try {
      const result = await api.premiumChat({
        profile,
        history: priorMessages.slice(-12),
        message,
        consentToAi: true,
        recommendedProductIds,
      });
      const assistantTurn: PremiumChatTurn = { role: "assistant", content: result.answer };
      setMessages((current) => [...current, assistantTurn]);
      appendPremiumAssistantMessage(assistantTurn);
      setSafetyNote(result.safetyNote);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Trợ lý AI chưa thể trả lời lúc này.");
    } finally {
      setBusy(false);
    }
  }

  if (!available) return null;

  return (
    <>
      {open && <>
        <button type="button" aria-label="Đóng khung chat" onClick={() => setOpen(false)} className="absolute inset-0 z-40 cursor-default bg-black/25" />
        <section role="dialog" aria-modal="true" aria-label="Trợ lý dinh dưỡng Golden Time" className={`absolute inset-x-3 top-3 ${bottomNavVisible ? "bottom-[5.5rem]" : "bottom-3"} z-50 flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl`}>
          <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl gt-gradient text-white"><Bot className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-extrabold">Trợ lý dinh dưỡng</h2>
              <p className="text-[10px] text-muted-foreground">Golden Time · Gemini</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[9px] font-bold text-green-700"><Crown className="h-3 w-3" /> PREMIUM</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng chat" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
          </header>

          <div className="shrink-0 border-b border-border px-4 py-3">
            {!geminiConfigured && <p role="status" className="mb-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-900">Gemini API chưa được cấu hình trên máy chủ.</p>}
            <label className="flex items-start gap-2 text-[10px] leading-4 text-muted-foreground">
              <input type="checkbox" checked={aiConsent} disabled={!geminiConfigured} onChange={(event) => updateConsent(event.target.checked)} className="mt-0.5 accent-green-700" />
              <span>{aiConsent ? "Đã đồng ý gửi thông tin sức khỏe đã nhập và nội dung chat tới Gemini. Bỏ chọn để dừng gửi tin nhắn tiếp theo." : "Đồng ý gửi các trường sức khỏe đã nhập, câu hỏi và vài lượt chat gần nhất tới Gemini. Không gửi tên, email hoặc ID tài khoản."}</span>
            </label>
            <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Chat chỉ lưu tạm trong phiên app, không lưu thành lịch sử tài khoản.</div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-cream/40 px-4 py-4">
            {profileLoading && <p className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-xs text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải hồ sơ…</p>}
            {aiConsent && messages.length === 0 && !profileLoading && <div className="max-w-[95%] rounded-2xl rounded-tl-md border border-border bg-white p-3 text-xs leading-5 shadow-sm"><p className="font-bold">Xin chào! Bạn muốn hỏi gì về trái cây?</p><p className="mt-1 text-muted-foreground">Bạn có thể chọn câu hỏi gợi ý hoặc nhập câu hỏi bên dưới.</p><div className="mt-3 flex flex-wrap gap-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => setDraft(prompt)} className="rounded-full border border-border bg-cream px-2.5 py-1.5 text-[10px] font-semibold">{prompt}</button>)}</div></div>}
            {messages.map((turn, index) => <div key={`${index}-${turn.role}`} className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-xs leading-5 shadow-sm ${turn.role === "user" ? "ml-auto rounded-br-md gt-gradient text-white" : "rounded-tl-md border border-border bg-white text-foreground"}`}>{turn.content}</div>)}
            {busy && <p className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-border bg-white px-3 py-2.5 text-xs text-muted-foreground"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Gemini đang trả lời…</p>}
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{error}</p>}
            {safetyNote && <p className="text-[10px] leading-4 text-muted-foreground">{safetyNote}</p>}
          </div>

          <form onSubmit={sendMessage} className="flex shrink-0 items-end gap-2 border-t border-border bg-white p-3">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} disabled={!geminiConfigured || !aiConsent || profileLoading || busy} placeholder={!geminiConfigured ? "Gemini chưa sẵn sàng" : aiConsent ? "Nhập câu hỏi…" : "Đồng ý để bắt đầu chat"} className="min-h-11 flex-1 resize-none rounded-2xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-muted" />
            <button type="submit" disabled={!geminiConfigured || !aiConsent || profileLoading || busy || !draft.trim()} aria-label="Gửi tin nhắn" className="grid h-11 w-11 shrink-0 place-items-center rounded-full gt-gradient text-white shadow-sm disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      </>}

      {!open && <button type="button" onClick={openAssistant} aria-label="Mở trợ lý AI Premium" className={`absolute ${bottomNavVisible ? "bottom-[5.75rem]" : "bottom-4"} right-4 z-40 grid h-14 w-14 place-items-center rounded-full border-4 border-white gt-gradient text-white shadow-xl`}>
        <Bot className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-primary shadow"><Sparkles className="h-3 w-3" /></span>
      </button>}
    </>
  );
}
