import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Store } from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Liên hệ Golden Time" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <Section>
        <SectionHeading
          eyebrow="Liên hệ"
          title="Thông tin liên hệ"
          subtitle="Các kênh liên hệ và biểu mẫu sẽ xuất hiện sau khi được cấu hình cho dự án."
        />
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-border p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-cream text-primary grid place-items-center"><Info className="h-6 w-6" /></div>
            <div>
              <h2 className="font-extrabold text-lg">Chưa có kênh liên hệ được cấu hình</h2>
              <p className="mt-2 text-sm text-muted-foreground">Phiên bản MVP hiện chưa kết nối email, mạng xã hội hoặc API nhận yêu cầu liên hệ. Biểu mẫu gửi tin nhắn chưa khả dụng.</p>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold">Tài khoản doanh nghiệp</h3>
                <p className="mt-1 text-sm text-muted-foreground">Đăng nhập bằng tài khoản doanh nghiệp đã được Admin chấp nhận.</p>
                <Link to="/business/login" className="mt-3 inline-flex items-center rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-primary">Cổng doanh nghiệp</Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
