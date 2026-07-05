import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Facebook, Music2, Store, CheckCircle2 } from "lucide-react";
import { SiteShell, Section, SectionHeading, SOCIAL } from "@/components/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Liên hệ Golden Time" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteShell>
      <Section>
        <SectionHeading
          eyebrow="Liên hệ"
          title="Liên hệ Golden Time"
          subtitle="Chúng tôi luôn sẵn sàng lắng nghe đề xuất, phản hồi và cơ hội hợp tác từ bạn."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          <ContactCard icon={Mail} title="Email" value={SOCIAL.email} href={`mailto:${SOCIAL.email}`} />
          <ContactCard icon={Facebook} title="Facebook Fanpage" value="facebook.com/goldentime" href={SOCIAL.facebook} />
          <ContactCard icon={Music2} title="TikTok" value="@goldentime" href={SOCIAL.tiktok} />
          <ContactCard icon={Store} title="Hợp tác cửa hàng" value="partner@goldentime.vn" href="mailto:partner@goldentime.vn" />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 max-w-5xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-3xl bg-white border border-border p-7 lg:p-8"
          >
            <h3 className="text-xl font-extrabold mb-1">Gửi liên hệ</h3>
            <p className="text-sm text-muted-foreground mb-6">Đội ngũ Golden Time sẽ phản hồi trong vòng 24 giờ.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Họ và tên" placeholder="Nguyễn Văn A" />
              <Field label="Email" type="email" placeholder="ban@email.com" />
            </div>
            <Field label="Chủ đề" placeholder="Hợp tác / Phản hồi sản phẩm..." />
            <div className="mt-4">
              <label className="text-sm font-semibold mb-1.5 block">Nội dung</label>
              <textarea required rows={5} placeholder="Nội dung tin nhắn..." className="w-full px-4 py-3 rounded-2xl bg-cream border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <button className="mt-6 w-full py-3.5 rounded-2xl gt-gradient text-white font-semibold gt-shadow">
              Gửi liên hệ
            </button>
            {sent && (
              <div className="mt-4 flex items-center gap-2 text-sm text-primary font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Đã gửi liên hệ. Cảm ơn bạn!
              </div>
            )}
          </form>
          <div className="rounded-3xl gt-gradient text-white p-8 flex flex-col">
            <Store className="h-10 w-10 mb-4" />
            <h3 className="text-2xl font-extrabold leading-tight">Bạn là cửa hàng trái cây?</h3>
            <p className="text-white/85 mt-3">
              Gia nhập mạng lưới đối tác Golden Time để tiếp cận khách hàng quan tâm đến chất lượng và nguồn gốc.
            </p>
            <Link to="/shop/login" className="mt-auto inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white text-primary font-semibold">
              Đăng ký trở thành đối tác
            </Link>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}

function ContactCard({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href: string }) {
  return (
    <a href={href} className="rounded-3xl bg-white border border-border p-5 hover:gt-shadow transition-all block">
      <div className="h-11 w-11 rounded-2xl gt-gradient grid place-items-center text-white mb-3"><Icon className="h-5 w-5" /></div>
      <div className="text-sm font-bold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 break-all">{value}</div>
    </a>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div className="mt-4 sm:mt-0">
      <label className="text-sm font-semibold mb-1.5 block">{label}</label>
      <input required type={type} placeholder={placeholder} className="w-full px-4 py-3 rounded-2xl bg-cream border border-border focus:border-primary focus:outline-none text-sm" />
    </div>
  );
}