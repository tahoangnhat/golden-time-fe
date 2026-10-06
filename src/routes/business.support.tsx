import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { BusinessShell } from "@/components/BusinessShell";

export const Route = createFileRoute("/business/support")({ head: () => ({ meta: [{ title: "Hỗ trợ — Golden Time Business" }] }), component: Support });

function Support() {
  return <BusinessShell title="Trung tâm hỗ trợ" subtitle="Thông tin hỗ trợ đối tác">
    <section className="max-w-2xl mx-auto bg-white rounded-2xl border border-border gt-shadow-soft p-8 text-center"><div className="mx-auto h-12 w-12 rounded-2xl bg-cream text-primary grid place-items-center"><LifeBuoy className="h-5 w-5" /></div><h2 className="mt-4 font-extrabold text-lg">Chưa cấu hình kênh hỗ trợ</h2><p className="mt-2 text-sm text-muted-foreground">Email, hotline, chính sách đối tác và hướng dẫn xử lý đơn chưa được cấu hình trong hệ thống.</p></section>
  </BusinessShell>;
}
