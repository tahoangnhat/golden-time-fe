import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, Search, WalletCards } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { api, type AdminWithdrawalRequest, type WalletSummary, type WalletTransaction } from "@/lib/api";

export const Route = createFileRoute("/admin/wallets")({ head: () => ({ meta: [{ title: "Ví & hoa hồng — Golden Time Admin" }] }), component: AdminWallets });

const money = (value: number) => `${value.toLocaleString("vi-VN")}₫`;
const tierLabels: Record<WalletSummary["commissionTier"], string> = { NEW_SHOP: "Shop mới · miễn phí tháng đầu", STANDARD: "Thông thường · 5%", LARGE_PARTNER: "Đối tác lớn · 3%", CUSTOM: "Tùy chỉnh" };
const entryLabel = (type: WalletTransaction["entryType"]) => ({ ORDER_SALE: "Tiền hàng đã thu", COMMISSION_FEE: "Hoa hồng sàn", PAYOUT: "Đã thanh toán cho Shop" })[type];
const withdrawalLabels: Record<AdminWithdrawalRequest["status"], string> = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt · chờ chuyển", REJECTED: "Đã từ chối", PAID: "Đã thanh toán", CANCELLED: "Đã hủy" };

function AdminWallets() {
  const [shops, setShops] = useState<WalletSummary[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRequest[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [tier, setTier] = useState<WalletSummary["commissionTier"]>("STANDARD");
  const [customRate, setCustomRate] = useState("");
  const [query, setQuery] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [transferReferences, setTransferReferences] = useState<Record<number, string>>({});
  const [transferNotes, setTransferNotes] = useState<Record<number, string>>({});
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

  async function loadWithdrawals() { setWithdrawals(await api.adminWithdrawalRequests()); }

  useEffect(() => {
    void Promise.all([loadShops(), loadWithdrawals()])
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu ví Shop."))
      .finally(() => setLoading(false));
  }, []);
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

  async function refreshWithdrawalData(shopId?: number) {
    const updates: Promise<unknown>[] = [loadWithdrawals(), loadShops(shopId)];
    if (shopId) updates.push(api.adminWalletTransactions(shopId).then(setTransactions));
    await Promise.all(updates);
  }

  async function approveWithdrawal(id: number, shopId: number) {
    setBusy(true); setError(""); setNotice("");
    try { await api.approveWithdrawalRequest(id); await refreshWithdrawalData(shopId); setNotice("Đã duyệt yêu cầu. Hãy chuyển khoản rồi ghi mã giao dịch để hoàn tất."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không duyệt được yêu cầu."); }
    finally { setBusy(false); }
  }

  async function rejectWithdrawal(event: FormEvent<HTMLFormElement>, id: number, shopId: number) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { await api.rejectWithdrawalRequest(id, rejectReason.trim()); setRejectReason(""); setRejectingId(null); await refreshWithdrawalData(shopId); setNotice("Đã từ chối yêu cầu; số tiền được trả lại số dư khả dụng của Shop."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không từ chối được yêu cầu."); }
    finally { setBusy(false); }
  }

  async function markWithdrawalPaid(event: FormEvent<HTMLFormElement>, id: number, shopId: number) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api.markWithdrawalRequestPaid(id, { reference: transferReferences[id]?.trim() ?? "", note: transferNotes[id]?.trim() });
      setTransferReferences((current) => ({ ...current, [id]: "" })); setTransferNotes((current) => ({ ...current, [id]: "" }));
      await refreshWithdrawalData(shopId); setNotice("Đã ghi nhận chuyển khoản; khoản rút đã được trừ khỏi ví Shop.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không ghi nhận được khoản đã chuyển."); }
    finally { setBusy(false); }
  }

  return <AdminShell title="Ví & hoa hồng Shop" subtitle="Duyệt yêu cầu rút tiền, theo dõi khoản phải trả và thiết lập phí dịch vụ">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <section className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border p-5"><h2 className="font-extrabold">Yêu cầu rút tiền của Shop</h2><p className="mt-1 text-sm text-muted-foreground">{withdrawals.filter((item) => item.status === "PENDING").length} yêu cầu đang chờ duyệt · chỉ ghi nhận đã trả sau khi chuyển khoản thực tế.</p></div>
      <div className="divide-y divide-border">
        {withdrawals.map((item) => <article key={item.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{item.shopName} · {money(item.amount)} <span className="ml-2 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-primary">{withdrawalLabels[item.status]}</span></p><p className="mt-1 text-sm text-muted-foreground">{item.bankName} ({item.bankCode}) · {item.accountName} · STK <strong className="text-foreground">{item.accountNumber}</strong></p><p className="text-xs text-muted-foreground">Yêu cầu lúc {new Date(item.requestedAt).toLocaleString("vi-VN")}</p></div>
            {item.status === "PENDING" && <button type="button" disabled={busy} onClick={() => void approveWithdrawal(item.id, item.shopId)} className="rounded-xl gt-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Duyệt yêu cầu</button>}
          </div>
          {item.status === "APPROVED" && <form onSubmit={(event) => void markWithdrawalPaid(event, item.id, item.shopId)} className="mt-4 grid gap-3 rounded-xl bg-cream p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><label className="text-sm font-semibold">Mã giao dịch ngân hàng<input required maxLength={255} value={transferReferences[item.id] ?? ""} onChange={(event) => setTransferReferences((current) => ({ ...current, [item.id]: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal" placeholder="Nhập mã sau khi đã chuyển tiền" /></label><label className="text-sm font-semibold">Ghi chú chuyển khoản<input maxLength={1000} value={transferNotes[item.id] ?? ""} onChange={(event) => setTransferNotes((current) => ({ ...current, [item.id]: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 font-normal" /></label><button disabled={busy} className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Xác nhận đã chuyển</button></form>}
          {item.status === "PENDING" && <div className="mt-3">{rejectingId === item.id ? <form onSubmit={(event) => void rejectWithdrawal(event, item.id, item.shopId)} className="flex flex-wrap gap-2"><input required maxLength={1000} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className="h-10 min-w-56 flex-1 rounded-lg border border-border px-3 text-sm" placeholder="Nhập lý do từ chối" /><button disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">Xác nhận từ chối</button><button type="button" onClick={() => { setRejectingId(null); setRejectReason(""); }} className="rounded-lg border border-border px-3 py-2 text-sm">Hủy</button></form> : <button type="button" disabled={busy} onClick={() => { setRejectingId(item.id); setRejectReason(""); }} className="text-sm font-semibold text-red-700 hover:underline">Từ chối yêu cầu</button>}</div>}
          {item.reviewNote && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Lý do từ chối: {item.reviewNote}</p>}
          {item.transferReference && <p className="mt-3 text-xs text-muted-foreground">Mã giao dịch: {item.transferReference}{item.transferNote ? ` · ${item.transferNote}` : ""}</p>}
        </article>)}
        {!loading && withdrawals.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Chưa có yêu cầu rút tiền nào.</p>}
        {loading && <p className="p-8 text-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Đang tải yêu cầu…</p>}
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><h2 className="font-extrabold">Cửa hàng và số dư</h2><p className="text-sm text-muted-foreground">Số dư khả dụng đã trừ các yêu cầu rút đang chờ xử lý.</p></div><label className="flex h-10 min-w-56 items-center gap-2 rounded-xl bg-cream px-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cửa hàng…" className="w-full bg-transparent text-sm outline-none" /></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Cửa hàng</th><th className="p-3">Chính sách</th><th className="p-3 text-right">Hoa hồng hiện tại</th><th className="p-3 text-right">Khả dụng</th><th className="p-3 text-right">Đang chờ rút</th><th className="p-3 text-right">Đã thanh toán</th></tr></thead><tbody className="divide-y divide-border">
        {filtered.map((shop) => <tr key={shop.shopId} onClick={() => setSelectedId(shop.shopId)} className={`cursor-pointer hover:bg-muted/30 ${selectedId === shop.shopId ? "bg-primary/5" : ""}`}><td className="p-3 font-semibold">{shop.shopName}</td><td className="p-3 text-muted-foreground">{tierLabels[shop.commissionTier]}</td><td className="p-3 text-right">{shop.commissionRate}%</td><td className="p-3 text-right font-bold">{money(shop.availableBalance)}</td><td className="p-3 text-right">{money(shop.reservedAmount)}</td><td className="p-3 text-right">{money(shop.payouts)}</td></tr>)}
        {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Không có cửa hàng phù hợp.</td></tr>}
        {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Đang tải ví…</td></tr>}
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
      <section className="rounded-2xl border border-border bg-white p-5"><h2 className="font-extrabold">Đối soát rút tiền</h2><p className="mt-2 text-sm text-muted-foreground">Mở yêu cầu ở phần trên để duyệt hoặc ghi nhận sau khi chuyển khoản. Số dư khả dụng: <b>{money(selected.availableBalance)}</b>; đang giữ: <b>{money(selected.reservedAmount)}</b>.</p></section>
    </div>}
    {selected && <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-white"><div className="border-b border-border p-5"><h2 className="font-extrabold">Lịch sử · {selected.shopName}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-cream text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Thời gian</th><th className="p-3">Giao dịch</th><th className="p-3">Tham chiếu</th><th className="p-3 text-right">Số tiền</th></tr></thead><tbody className="divide-y divide-border">{transactions.map((item) => <tr key={item.id}><td className="p-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</td><td className="p-3">{entryLabel(item.entryType)}{item.orderId ? ` · Đơn #${item.orderId}` : ""}<p className="text-xs text-muted-foreground">{item.description}</p></td><td className="p-3 text-xs text-muted-foreground">{item.externalReference || "—"}</td><td className={`p-3 text-right font-bold ${item.amount < 0 ? "text-red-700" : "text-green-700"}`}>{item.amount > 0 ? "+" : ""}{money(item.amount)}</td></tr>)}{transactions.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có giao dịch.</td></tr>}</tbody></table></div></section>}
  </AdminShell>;
}
