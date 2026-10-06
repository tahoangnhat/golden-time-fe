import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, AdminTable, FilterBar, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminProduct } from "@/lib/api";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api.adminProducts().then(setProducts).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.")); }, []);
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.shop} ${product.category ?? ""}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  return <AdminShell title="Quản lý sản phẩm" subtitle={`${products.length} sản phẩm trên hệ thống`}>
    <FilterBar><div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm hoặc cửa hàng..." className="flex-1 bg-transparent outline-none text-sm" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title={`Sản phẩm (${filtered.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Trái cây</th><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3 text-right">Giá / kg</th><th className="py-2 pr-3 text-right">Tồn kho (kg)</th><th className="py-2 pr-3 text-right">Điểm CL</th><th className="py-2 pr-3">Trạng thái</th></>}>
        {filtered.map((product) => <tr key={product.id} className="hover:bg-muted/30"><td className="py-3 pr-3"><span className="mr-2 text-xl">{product.emoji}</span><span className="font-semibold">{product.name}</span></td><td className="py-3 pr-3 text-muted-foreground">{product.shop}</td><td className="py-3 pr-3 text-right font-bold">{product.price.toLocaleString("vi-VN")}₫</td><td className="py-3 pr-3 text-right">{Number(product.stock).toLocaleString("vi-VN")}</td><td className="py-3 pr-3 text-right">{product.score ?? "—"}</td><td className="py-3 pr-3"><StatusBadge status={product.status} /></td></tr>)}
        {!error && filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chưa có sản phẩm.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
