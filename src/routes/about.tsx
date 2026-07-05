import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Sparkles, Apple, BarChart3, QrCode, ShoppingBag, Target, Eye } from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Về Golden Time" }] }),
  component: AboutPage,
});

const PROBLEMS = [
  { t: "Khó đánh giá độ tươi", d: "Người dùng phải dựa vào kinh nghiệm để đoán chất lượng trái cây." },
  { t: "Thiếu thông tin dinh dưỡng", d: "Không dễ tra cứu nhanh thành phần và lợi ích sức khỏe của từng loại trái cây." },
  { t: "Khó biết giá hợp lý", d: "Giá trái cây chênh lệch lớn giữa chợ, siêu thị và cửa hàng online." },
  { t: "Thiếu minh bạch nguồn gốc", d: "Người tiêu dùng không có công cụ để truy xuất xuất xứ và lô hàng." },
];

const SOLUTIONS = [
  { icon: Sparkles, t: "AI đánh giá chất lượng", d: "Quét nhanh và nhận điểm chất lượng theo thời gian thực." },
  { icon: Apple, t: "Dinh dưỡng tức thời", d: "Hiển thị thành phần dinh dưỡng và gợi ý sử dụng phù hợp." },
  { icon: BarChart3, t: "So sánh giá", d: "So sánh giá giữa các cửa hàng và siêu thị uy tín gần bạn." },
  { icon: QrCode, t: "Truy xuất nguồn gốc", d: "Quét mã để xem hành trình từ nông trại đến cửa hàng." },
  { icon: ShoppingBag, t: "Mua hàng thông minh", d: "Đặt hàng từ đối tác được Golden Time kiểm duyệt chất lượng." },
];

function AboutPage() {
  return (
    <SiteShell>
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-cream px-3 py-1 rounded-full mb-4">
            Về chúng tôi
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Về Golden Time</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Golden Time hướng đến việc giúp người tiêu dùng Việt Nam lựa chọn trái cây thông minh, minh bạch
            và tốt cho sức khỏe hơn.
          </p>
        </div>
      </Section>

      <Section className="py-10">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-white border border-border p-8">
            <div className="h-12 w-12 rounded-2xl gt-gradient grid place-items-center text-white mb-4"><Target className="h-6 w-6" /></div>
            <h3 className="font-extrabold text-xl mb-2">Sứ mệnh</h3>
            <p className="text-muted-foreground">Giúp 10 triệu người Việt mua trái cây thông minh, an toàn và đúng giá trị hơn mỗi ngày.</p>
          </div>
          <div className="rounded-3xl gt-gradient text-white p-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center mb-4"><Eye className="h-6 w-6" /></div>
            <h3 className="font-extrabold text-xl mb-2">Tầm nhìn</h3>
            <p className="text-white/90">Trở thành nền tảng FoodTech hỗ trợ người tiêu dùng lựa chọn thực phẩm thông minh tại Việt Nam.</p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Vấn đề" title="Người mua trái cây đang gặp khó khăn gì?" />
        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {PROBLEMS.map((p) => (
            <div key={p.t} className="flex gap-4 p-6 rounded-3xl bg-white border border-border">
              <div className="h-11 w-11 rounded-2xl bg-[oklch(0.95_0.08_30)] text-[oklch(0.5_0.2_30)] grid place-items-center"><AlertCircle className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold mb-1">{p.t}</h4>
                <p className="text-sm text-muted-foreground">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Giải pháp" title="Cách Golden Time giải quyết" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOLUTIONS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-6 rounded-3xl bg-white border border-border hover:gt-shadow transition">
              <div className="h-11 w-11 rounded-2xl gt-gradient grid place-items-center text-white mb-3"><Icon className="h-5 w-5" /></div>
              <h4 className="font-bold mb-1">{t}</h4>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}