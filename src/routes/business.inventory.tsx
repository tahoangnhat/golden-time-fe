import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BusinessShell } from "@/components/BusinessShell";
import { FruitThumb } from "@/components/FruitThumb";
import { api, type ShopProduct } from "@/lib/api";

export const Route = createFileRoute("/business/inventory")({ head: () => ({ meta: [{ title: "Tồn kho — Golden Time Business" }] }), component: Inventory });

function Inventory() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.shopProducts().then(setProducts).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được tồn kho.")); }, []);
  const totalStock = products.reduce((sum, product) => sum + Number(product.stockKg), 0);
  const soldOut = products.filter((product) => Number(product.stockKg) <= 0).length;
  return <BusinessShell title="Quản lý tồn kho" subtitle="Tồn kho lấy trực tiếp từ dữ liệu sản phẩm">
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid sm:grid-cols-2 gap-3 mb-4"><div className="rounded-2xl bg-white p-4 border border-border"><p className="text-xs text-muted-foreground">Tổng tồn hiện tại</p><p className="text-2xl font-extrabold mt-1">{totalStock.toLocaleString("vi-VN")} kg</p></div><div className="rounded-2xl bg-white p-4 border border-border"><p className="text-xs text-muted-foreground">Sản phẩm hết hàng</p><p className="text-2xl font-extrabold mt-1">{soldOut}</p></div></div>
    <div className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto"><table className="w-full text-sm min-w-[600px]"><thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Sản phẩm</th><th className="text-right p-3">Tồn hiện tại</th><th className="text-right p-3">Giá bán / kg</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Mã lô</th></tr></thead><tbody className="divide-y divide-border">{products.map((product) => <tr key={product.id}><td className="p-3"><div className="flex items-center gap-3"><FruitThumb emoji={product.emoji} /><span className="font-semibold">{product.displayName}</span></div></td><td className="p-3 text-right font-bold">{Number(product.stockKg).toLocaleString("vi-VN")} kg</td><td className="p-3 text-right">{product.pricePerKg.toLocaleString("vi-VN")}đ</td><td className="p-3">{product.status}</td><td className="p-3 font-mono text-xs">{product.batchCode || "—"}</td></tr>)}{!error && products.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Cửa hàng chưa có tồn kho.</td></tr>}</tbody></table></div>
  </BusinessShell>;
}
