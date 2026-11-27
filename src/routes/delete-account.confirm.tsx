import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { Section, SiteShell } from "@/components/SiteShell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/delete-account/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Xác nhận xóa tài khoản — Golden Time" }] }),
  component: ConfirmDeleteAccountPage,
});

function ConfirmDeleteAccountPage() {
  const { token } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (!token || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.confirmAccountDeletion(token);
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xác nhận yêu cầu xóa tài khoản.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <Section className="max-w-2xl">
        <div className="rounded-[2rem] border border-border bg-white p-6 text-center shadow-sm sm:p-10">
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${done ? "bg-green-50 text-green-700" : "bg-cream text-primary"}`}>
            {done ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>
          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">{done ? "Đã xóa tài khoản" : "Xác nhận xóa tài khoản"}</h1>
          {done ? <>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Tài khoản Golden Time và dữ liệu cá nhân liên quan đã được xóa. Bạn có thể đóng trang này.</p>
            <Link to="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl gt-gradient px-5 text-sm font-bold text-white">Về trang chủ</Link>
          </> : <>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Xác nhận sẽ xóa tài khoản và dữ liệu cá nhân liên quan. Một số thông tin đơn hàng có thể được giữ ở dạng ẩn danh để đối soát hoặc đáp ứng nghĩa vụ pháp lý.</p>
            {!token && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Liên kết không có mã xác nhận. Hãy gửi lại yêu cầu xóa tài khoản.</p>}
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="button" onClick={() => void confirm()} disabled={!token || busy} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {busy ? "Đang xóa tài khoản…" : "Xác nhận xóa tài khoản"}
            </button>
            <Link to="/delete-account" className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4">Gửi lại yêu cầu</Link>
          </>}
        </div>
      </Section>
    </SiteShell>
  );
}
