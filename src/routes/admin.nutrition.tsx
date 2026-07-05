import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  SectionCard,
  Modal,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/nutrition")({
  component: AdminNutrition,
});

const NUTRITION = [
  { emoji: "🍎", name: "Táo Fuji", calories: 52, vitamin: "C, K, B6", fiber: 2.4, sugar: 10.4, benefits: "Tốt cho tim mạch, hỗ trợ tiêu hóa" },
  { emoji: "🥭", name: "Xoài cát Hòa Lộc", calories: 60, vitamin: "A, C, E", fiber: 1.6, sugar: 13.7, benefits: "Tăng đề kháng, đẹp da" },
  { emoji: "🍇", name: "Nho mẫu đơn", calories: 67, vitamin: "C, K", fiber: 0.9, sugar: 16.0, benefits: "Chống oxy hóa, tốt cho mắt" },
  { emoji: "🍓", name: "Dâu tây", calories: 32, vitamin: "C, B9", fiber: 2.0, sugar: 4.9, benefits: "Giảm cân, làm đẹp da" },
  { emoji: "🥑", name: "Bơ sáp", calories: 160, vitamin: "K, E, B5", fiber: 6.7, sugar: 0.7, benefits: "Tốt cho não bộ, tim mạch" },
  { emoji: "🍊", name: "Cam sành", calories: 47, vitamin: "C, B1", fiber: 2.4, sugar: 9.4, benefits: "Tăng đề kháng, ngừa cảm cúm" },
];

function AdminNutrition() {
  const [edit, setEdit] = useState<typeof NUTRITION[number] | null>(null);
  const [add, setAdd] = useState(false);

  return (
    <AdminShell
      title="Cơ sở dữ liệu dinh dưỡng"
      subtitle="Quản lý thông tin dinh dưỡng cho từng loại trái cây"
      actions={
        <button onClick={() => setAdd(true)} className="h-9 px-4 rounded-lg gt-gradient text-white text-sm font-semibold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm trái cây
        </button>
      }
    >
      <SectionCard title={`Trái cây trong CSDL (${NUTRITION.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">Trái cây</th>
              <th className="py-2 pr-3 text-right">Calories</th>
              <th className="py-2 pr-3">Vitamin</th>
              <th className="py-2 pr-3 text-right">Chất xơ (g)</th>
              <th className="py-2 pr-3 text-right">Đường (g)</th>
              <th className="py-2 pr-3">Lợi ích sức khỏe</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {NUTRITION.map((n) => (
            <tr key={n.name} className="hover:bg-muted/30">
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-[oklch(0.97_0.04_95)] grid place-items-center text-xl">{n.emoji}</div>
                  <span className="font-semibold">{n.name}</span>
                </div>
              </td>
              <td className="py-3 pr-3 text-right font-bold">{n.calories} kcal</td>
              <td className="py-3 pr-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">{n.vitamin}</span></td>
              <td className="py-3 pr-3 text-right">{n.fiber}</td>
              <td className="py-3 pr-3 text-right">{n.sugar}</td>
              <td className="py-3 pr-3 text-sm text-muted-foreground max-w-xs">{n.benefits}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => setEdit(n)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>

      <Modal open={!!edit || add} onClose={() => { setEdit(null); setAdd(false); }} title={edit ? `Chỉnh sửa: ${edit.name}` : "Thêm trái cây mới"}>
        <form className="grid grid-cols-2 gap-4">
          <Field label="Tên trái cây" defaultValue={edit?.name} placeholder="VD: Táo Fuji" />
          <Field label="Emoji / Icon" defaultValue={edit?.emoji} placeholder="🍎" />
          <Field label="Calories (kcal/100g)" type="number" defaultValue={edit?.calories} />
          <Field label="Chất xơ (g)" type="number" defaultValue={edit?.fiber} />
          <Field label="Đường tự nhiên (g)" type="number" defaultValue={edit?.sugar} />
          <Field label="Vitamin chính" defaultValue={edit?.vitamin} placeholder="C, K, B6" />
          <div className="col-span-2">
            <label className="text-xs font-semibold">Lợi ích sức khỏe</label>
            <textarea
              rows={3}
              defaultValue={edit?.benefits}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => { setEdit(null); setAdd(false); }} className="h-10 px-4 rounded-xl border border-border font-semibold text-sm">Hủy</button>
            <button type="submit" className="h-10 px-4 rounded-xl gt-gradient text-white font-semibold text-sm">Lưu thay đổi</button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full h-10 px-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]"
      />
    </label>
  );
}