import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";
import { api, type WalletSummary, type WalletTransaction } from "@/lib/api";

export const Route = createFileRoute("/business/wallet")({ head: () => ({ meta: [{ title: "Ví cửa hàng — Golden Time Business" }] }), component: BusinessWallet });

const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const entryLabel = (type: WalletTransaction["entryType"]) => ({ ORDER_SALE: "Tiền hàng đã thu", COMMISSION_FEE: "Hoa hồng sàn", PAYOUT: "Sàn đã thanh toán" })[type];

function BusinessWallet() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.shopWallet(), api.shopWalletTransactions()])
      .then(([summary, history]) => { setWallet(summary); setTransactions(history); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được ví cửa hàng."))
      .finally(() => setLoading(false));
  }, []);

  return <BusinessShell title="Ví cửa hàng" subtitle="Theo dõi doanh thu đã thu, hoa hồng và các lần sàn thanh toán">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">Đang tải số dư…</div> : wallet && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Số dư chờ thanh toán</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.balance)}</p><p className="mt-1 text-xs text-muted-foreground">Sàn sẽ thanh toán theo chính sách đối soát.</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Doanh thu đã thu</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.grossSales)}</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Hoa hồng đã khấu trừ</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.commissions)}</p></article>
        <article className="rounded-2xl border border-border bg-white p-5"><p className="text-sm text-muted-foreground">Đã được thanh toán</p><p className="mt-2 text-2xl font-extrabold">{money(wallet.payouts)}</p></article>
      </section>
      <section className="mt-4 rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-primary"><WalletCards className="h-5 w-5" /></span><div><h2 className="font-bold">Mức hoa hồng hiện tại: {wallet.commissionRate}%</h2><p className="text-sm text-muted-foreground">{wallet.commissionTier === "NEW_SHOP" ? "Ưu đãi cửa hàng mới tính từ ngày được duyệt; sau tháng đầu tiên mức phí tự chuyển thành 5%." : wallet.commissionTier === "LARGE_PARTNER" ? "Mức dành cho đối tác lớn." : wallet.commissionTier === "CUSTOM" ? "Mức phí riêng do Admin thiết lập." : "Mức phí tiêu chuẩn."}</p></div></div>
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
