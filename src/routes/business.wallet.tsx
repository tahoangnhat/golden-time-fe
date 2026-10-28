import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { WalletCards } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type ShopWithdrawalRequest, type WalletSummary, type WalletTransaction } from "@/lib/api";

export const Route = createFileRoute("/business/wallet")({ head: () => ({ meta: [{ title: "Ví cửa hàng — Golden Time Business" }] }), component: BusinessWallet });

const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const entryLabel = (type: WalletTransaction["entryType"]) => ({ ORDER_SALE: "Tiền hàng đã thu", COMMISSION_FEE: "Hoa hồng sàn", PAYOUT: "Đã rút về ngân hàng" })[type];
const withdrawalLabels: Record<ShopWithdrawalRequest["status"], string> = { PENDING: "Chờ Admin duyệt", APPROVED: "Đã duyệt · chờ chuyển khoản", REJECTED: "Bị từ chối", PAID: "Đã chuyển khoản", CANCELLED: "Đã hủy" };

function BusinessWallet() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<ShopWithdrawalRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [summary, history, requests] = await Promise.all([api.shopWallet(), api.shopWalletTransactions(), api.shopWithdrawalRequests()]);
    setWallet(summary); setTransactions(history); setWithdrawals(requests);
  }

  useEffect(() => {
    void reload().catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được ví cửa hàng."))
      .finally(() => setLoading(false));
  }, []);

  async function submitWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api.createShopWithdrawalRequest({ amount: Math.round(Number(amount)), bankCode: bankCode.trim(), bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() });
      setAmount(""); setBankCode(""); setBankName(""); setAccountNumber(""); setAccountName("");
      await reload(); setNotice("Đã gửi yêu cầu rút tiền. Số tiền đang chờ duyệt được giữ khỏi số dư khả dụng.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không gửi được yêu cầu rút tiền."); }
    finally { setBusy(false); }
  }

  async function cancelWithdrawal(id: number) {
    setBusy(true); setError(""); setNotice("");
    try { await api.cancelShopWithdrawalRequest(id); await reload(); setNotice("Đã hủy yêu cầu rút tiền."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không hủy được yêu cầu."); }
    finally { setBusy(false); }
  }

  return <BusinessShell title="Ví cửa hàng" subtitle="Theo dõi số dư và gửi yêu cầu rút tiền về tài khoản doanh nghiệp">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {loading ? <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">Đang tải số dư…</div> : wallet && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Số dư khả dụng</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.availableBalance)}</p><p className="mt-1 text-xs text-muted-foreground">Có thể gửi yêu cầu rút.</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Đang chờ rút</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.reservedAmount)}</p><p className="mt-1 text-xs text-muted-foreground">Được giữ đến khi yêu cầu hoàn tất hoặc bị từ chối.</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Doanh thu đã thu</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.grossSales)}</p><p className="mt-1 text-xs text-muted-foreground">Đã trừ hoa hồng: {money(wallet.commissions)}</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Đã được thanh toán</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.payouts)}</p></article>
      </section>
      <section className="mt-4 rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-primary"><WalletCards className="h-5 w-5" /></span><div><h2 className="font-bold">Mức hoa hồng hiện tại: {wallet.commissionRate}%</h2><p className="text-sm text-muted-foreground">{wallet.commissionTier === "NEW_SHOP" ? "Ưu đãi cửa hàng mới tính từ ngày được duyệt; sau tháng đầu tiên mức phí tự chuyển thành 5%." : wallet.commissionTier === "LARGE_PARTNER" ? "Mức dành cho đối tác lớn." : wallet.commissionTier === "CUSTOM" ? "Mức phí riêng do Admin thiết lập." : "Mức phí tiêu chuẩn."}</p></div></div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={submitWithdrawal} className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-extrabold">Yêu cầu rút tiền</h2><p className="mt-1 text-sm text-muted-foreground">Số dư khả dụng hiện tại: <b>{money(wallet.availableBalance)}</b></p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold">Số tiền rút (₫)<input required type="number" min="1" max={wallet.availableBalance} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>
            <label className="block text-sm font-semibold">Mã ngân hàng / BIN<input required maxLength={32} value={bankCode} onChange={(event) => setBankCode(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" placeholder="Ví dụ: mã BIN ngân hàng" /></label>
            <label className="block text-sm font-semibold">Tên ngân hàng<input required maxLength={120} value={bankName} onChange={(event) => setBankName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>
            <label className="block text-sm font-semibold">Số tài khoản<input required maxLength={64} autoComplete="off" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>
            <label className="block text-sm font-semibold">Tên chủ tài khoản<input required maxLength={120} value={accountName} onChange={(event) => setAccountName(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>
            <p className="rounded-xl bg-cream p-3 text-xs text-muted-foreground">Admin sẽ duyệt yêu cầu và chuyển khoản thủ công. Kiểm tra kỹ thông tin tài khoản trước khi gửi.</p>
            <button disabled={busy || wallet.availableBalance <= 0} className="rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Đang gửi…" : "Gửi yêu cầu rút"}</button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-border p-5"><h2 className="font-extrabold">Yêu cầu rút tiền</h2><p className="mt-1 text-sm text-muted-foreground">Trạng thái và thông tin xử lý từ Admin.</p></div>
          <div className="divide-y divide-border">
            {withdrawals.map((item) => <article key={item.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold">{money(item.amount)} <span className="ml-2 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-primary">{withdrawalLabels[item.status]}</span></p><p className="mt-1 text-sm text-muted-foreground">{item.bankName} · {item.maskedAccountNumber} · {item.accountName}</p><p className="text-xs text-muted-foreground">Gửi {new Date(item.requestedAt).toLocaleString("vi-VN")}</p></div>{item.status === "PENDING" && <button type="button" disabled={busy} onClick={() => void cancelWithdrawal(item.id)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:opacity-50">Hủy yêu cầu</button>}</div>
              {item.reviewNote && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Phản hồi Admin: {item.reviewNote}</p>}
              {item.transferReference && <p className="mt-2 text-xs text-muted-foreground">Mã giao dịch: {item.transferReference}{item.transferNote ? ` · ${item.transferNote}` : ""}</p>}
            </article>)}
            {withdrawals.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Bạn chưa gửi yêu cầu rút tiền nào.</p>}
          </div>
        </section>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border p-5"><h2 className="font-extrabold">Lịch sử ví</h2><p className="mt-1 text-sm text-muted-foreground">Giao dịch mới nhất hiển thị trước.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Thời gian</th><th className="p-3">Nội dung</th><th className="p-3">Mã tham chiếu</th><th className="p-3 text-right">Số tiền</th></tr></thead><tbody className="divide-y divide-border">
          {transactions.map((item) => <tr key={item.id}><td className="p-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</td><td className="p-3">{entryLabel(item.entryType)}{item.orderId ? ` · Đơn #${item.orderId}` : ""}<p className="text-xs text-muted-foreground">{item.description}</p></td><td className="p-3 text-xs text-muted-foreground">{item.externalReference || "—"}</td><td className={`p-3 text-right font-bold ${item.amount < 0 ? "text-red-700" : "text-green-700"}`}>{item.amount > 0 ? "+" : ""}{money(item.amount)}</td></tr>)}
          {transactions.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Chưa có giao dịch ví.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </BusinessShell>;
}
