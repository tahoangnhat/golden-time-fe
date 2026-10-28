import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, Search, WalletCards } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { api, type WalletSummary, type WalletTransaction } from "@/lib/api";

export const Route = createFileRoute("/admin/wallets")({ head: () => ({ meta: [{ title: "Ví & hoa hồng — Golden Time Admin" }] }), component: AdminWallets });

const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const tierLabels: Record<WalletSummary["commissionTier"], string> = { NEW_SHOP: "Shop mới · miễn phí tháng đầu", STANDARD: "Thông thường · 5%", LARGE_PARTNER: "Đối tác lớn · 3%", CUSTOM: "Tùy chỉnh" };
const entryLabel = (type: WalletTransaction["entryType"]) => ({ ORDER_SALE: "Tiền hàng đã thu", COMMISSION_FEE: "Hoa hồng sàn", PAYOUT: "Đã thanh toán cho Shop" })[type];

function AdminWallets() {
  const [shops, setShops] = useState<WalletSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [tier, setTier] = useState<WalletSummary["commissionTier"]>("STANDARD");
  const [customRate, setCustomRate] = useState("");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = shops.find((shop) => shop.shopId === selectedId) ?? null;
  const filtered = useMemo(() => shops.filter((shop) => shop.shopName.toLowerCase().includes(query.toLowerCase())), [shops, query]);

  async function loadShops(preferredId?: number | null) {
    const rows = await api.adminWallets();
    setShops(rows);
    const nextId = preferredId ?? selectedId ?? rows[0]?.shopId ?? null;
    setSelectedId(rows.some((row) => row.shopId === nextId) ? nextId : rows[0]?.shopId ?? null);
  }

  useEffect(() => { void loadShops().catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được ví Shop.")).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!selected) { setTransactions([]); return; }
    let active = true;
    setTier(selected.commissionTier);
    setCustomRate(selected.commissionRate.toString());
    api.adminWalletTransactions(selected.shopId).then((rows) => { if (active) setTransactions(rows); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được lịch sử ví."); });
    return () => { active = false; };
  }, [selectedId, shops]);

  async function saveCommission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api.updateShopCommission(selected.shopId, { tier, customRate: tier === "CUSTOM" ? Number(customRate) : null });
      await loadShops(selected.shopId);
      setNotice("Đã cập nhật chính sách hoa hồng cho Shop.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được hoa hồng."); }
    finally { setBusy(false); }
  }

  async function recordPayout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api.recordShopPayout(selected.shopId, { amount: Math.round(Number(amount)), reference: reference.trim(), note: note.trim() });
      setAmount(""); setReference(""); setNote("");
      await Promise.all([loadShops(selected.shopId), api.adminWalletTransactions(selected.shopId).then(setTransactions)]);
      setNotice("Đã ghi nhận khoản thanh toán cho Shop.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không ghi nhận được khoản thanh toán."); }
    finally { setBusy(false); }
  }

  return <AdminShell title="Ví & hoa hồng Shop" subtitle="Theo dõi khoản phải trả, thiết lập phí dịch vụ và ghi nhận đối soát">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><h2 className="font-extrabold">Cửa hàng và số dư</h2><p className="text-sm text-muted-foreground">Số dư là doanh thu đã thu trừ hoa hồng và khoản đã chi.</p></div><label className="flex h-10 min-w-56 items-center gap-2 rounded-xl bg-cream px-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cửa hàng…" className="w-full bg-transparent text-sm outline-none" /></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Cửa hàng</th><th className="p-3">Chính sách</th><th className="p-3 text-right">Hoa hồng hiện tại</th><th className="p-3 text-right">Số dư phải trả</th><th className="p-3 text-right">Đã thanh toán</th></tr></thead><tbody className="divide-y divide-border">
        {filtered.map((shop) => <tr key={shop.shopId} onClick={() => setSelectedId(shop.shopId)} className={`cursor-pointer hover:bg-muted/30 ${selectedId === shop.shopId ? "bg-primary/5" : ""}`}><td className="p-3 font-semibold">{shop.shopName}</td><td className="p-3 text-muted-foreground">{tierLabels[shop.commissionTier]}</td><td className="p-3 text-right">{shop.commissionRate}%</td><td className="p-3 text-right font-bold">{money(shop.balance)}</td><td className="p-3 text-right">{money(shop.payouts)}</td></tr>)}
        {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Không có cửa hàng phù hợp.</td></tr>}
        {loading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Đang tải ví…</td></tr>}
      </tbody></table></div>
    </section>
    {selected && <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-primary"><WalletCards className="h-5 w-5" /></span><div><h2 className="font-extrabold">Hoa hồng · {selected.shopName}</h2><p className="text-sm text-muted-foreground">Mức hiện tại: {selected.commissionRate}%</p></div></div>
        <form onSubmit={saveCommission} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">Chính sách hoa hồng<select value={tier} onChange={(event) => setTier(event.target.value as WalletSummary["commissionTier"])} className="mt-1 h-11 w-full rounded-xl border border-border bg-white px-3 font-normal"><option value="NEW_SHOP">Shop mới · 0% tháng đầu, sau đó 5%</option><option value="STANDARD">Shop thông thường · 5%</option><option value="LARGE_PARTNER">Đối tác lớn · 3%</option><option value="CUSTOM">Tỷ lệ tùy chỉnh</option></select></label>
          {tier === "CUSTOM" && <label className="block text-sm font-semibold">Tỷ lệ tùy chỉnh (%)<input required type="number" min="0" max="100" step="0.01" value={customRate} onChange={(event) => setCustomRate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>}
          <p className="rounded-xl bg-cream p-3 text-xs text-muted-foreground">Ưu đãi Shop mới được tính từ ngày phê duyệt hồ sơ ({selected.approvedAt ? new Date(selected.approvedAt).toLocaleDateString("vi-VN") : "chưa có mốc duyệt"}). Mức hoa hồng của giao dịch đã ghi sổ không thay đổi khi Admin chỉnh chính sách.</p>
          <button disabled={busy} className="rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Đang lưu…" : "Lưu chính sách"}</button>
        </form>
      </section>
      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="font-extrabold">Ghi nhận thanh toán Shop</h2><p className="mt-1 text-sm text-muted-foreground">Số dư hiện có: <b>{money(selected.balance)}</b></p>
        <form onSubmit={recordPayout} className="mt-5 space-y-3">
          <label className="block text-sm font-semibold">Số tiền (₫)<input required type="number" min="1" max={selected.balance} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" /></label>
          <label className="block text-sm font-semibold">Mã giao dịch chuyển khoản<input maxLength={255} value={reference} onChange={(event) => setReference(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" placeholder="Mã tham chiếu ngân hàng (nếu có)" /></label>
          <label className="block text-sm font-semibold">Ghi chú<input maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 font-normal" placeholder="Kỳ đối soát / nội dung thanh toán" /></label>
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Chỉ ghi nhận sau khi sàn đã thực sự chuyển khoản cho Shop. MVP lưu sổ đối soát, chưa tự thực hiện chuyển khoản.</p>
          <button disabled={busy || selected.balance <= 0} className="rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Đang ghi nhận…" : "Ghi nhận đã thanh toán"}</button>
        </form>
      </section>
    </div>}
    {selected && <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-white"><div className="border-b border-border p-5"><h2 className="font-extrabold">Lịch sử · {selected.shopName}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Thời gian</th><th className="p-3">Giao dịch</th><th className="p-3">Tham chiếu</th><th className="p-3 text-right">Số tiền</th></tr></thead><tbody className="divide-y divide-border">{transactions.map((item) => <tr key={item.id}><td className="p-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</td><td className="p-3">{entryLabel(item.entryType)}{item.orderId ? ` · Đơn #${item.orderId}` : ""}<p className="text-xs text-muted-foreground">{item.description}</p></td><td className="p-3 text-xs text-muted-foreground">{item.externalReference || "—"}</td><td className={`p-3 text-right font-bold ${item.amount < 0 ? "text-red-700" : "text-green-700"}`}>{item.amount > 0 ? "+" : ""}{money(item.amount)}</td></tr>)}{transactions.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có giao dịch.</td></tr>}</tbody></table></div></section>}
  </AdminShell>;
}
