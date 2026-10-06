import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";

export const Route = createFileRoute("/business/promotions")({ head: () => ({ meta: [{ title: "Khuyến mãi — Golden Time Business" }] }), component: Promotions });

function Promotions() {
  return <BusinessShell title="Khuyến mãi của cửa hàng" subtitle="Tính năng khuyến mãi chưa được hỗ trợ bởi API">
    <section className="max-w-2xl mx-auto bg-white rounded-2xl border border-border gt-shadow-soft p-8 text-center"><div className="mx-auto h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 grid place-items-center"><Tag className="h-5 w-5" /></div><h2 className="mt-4 font-extrabold text-lg">Chưa có chương trình khuyến mãi</h2><p className="mt-2 text-sm text-muted-foreground">Hệ thống chưa có dữ liệu hoặc API quản lý khuyến mãi. Khi chưa được kết nối, Golden Time không hiển thị chương trình mẫu.</p></section>
  </BusinessShell>;
}
