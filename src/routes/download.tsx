import { createFileRoute } from "@tanstack/react-router";
import { Apple, Download, ScanLine, Star, Sparkles, BarChart3, ShoppingBag, MapPin, ChevronDown } from "lucide-react";
import { SiteShell, Section, SectionHeading, SOCIAL } from "@/components/SiteShell";
import { useState } from "react";

export const Route = createFileRoute("/download")({
  head: () => ({ meta: [{ title: "Tải ứng dụng Golden Time" }] }),
  component: DownloadPage,
});

const BENEFITS = [
  { icon: ScanLine, t: "Quét trái cây bằng AI" },
  { icon: Star, t: "Xem điểm chất lượng" },
  { icon: Sparkles, t: "Xem thông tin dinh dưỡng" },
  { icon: BarChart3, t: "So sánh giá thị trường" },
  { icon: ShoppingBag, t: "Mua trái cây trực tuyến" },
  { icon: MapPin, t: "Theo dõi cửa hàng uy tín" },
];

const FAQ = [
  { q: "Ứng dụng có miễn phí không?", a: "Có. Người dùng có thể tải và sử dụng các tính năng cốt lõi như quét AI, xem dinh dưỡng và so sánh giá hoàn toàn miễn phí." },
  { q: "Kết quả AI có chính xác tuyệt đối không?", a: "Kết quả AI chỉ mang tính tham khảo dựa trên hình ảnh đầu vào. Bạn nên kết hợp quan sát thực tế khi đưa ra quyết định mua hàng." },
  { q: "Golden Time có bán trái cây trực tiếp không?", a: "Golden Time là nền tảng kết nối người dùng với các cửa hàng đối tác uy tín, không trực tiếp bán hàng." },
  { q: "Tôi có thể theo dõi cập nhật ở đâu?", a: "Bạn có thể xem mục Cập nhật ứng dụng trên website hoặc theo dõi Fanpage chính thức của Golden Time." },
];

function DownloadPage() {
  return (
    <SiteShell>
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-cream px-3 py-1 rounded-full mb-4">
              Sẵn sàng trên App Store & Google Play
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">Tải Golden Time</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Ứng dụng giúp bạn chọn mua trái cây thông minh hơn mỗi ngày.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SOCIAL.appStore} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-foreground text-white font-semibold">
                <Apple className="h-5 w-5" /> Tải trên App Store
              </a>
              <a href={SOCIAL.googlePlay} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl gt-gradient text-white font-semibold gt-shadow">
                <Download className="h-5 w-5" /> Tải trên Google Play
              </a>
              <a href={SOCIAL.apk} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-border font-semibold">
                <Download className="h-5 w-5" /> Tải file APK
              </a>
            </div>
            <div className="mt-10 flex items-center gap-5 p-5 rounded-3xl bg-white border border-border max-w-sm">
              <div className="h-28 w-28 rounded-2xl bg-cream grid place-items-center text-5xl">▦</div>
              <div>
                <div className="text-xs text-muted-foreground">Quét QR để tải</div>
                <div className="font-bold">goldentime.vn/app</div>
                <div className="text-xs text-muted-foreground mt-1">iOS · Android · APK</div>
              </div>
            </div>
          </div>
          <div className="grid place-items-center">
            <div className="w-[300px] h-[600px] rounded-[3rem] bg-white border-[10px] border-foreground/90 gt-shadow overflow-hidden">
              <div className="h-7 bg-foreground/90" />
              <div className="p-5 bg-gradient-to-b from-cream to-white h-full">
                <div className="text-xs font-bold">Golden Time</div>
                <div className="mt-4 rounded-3xl gt-gradient p-5 text-white gt-shadow">
                  <div className="text-xs opacity-80">Quét trái cây bằng AI</div>
                  <div className="text-2xl font-extrabold mt-1">Xoài Cát 🥭</div>
                  <div className="mt-3 text-4xl font-black">88</div>
                  <div className="text-xs opacity-80">Điểm chất lượng</div>
                </div>
                <button className="mt-4 w-full py-3 rounded-2xl gt-gradient text-white text-sm font-semibold">Mua ngay</button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Bạn sẽ nhận được gì?" title="Trải nghiệm trái cây thông minh" center />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-border">
              <div className="h-12 w-12 rounded-2xl gt-gradient grid place-items-center text-white"><Icon className="h-6 w-6" /></div>
              <div className="font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="FAQ" title="Câu hỏi thường gặp" />
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </Section>
    </SiteShell>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 p-5 text-left">
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}