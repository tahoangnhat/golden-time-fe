import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit3, Eye, EyeOff, Trash2, Star, Grid3x3, List, X } from "lucide-react";
import { PartnerShell, StatusBadge } from "@/components/PartnerShell";
import { FruitThumb } from "@/components/FruitThumb";

export const Route = createFileRoute("/shop/products")({
  head: () => ({ meta: [{ title: "Sản phẩm — Golden Time Partner" }] }),
  component: Products,
});

const PRODUCTS = [
  { emoji: "🍎", name: "Táo Fuji", type: "Trái cây nhập khẩu", price: 49000, stock: 32, score: 92, status: "Đang bán" },
  { emoji: "🍊", name: "Cam sành", type: "Trái cây nội", price: 35000, stock: 20, score: 88, status: "Đang bán" },
  { emoji: "🥭", name: "Xoài cát", type: "Trái cây nội", price: 65000, stock: 15, score: 90, status: "Đang bán" },
  { emoji: "🍌", name: "Chuối già", type: "Trái cây nội", price: 28000, stock: 40, score: 85, status: "Đang bán" },
  { emoji: "🍇", name: "Nho mẫu đơn", type: "Nhập khẩu", price: 199000, stock: 6, score: 94, status: "Sắp hết" },
  { emoji: "🍓", name: "Dâu Đà Lạt", type: "Hữu cơ", price: 120000, stock: 0, score: 91, status: "Hết hàng" },
];

function Products() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [showForm, setShowForm] = useState(false);

  return (
    <PartnerShell
      title="Quản lý sản phẩm"
      subtitle="28 sản phẩm đang hiển thị trên Golden Time"
      actions={
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex gap-1 bg-white border border-border rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                view === "grid" ? "gt-gradient text-white" : "text-foreground/70"
              }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Thẻ
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                view === "table" ? "gt-gradient text-white" : "text-foreground/70"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Bảng
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center gap-1.5 gt-shadow"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>
      }
    >
      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl p-3 border border-border gt-shadow-soft">
              <div className="relative">
                <FruitThumb emoji={p.emoji} size="lg" className="!h-32 !w-full !rounded-xl !text-6xl" />
                <span className="absolute top-2 left-2 text-[10px] bg-white/95 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 text-primary fill-primary" /> {p.score}
                </span>
                <div className="absolute top-2 right-2"><StatusBadge status={p.status} /></div>
              </div>
              <div className="mt-3">
                <h4 className="font-bold text-sm">{p.name}</h4>
                <p className="text-[11px] text-muted-foreground">{p.type}</p>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-base font-extrabold text-[oklch(0.45_0.17_145)]">
                    {p.price.toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-[11px] text-muted-foreground">Tồn: {p.stock}kg</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <button className="h-8 rounded-lg bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] text-xs font-semibold flex items-center justify-center gap-1">
                  <Edit3 className="h-3 w-3" /> Sửa
                </button>
                <button className="h-8 rounded-lg bg-muted text-foreground/70 text-xs font-semibold flex items-center justify-center">
                  <EyeOff className="h-3 w-3" />
                </button>
                <button className="h-8 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-center">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-[oklch(0.97_0.04_95)] text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Sản phẩm</th>
                <th className="text-left p-3">Loại</th>
                <th className="text-right p-3">Giá bán</th>
                <th className="text-right p-3">Tồn kho</th>
                <th className="text-center p-3">Quality</th>
                <th className="text-center p-3">Trạng thái</th>
                <th className="text-right p-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PRODUCTS.map((p) => (
                <tr key={p.name} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <FruitThumb emoji={p.emoji} />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.type}</td>
                  <td className="p-3 text-right font-bold text-[oklch(0.45_0.17_145)]">
                    {p.price.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="p-3 text-right">{p.stock}kg</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold">
                      <Star className="h-3 w-3 text-primary fill-primary" /> {p.score}
                    </span>
                  </td>
                  <td className="p-3 text-center"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] text-xs font-semibold inline-flex items-center gap-1">
                      <Edit3 className="h-3 w-3" /> Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <AddProductDrawer onClose={() => setShowForm(false)} />}
    </PartnerShell>
  );
}

function AddProductDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-white overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-extrabold">Thêm sản phẩm mới</h3>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Tên sản phẩm" placeholder="VD: Táo Fuji nhập khẩu Nhật Bản" />
          <Field label="Loại trái cây" placeholder="Trái cây nhập khẩu" />
          <div>
            <label className="text-xs font-semibold">Hình ảnh sản phẩm</label>
            <div className="mt-1 h-32 border-2 border-dashed border-border rounded-xl grid place-items-center text-muted-foreground text-sm bg-[oklch(0.98_0.02_100)]">
              Kéo & thả ảnh hoặc bấm để chọn
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá / kg (VNĐ)" placeholder="49.000" />
            <Field label="Số lượng tồn (kg)" placeholder="30" />
          </div>
          <Field label="Mô tả ngắn" placeholder="Táo Fuji nhập khẩu, vị ngọt thanh, giòn..." textarea />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nguồn gốc" placeholder="Aomori, Nhật Bản" />
            <Field label="Ngày nhập hàng" placeholder="20/06/2026" type="date" />
          </div>
          <div>
            <label className="text-xs font-semibold">Trạng thái sản phẩm</label>
            <select className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-white text-sm">
              <option>Đang bán</option>
              <option>Tạm ẩn</option>
              <option>Sắp hết</option>
            </select>
          </div>
          <Field label="Ghi chú bảo quản" placeholder="Bảo quản 5-8°C, dùng tốt nhất trong 7 ngày" textarea />
        </div>
        <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-border font-semibold text-sm">
            Hủy
          </button>
          <button onClick={onClose} className="flex-1 h-11 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow">
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  textarea,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
        />
      )}
    </div>
  );
}