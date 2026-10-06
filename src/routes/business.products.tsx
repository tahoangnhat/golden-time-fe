import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BusinessShell, StatusBadge } from "@/components/BusinessShell";
import { FruitThumb } from "@/components/FruitThumb";
import { api, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/products")({ head: () => ({ meta: [{ title: "Sản phẩm — Golden Time Business" }] }), component: Products });

function Products() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.shopProducts().then(setProducts).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.")); }, []);
  return <BusinessShell title="Sản phẩm cửa hàng" subtitle={`${products.length} sản phẩm trong dữ liệu cửa hàng`}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Sản phẩm</th><th className="text-left p-3">Loại</th><th className="text-right p-3">Giá / kg</th><th className="text-right p-3">Tồn (kg)</th><th className="text-right p-3">Điểm chất lượng</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Mã lô</th></tr></thead><tbody className="divide-y divide-border">
      {products.map((product) => <tr key={product.id}><td className="p-3"><div className="flex items-center gap-2"><FruitThumb emoji={product.emoji} /><span className="font-semibold">{product.displayName}</span></div></td><td className="p-3">{product.category || product.fruitName}</td><td className="p-3 text-right font-bold">{product.pricePerKg.toLocaleString("vi-VN")}đ</td><td className="p-3 text-right">{Number(product.stockKg).toLocaleString("vi-VN")}</td><td className="p-3 text-right">{product.aiScore ?? "—"}</td><td className="p-3"><StatusBadge status={product.status} /></td><td className="p-3 font-mono text-xs">{product.batchCode || "—"}</td></tr>)}
      {!error && products.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Cửa hàng chưa có sản phẩm.</td></tr>}
    </tbody></table></div>
  </BusinessShell>;
}
