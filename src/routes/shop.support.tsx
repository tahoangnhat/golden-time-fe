import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Mail, MessageSquare, Bug, FileText, ShieldCheck, Package, ShoppingBag, Star } from "lucide-react";
import { PartnerShell } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/support")({
  head: () => ({ meta: [{ title: "Hỗ trợ — Golden Time Partner" }] }),
  component: Support,
});

const FAQ = [
  { q: "Làm sao để xác nhận đơn hàng mới?", a: "Vào trang Đơn hàng, tab 'Chờ xác nhận' và bấm 'Xác nhận'. Khách sẽ nhận thông báo trong vài giây." },
  { q: "Khi nào tôi nhận được tiền từ đơn hàng?", a: "Golden Time đối soát và chuyển tiền vào tài khoản đối tác mỗi thứ Hai hàng tuần." },
  { q: "Tôi muốn thêm sản phẩm hữu cơ thì cần gì?", a: "Cần upload chứng nhận hữu cơ (PDF/ảnh) ở trang Truy xuất nguồn gốc và gửi Admin duyệt." },
  { q: "Tôi quên cập nhật tồn kho, làm sao hủy đơn?", a: "Trong tab 'Chờ xác nhận', bấm 'Từ chối' và chọn lý do 'Hết hàng'. Khách sẽ được hoàn tiền tự động." },
  { q: "Làm sao tăng điểm hiển thị trên bản đồ?", a: "Giữ tỉ lệ phản hồi đánh giá >90%, AI Quality trung bình >85, và cập nhật sản phẩm đều đặn." },
];

const POLICIES = [
  { icon: ShieldCheck, title: "Chính sách hoa hồng", desc: "Golden Time thu 8% trên mỗi đơn hàng thành công." },
  { icon: Package, title: "Quy định đăng sản phẩm", desc: "Sản phẩm phải có ảnh thật, mô tả rõ nguồn gốc, không gây hiểu lầm." },
  { icon: ShoppingBag, title: "Quy định xử lý đơn hàng", desc: "Xác nhận trong 15 phút, giao hàng trong 2 giờ với đơn nội thành." },
  { icon: Star, title: "Quy định đánh giá chất lượng", desc: "AI Quality < 70 sẽ bị cảnh báo; < 60 trong 7 ngày sẽ bị tạm ẩn." },
];

function Support() {
  return (
    <PartnerShell title="Trung tâm hỗ trợ" subtitle="Câu hỏi thường gặp, liên hệ Admin và chính sách">
      {/* Contact cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <ContactCard
          icon={<Mail className="h-5 w-5" />}
          tone="primary"
          title="Liên hệ Admin Golden Time"
          desc="partner@goldentime.vn"
          cta="Gửi email"
        />
        <ContactCard
          icon={<MessageSquare className="h-5 w-5" />}
          tone="orange"
          title="Chat trực tiếp"
          desc="Hotline đối tác: 1900 6868"
          cta="Mở chat"
        />
        <ContactCard
          icon={<Bug className="h-5 w-5" />}
          tone="yellow"
          title="Báo cáo lỗi kỹ thuật"
          desc="Lỗi đăng nhập, sai dữ liệu..."
          cta="Gửi báo cáo"
        />
      </div>

      {/* FAQ */}
      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Câu hỏi thường gặp</h3>
          <div className="mt-3 divide-y divide-border">
            {FAQ.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Chính sách đối tác</h3>
          <div className="mt-3 space-y-2">
            {POLICIES.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-3 p-3 rounded-xl bg-[oklch(0.98_0.02_100)] border border-border">
                  <div className="h-8 w-8 rounded-lg bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] grid place-items-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              );
            })}
            <button className="w-full mt-2 h-10 rounded-xl border border-border font-semibold text-sm flex items-center justify-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Xem đầy đủ chính sách
            </button>
          </div>
        </div>
      </div>
    </PartnerShell>
  );
}

function ContactCard({
  icon, tone, title, desc, cta,
}: { icon: React.ReactNode; tone: "primary" | "orange" | "yellow"; title: string; desc: string; cta: string }) {
  const tones: Record<string, string> = {
    primary: "bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)]",
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${tones[tone]}`}>{icon}</div>
      <p className="mt-3 font-bold">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <button className="mt-3 px-3 py-1.5 rounded-lg gt-gradient text-white text-xs font-semibold">{cta}</button>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold text-sm">{q}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}