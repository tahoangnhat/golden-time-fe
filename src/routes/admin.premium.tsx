import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Crown, LoaderCircle, Search, Users } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { api, type AdminPremiumOverview } from "@/lib/api";

export const Route = createFileRoute("/admin/premium")({
  head: () => ({ meta: [{ title: "Quản lý Premium — Golden Time Admin" }] }),
  component: AdminPremium,
});

const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const paymentLabels: Record<string, string> = { PENDING: "Đang chờ", PAID: "Đã thanh toán", CANCELLED: "Đã hủy", EXPIRED: "Hết hạn" };

function AdminPremium() {
  const [overview, setOverview] = useState<AdminPremiumOverview | null>(null);
  const [price, setPrice] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"MEMBERS" | "PAYMENTS">("MEMBERS");
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.adminPremiumOverview(), api.adminPremiumPrice()])
      .then(([data, setting]) => {
        if (!active) return;
        setOverview(data);
        setPrice(String(setting.priceVnd));
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu Premium."); })
      .finally(() => { if (active) { setLoading(false); setPriceLoading(false); } });
    return () => { active = false; };
  }, []);

  const members = useMemo(() => overview?.members.filter((member) =>
    `${member.userId} ${member.fullName} ${member.email}`.toLowerCase().includes(query.toLowerCase())), [overview, query]);
  const payments = useMemo(() => overview?.paymentHistory.filter((payment) =>
    `${payment.orderCode} ${payment.userId} ${payment.fullName} ${payment.email} ${payment.reference ?? ""}`.toLowerCase().includes(query.toLowerCase())), [overview, query]);

  async function savePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(price);
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > 999_999_999) {
      setError("Nhập giá nguyên từ 0 đến 999.999.999 VND.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await api.updateAdminPremiumPrice(amount);
      setPrice(String(saved.priceVnd));
      setNotice(saved.priceVnd === 0 ? "Đã tạm dừng bán gói Premium." : "Đã cập nhật giá Premium.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật giá Premium.");
    } finally { setBusy(false); }
  }

  return <AdminShell title="Quản lý Premium" subtitle="Theo dõi hội viên, giao dịch và giá gói Premium">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-border bg-white p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Crown className="h-4 w-4 text-primary" />Hội viên đang hoạt động</div><p className="mt-2 text-2xl font-extrabold">{loading ? "—" : overview?.membership.activeMembers ?? 0}</p></article>
      <article className="rounded-2xl border border-border bg-white p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 text-primary" />Tổng hội viên đã đăng ký</div><p className="mt-2 text-2xl font-extrabold">{loading ? "—" : overview?.membership.totalMembers ?? 0}</p></article>
      <article className="rounded-2xl border border-border bg-white p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><CreditCard className="h-4 w-4 text-primary" />Giao dịch thành công</div><p className="mt-2 text-2xl font-extrabold">{loading ? "—" : overview?.payments.paidCount ?? 0}</p><p className="mt-1 text-xs text-muted-foreground">{loading ? "" : `${overview?.payments.pendingCount ?? 0} giao dịch đang chờ`}</p></article>
      <article className="rounded-2xl border border-border bg-white p-5"><div className="text-sm text-muted-foreground">Doanh thu Premium</div><p className="mt-2 text-2xl font-extrabold">{loading ? "—" : money(overview?.payments.paidRevenue ?? 0)}</p></article>
    </section>

    <section className="mt-4 rounded-2xl border border-border bg-white p-5">
      <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-primary"><Crown className="h-5 w-5" /></span><div><h2 className="font-extrabold">Gói Premium · 30 ngày</h2><p className="mt-1 text-sm text-muted-foreground">Thanh toán một lần qua PayOS. Đặt giá bằng 0 để tạm dừng việc mua gói; các gói hiện có vẫn giữ nguyên hạn dùng.</p></div></div>
      <form onSubmit={(event) => void savePrice(event)} className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-semibold">Giá bán (VND)<input type="number" min="0" max="999999999" step="1" required disabled={priceLoading} value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 font-normal outline-none focus:border-primary" /></label>
        <button type="submit" disabled={busy || priceLoading} className="h-11 rounded-xl gt-gradient px-4 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Đang lưu…" : "Lưu giá"}</button>
      </form>
    </section>

    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("MEMBERS")} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "MEMBERS" ? "gt-gradient text-white" : "border border-border bg-white"}`}>Hội viên ({overview?.members.length ?? 0})</button>
          <button type="button" onClick={() => setTab("PAYMENTS")} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "PAYMENTS" ? "gt-gradient text-white" : "border border-border bg-white"}`}>Lịch sử thanh toán ({overview?.paymentHistory.length ?? 0})</button>
        </div>
        <label className="flex h-10 min-w-56 flex-1 items-center gap-2 rounded-xl bg-cream px-3 sm:max-w-sm"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, email, mã giao dịch…" className="w-full bg-transparent text-sm outline-none" /></label>
      </div>
      {tab === "MEMBERS" ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Thành viên</th><th className="p-3">Trạng thái</th><th className="p-3">Hết hạn</th><th className="p-3">Thanh toán gần nhất</th></tr></thead><tbody className="divide-y divide-border">
        {members?.map((member) => { const active = new Date(member.expiresAt).getTime() > Date.now(); return <tr key={member.userId}><td className="p-3"><b>{member.fullName}</b><p className="text-xs text-muted-foreground">{member.email} · ID {member.userId}</p></td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{active ? "Đang hoạt động" : "Đã hết hạn"}</span></td><td className="p-3">{new Date(member.expiresAt).toLocaleString("vi-VN")}</td><td className="p-3">{member.lastPaymentOrderCode ? `#${member.lastPaymentOrderCode}` : "—"}</td></tr>; })}
        {loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Đang tải hội viên…</td></tr>}
        {!loading && !members?.length && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có hội viên Premium phù hợp.</td></tr>}
      </tbody></table></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Giao dịch</th><th className="p-3">Thành viên</th><th className="p-3 text-right">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Tham chiếu PayOS</th><th className="p-3">Thời gian</th></tr></thead><tbody className="divide-y divide-border">
        {payments?.map((payment) => <tr key={payment.orderCode}><td className="p-3 font-mono">#{payment.orderCode}</td><td className="p-3"><b>{payment.fullName}</b><p className="text-xs text-muted-foreground">{payment.email}</p></td><td className="p-3 text-right font-semibold">{money(payment.amountVnd)}</td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === "PAID" ? "bg-green-50 text-green-700" : payment.status === "PENDING" ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600"}`}>{paymentLabels[payment.status] ?? payment.status}</span></td><td className="p-3 text-xs text-muted-foreground">{payment.reference || "—"}</td><td className="p-3 text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString("vi-VN")}{payment.paidAt && <p className="text-green-700">Đã trả lúc {new Date(payment.paidAt).toLocaleString("vi-VN")}</p>}</td></tr>)}
        {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Đang tải giao dịch…</td></tr>}
        {!loading && !payments?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Chưa có giao dịch Premium phù hợp.</td></tr>}
      </tbody></table></div>}
    </section>
    <p className="mt-3 text-xs text-muted-foreground">Trang này hiển thị thông tin tài khoản, hạn Premium và giao dịch. Hồ sơ sức khỏe người dùng không được Admin xem tại đây.</p>
  </AdminShell>;
}
