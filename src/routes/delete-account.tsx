import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { Section, SiteShell } from "@/components/SiteShell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Yêu cầu xóa tài khoản — Golden Time" },
      { name: "description", content: "Gửi yêu cầu xóa tài khoản Golden Time và dữ liệu cá nhân liên quan." },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await api.requestAccountDeletion(email.trim());
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <Section className="max-w-3xl">
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" /> Quyền riêng tư
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Yêu cầu xóa tài khoản</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            Nhập email đăng ký Golden Time. Chúng tôi sẽ gửi một liên kết xác nhận đến email đó; mở liên kết trong vòng 30 phút để hoàn tất yêu cầu.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold">
              Email tài khoản Golden Time
              <span className="relative mt-1.5 block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="email" required maxLength={255} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-border bg-white pl-10 pr-3 font-normal outline-none focus:border-primary" placeholder="ban@example.com" />
              </span>
            </label>
            {message && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-relaxed text-green-800">{message}</p>}
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {busy ? "Đang gửi yêu cầu…" : "Gửi yêu cầu xóa tài khoản"}
            </button>
          </form>

          <div className="mt-7 space-y-3 rounded-2xl bg-cream/70 p-4 text-sm leading-6 text-muted-foreground">
            <p><strong className="text-foreground">Dữ liệu sẽ được xóa:</strong> thông tin hồ sơ, số điện thoại, lịch sử quét và ảnh quét, đánh giá, hồ sơ sức khỏe Premium, voucher, thông báo và dữ liệu thanh toán Premium gắn với tài khoản.</p>
            <p><strong className="text-foreground">Thông tin có thể được giữ lại:</strong> một số dòng đơn hàng và số liệu giao dịch được giữ ở dạng đã gỡ thông tin nhận hàng để phục vụ đối soát, xử lý tranh chấp hoặc nghĩa vụ pháp lý.</p>
            <p>Liên kết xác nhận chỉ dùng một lần. Nếu bạn không gửi yêu cầu này, hãy bỏ qua email xác nhận. Để xóa ngay khi đang đăng nhập, mở <Link to="/profile" className="font-semibold text-primary underline underline-offset-4">Cá nhân → Cài đặt → Xóa tài khoản</Link>.</p>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Không truy cập được email đăng ký? <a href="mailto:nhatdeveloper04@gmail.com?subject=Yeu%20cau%20xoa%20tai%20khoan%20Golden%20Time" className="font-semibold text-primary underline underline-offset-4">Liên hệ hỗ trợ</a> từ địa chỉ email của tài khoản.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Xem thêm <Link to="/privacy" className="font-semibold text-primary underline underline-offset-4">Chính sách quyền riêng tư</Link>.</p>
        </div>
      </Section>
    </SiteShell>
  );
}
