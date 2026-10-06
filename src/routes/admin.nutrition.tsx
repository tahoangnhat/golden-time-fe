import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, AdminTable, SectionCard } from "@/components/AdminShell";
import { api, type AdminNutrition } from "@/lib/api";

export const Route = createFileRoute("/admin/nutrition")({ component: AdminNutrition });

function AdminNutrition() {
  const [fruits, setFruits] = useState<AdminNutrition[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { api.adminNutrition().then(setFruits).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu dinh dưỡng.")); }, []);
  return <AdminShell title="Cơ sở dữ liệu dinh dưỡng" subtitle="Giá trị đang có trong cơ sở dữ liệu; ô trống là chưa có nguồn dữ liệu.">
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title={`Loại trái cây (${fruits.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Trái cây</th><th className="py-2 pr-3 text-right">Calories / 100g</th><th className="py-2 pr-3 text-right">Vitamin C (mg)</th><th className="py-2 pr-3 text-right">Chất xơ (g)</th><th className="py-2 pr-3 text-right">Đường (g)</th><th className="py-2 pr-3 text-right">Kali (mg)</th><th className="py-2 pr-3 text-right">Nước (%)</th></>}>
        {fruits.map((fruit) => <tr key={fruit.id}><td className="py-3 pr-3 font-semibold">{fruit.emoji} {fruit.name}</td><td className="py-3 pr-3 text-right">{fruit.calories ?? "—"}</td><td className="py-3 pr-3 text-right">{fruit.vitaminC ?? "—"}</td><td className="py-3 pr-3 text-right">{fruit.fiber ?? "—"}</td><td className="py-3 pr-3 text-right">{fruit.sugar ?? "—"}</td><td className="py-3 pr-3 text-right">{fruit.potassium ?? "—"}</td><td className="py-3 pr-3 text-right">{fruit.water ?? "—"}</td></tr>)}
        {!error && fruits.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Chưa có loại trái cây trong cơ sở dữ liệu.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
