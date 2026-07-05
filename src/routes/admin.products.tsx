import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Eye, EyeOff, Check, Award, Tag } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  FilterBar,
  StatusBadge,
  SectionCard,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const PRODUCTS = [
  { emoji: "🍎", name: "Táo Fuji Nhật Bản", shop: "Trái Cây Tươi HN", price: 165000, unit: "kg", stock: 124, score: 96, status: "Đang bán", tag: "Chất lượng cao" },
  { emoji: "🥭", name: "Xoài cát Hòa Lộc", shop: "Fruit Mart SG", price: 89000, unit: "kg", stock: 78, score: 92, status: "Đang bán", tag: "Giá tốt" },
  { emoji: "🍇", name: "Nho mẫu đơn Hàn Quốc", shop: "Trái Cây Tươi HN", price: 420000, unit: "kg", stock: 22, score: 94, status: "Sắp hết", tag: null },
  { emoji: "🍓", name: "Dâu tây Đà Lạt", shop: "Vườn Quê ĐN", price: 145000, unit: "hộp", stock: 0, score: 88, status: "Hết hàng", tag: null },
  { emoji: "🥑", name: "Bơ sáp Đắk Lắk", shop: "Hoa Quả Sạch CT", price: 72000, unit: "kg", stock: 156, score: 90, status: "Đang bán", tag: "Giá tốt" },
  { emoji: "🍊", name: "Cam sành Hà Giang", shop: "Vựa Mộc Châu", price: 38000, unit: "kg", stock: 320, score: 85, status: "Đang bán", tag: null },
  { emoji: "🍌", name: "Chuối Laba Lâm Đồng", shop: "Vườn Quê ĐN", price: 28000, unit: "kg", stock: 95, score: 82, status: "Ẩn", tag: null },
  { emoji: "🍑", name: "Đào Sapa", shop: "Vựa Mộc Châu", price: 68000, unit: "kg", stock: 47, score: 87, status: "Đang bán", tag: null },
];

function AdminProducts() {
  const [filter, setFilter] = useState("Tất cả");
  const filtered = PRODUCTS.filter((p) => filter === "Tất cả" || p.status === filter);

  return (
    <AdminShell title="Quản lý sản phẩm" subtitle={`${PRODUCTS.length} sản phẩm trên hệ thống`}>
      <FilterBar>
        <div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm sản phẩm..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm font-medium">
          <option>Tất cả loại trái cây</option><option>Táo</option><option>Xoài</option><option>Nho</option><option>Dâu</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm font-medium">
          <option>Tất cả cửa hàng</option><option>Trái Cây Tươi HN</option><option>Fruit Mart SG</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm font-medium">
          <option>Khoảng giá</option><option>{"< 50K"}</option><option>50K - 150K</option><option>{"> 150K"}</option>
        </select>
        <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm font-medium">
          <option>Điểm chất lượng</option><option>90+</option><option>80-89</option><option>{"< 80"}</option>
        </select>
        {["Tất cả", "Đang bán", "Sắp hết", "Hết hàng", "Ẩn"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`h-9 px-3 rounded-lg text-sm font-semibold ${
              filter === s ? "gt-gradient text-white" : "bg-muted text-foreground/70 hover:bg-muted/70"
            }`}
          >
            {s}
          </button>
        ))}
      </FilterBar>

      <SectionCard title={`Sản phẩm (${filtered.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">Hình</th>
              <th className="py-2 pr-3">Tên trái cây</th>
              <th className="py-2 pr-3">Cửa hàng</th>
              <th className="py-2 pr-3 text-right">Giá</th>
              <th className="py-2 pr-3 text-right">Tồn kho</th>
              <th className="py-2 pr-3 text-right">Điểm CL</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {filtered.map((p, i) => (
            <tr key={i} className="hover:bg-muted/30">
              <td className="py-3 pr-3">
                <div className="h-11 w-11 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-2xl">{p.emoji}</div>
              </td>
              <td className="py-3 pr-3">
                <div className="font-semibold">{p.name}</div>
                {p.tag && (
                  <span className="inline-flex mt-0.5 items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">
                    {p.tag}
                  </span>
                )}
              </td>
              <td className="py-3 pr-3 text-muted-foreground">{p.shop}</td>
              <td className="py-3 pr-3 text-right font-extrabold">
                {p.price.toLocaleString("vi-VN")}₫<span className="text-xs text-muted-foreground font-normal">/{p.unit}</span>
              </td>
              <td className="py-3 pr-3 text-right">
                <span className={p.stock === 0 ? "text-red-600 font-semibold" : p.stock < 30 ? "text-orange-600 font-semibold" : ""}>{p.stock}</span>
              </td>
              <td className="py-3 pr-3 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                  p.score >= 90 ? "bg-green-100 text-green-700" : p.score >= 80 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>{p.score}</span>
              </td>
              <td className="py-3 pr-3"><StatusBadge status={p.status} /></td>
              <td className="py-3 pr-3">
                <div className="flex items-center justify-end gap-1">
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem"><Eye className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-green-50 text-green-600" title="Duyệt"><Check className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-orange-50 text-orange-600" title='Gắn nhãn "Giá tốt"'><Tag className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-yellow-50 text-yellow-600" title='Gắn nhãn "Chất lượng cao"'><Award className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground" title="Ẩn"><EyeOff className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>
    </AdminShell>
  );
}