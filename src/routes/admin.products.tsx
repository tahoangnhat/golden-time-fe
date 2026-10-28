import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { AdminShell, AdminTable, FilterBar, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminProduct } from "@/lib/api";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const approvalLabel: Record<string, string> = {
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  NEEDS_CORRECTION: "Cần bổ sung",
};

function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.adminProducts().then(setProducts).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.")); }, []);
  const filtered = useMemo(() => products
    .filter((product) => `${product.name} ${product.shop} ${product.category ?? ""} ${product.productOrigin ?? ""} ${product.supplierName ?? ""} ${product.lotCode ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((left, right) => Number(right.approvalStatus === "PENDING_REVIEW") - Number(left.approvalStatus === "PENDING_REVIEW")), [products, query]);
  const pendingCount = products.filter((product) => product.approvalStatus === "PENDING_REVIEW").length;

  async function decide(product: AdminProduct, approved: boolean) {
    const note = notes[product.id]?.trim() ?? "";
    if (!approved && !note) { setError(`Hãy ghi rõ thông tin cần bổ sung cho sản phẩm “${product.name}”.`); return; }
    setBusyId(product.id);
    setError("");
    try {
      const decision = await api.decideAdminProduct(product.id, approved, note || undefined);
      setProducts((current) => current.map((item) => item.id === product.id
        ? { ...item, status: decision.status, approvalStatus: decision.approvalStatus, reviewNote: decision.reviewNote }
        : item));
      setNotes((current) => { const next = { ...current }; delete next[product.id]; return next; });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không lưu được quyết định duyệt sản phẩm."); }
    finally { setBusyId(null); }
  }

  return <AdminShell title="Quản lý sản phẩm" subtitle={`${pendingCount} sản phẩm chờ duyệt · ${products.length} sản phẩm trên hệ thống`}>
    <FilterBar><div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg bg-[oklch(0.97_0.04_95)] px-3"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm, cửa hàng hoặc xuất xứ..." className="flex-1 bg-transparent text-sm outline-none" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title={`Sản phẩm (${filtered.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Sản phẩm</th><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3">Truy xuất nguồn gốc</th><th className="py-2 pr-3 text-right">Giá / tồn</th><th className="py-2 pr-3">Duyệt</th><th className="py-2 pr-3">Thao tác</th></>}>
        {filtered.map((product) => <tr key={product.id} className="align-top hover:bg-muted/30">
          <td className="py-3 pr-3"><span className="mr-2 text-xl">{product.emoji}</span><span className="font-semibold">{product.name}</span><p className="mt-1 text-xs text-muted-foreground">{product.category ?? "—"}</p></td>
          <td className="py-3 pr-3 text-muted-foreground">{product.shop}</td>
          <td className="max-w-72 py-3 pr-3 text-xs"><p><strong>Xuất xứ:</strong> {product.productOrigin || "—"}</p><p className="mt-1"><strong>Nhà cung cấp:</strong> {product.supplierName || "—"}</p><p className="mt-1"><strong>Mã lô:</strong> <span className="font-mono">{product.lotCode || "—"}</span></p><p className="mt-1"><strong>Chứng từ:</strong> {product.traceabilityProof && /^https?:\/\//i.test(product.traceabilityProof) ? <a href={product.traceabilityProof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-emerald-800 underline">Mở hồ sơ <ExternalLink className="h-3 w-3 shrink-0" /></a> : product.traceabilityProof || "—"}</p></td>
          <td className="whitespace-nowrap py-3 pr-3 text-right"><strong>{product.price.toLocaleString("vi-VN")}₫</strong><p className="mt-1 text-xs text-muted-foreground">{Number(product.stock).toLocaleString("vi-VN")} kg</p></td>
          <td className="py-3 pr-3"><StatusBadge status={approvalLabel[product.approvalStatus] ?? product.approvalStatus} />{product.reviewNote && <p className="mt-2 max-w-48 text-xs text-amber-800">{product.reviewNote}</p>}</td>
          <td className="min-w-56 py-3 pr-3">{product.approvalStatus === "PENDING_REVIEW" ? <div className="space-y-2"><textarea rows={2} maxLength={4000} value={notes[product.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [product.id]: event.target.value }))} placeholder="Nội dung cần Business bổ sung nếu chưa duyệt…" className="w-full rounded-lg border border-border px-2 py-1.5 text-xs" /><div className="flex flex-wrap gap-2"><button type="button" disabled={busyId === product.id} onClick={() => void decide(product, false)} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-50">{busyId === product.id ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} Yêu cầu bổ sung</button><button type="button" disabled={busyId === product.id} onClick={() => void decide(product, true)} className="inline-flex items-center gap-1 rounded-lg gt-gradient px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3 w-3" /> Duyệt để bán</button></div></div> : <span className="text-xs text-muted-foreground">{product.approvalStatus === "APPROVED" ? "Sản phẩm đã được phép bán" : "Business cần sửa hồ sơ rồi gửi lại"}</span>}</td>
        </tr>)}
        {!error && filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chưa có sản phẩm.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
