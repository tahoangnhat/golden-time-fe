import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Apple,
  BarChart3,
  QrCode,
  ShoppingBag,
  ScanLine,
  Star,
  ArrowRight,
  Facebook,
  Music2,
  Download,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SiteShell, Section, SectionHeading, SOCIAL } from "@/components/SiteShell";
import { ARTICLES, UPDATES } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Golden Time — Chọn trái cây thông minh cùng AI" },
      {
        name: "description",
        content:
          "Golden Time là nền tảng FoodTech Việt Nam giúp đánh giá chất lượng trái cây bằng AI, xem dinh dưỡng, so sánh giá và mua trái cây đáng tin cậy.",
      },
      { property: "og:title", content: "Golden Time — Chọn trái cây thông minh cùng AI" },
      { property: "og:description", content: "Quét AI · Dinh dưỡng · So sánh giá · Truy xuất nguồn gốc." },
    ],
  }),
  component: HomePage,
});

const HERO_BADGES = [
  { icon: Sparkles, label: "AI đánh giá chất lượng" },
  { icon: Apple, label: "Dinh dưỡng tức thời" },
  { icon: BarChart3, label: "So sánh giá" },
  { icon: QrCode, label: "Truy xuất nguồn gốc" },
  { icon: ShoppingBag, label: "Mua hàng thông minh" },
];

const FEATURES = [
  { icon: ScanLine, title: "Quét trái cây bằng AI", desc: "Đưa camera lên trái cây, AI nhận diện và đánh giá ngay tức thì." },
  { icon: Star, title: "Xem điểm chất lượng", desc: "Chấm điểm độ tươi, ngọt và độ chín theo thang điểm 100." },
  { icon: Apple, title: "Tra cứu dinh dưỡng", desc: "Bảng dinh dưỡng đầy đủ: calo, vitamin, khoáng chất, chất xơ." },
  { icon: BarChart3, title: "So sánh giá thị trường", desc: "Cập nhật giá thực tế tại các siêu thị và cửa hàng uy tín." },
  { icon: QrCode, title: "Truy xuất nguồn gốc", desc: "Theo dõi hành trình trái cây từ nông trại đến tay bạn." },
  { icon: ShoppingBag, title: "Mua hàng từ cửa hàng uy tín", desc: "Đặt và thanh toán ngay với đối tác cửa hàng được kiểm duyệt." },
  { icon: Sparkles, title: "Đánh giá cộng đồng", desc: "Tham khảo đánh giá thật của người dùng quanh khu vực." },
];

function HomePage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-40 h-[480px] w-[480px] rounded-full bg-[oklch(0.92_0.18_120)] blur-3xl opacity-50" />
        <div className="absolute top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[oklch(0.94_0.16_85)] blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1 text-xs font-semibold text-primary mb-6 gt-shadow-soft">
              <Sparkles className="h-3.5 w-3.5" /> AI Fruit Intelligence · Made in Vietnam
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Chọn trái cây <br className="hidden lg:block" />
              thông minh cùng <span className="text-primary">Golden Time</span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-xl">
              Nền tảng giúp người dùng đánh giá chất lượng trái cây, xem dinh dưỡng, so sánh giá và mua trái
              cây đáng tin cậy — tất cả trong một ứng dụng.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl gt-gradient text-white font-semibold gt-shadow"
              >
                <Download className="h-5 w-5" /> Tải ứng dụng
              </Link>
              <Link
                to="/knowledge"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-border text-foreground font-semibold hover:bg-cream"
              >
                <BookOpen className="h-5 w-5 text-primary" /> Đọc kiến thức trái cây
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {HERO_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-border rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative grid place-items-center">
            <div className="absolute inset-0 m-auto h-80 w-80 rounded-full gt-gradient opacity-20 blur-3xl" />
            <div className="relative w-[300px] h-[600px] rounded-[3rem] bg-white border-[10px] border-foreground/90 gt-shadow overflow-hidden">
              <div className="h-7 bg-foreground/90" />
              <div className="p-5 bg-gradient-to-b from-cream to-white h-full">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold">Golden Time</div>
                  <div className="h-7 w-7 rounded-full gt-gradient grid place-items-center text-white text-xs">G</div>
                </div>
                <div className="mt-4 rounded-3xl gt-gradient p-5 text-white gt-shadow">
                  <div className="text-xs opacity-80">Quét trái cây bằng AI</div>
                  <div className="text-2xl font-extrabold mt-1">Táo Fuji 🍎</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] opacity-80">Điểm chất lượng</div>
                      <div className="text-4xl font-black">92</div>
                    </div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Rất tươi</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[{ l: "Calo", v: "52" }, { l: "Vitamin C", v: "8%" }, { l: "Chất xơ", v: "2.4g" }].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-white border border-border p-2 text-center">
                      <div className="text-[9px] text-muted-foreground">{s.l}</div>
                      <div className="text-sm font-bold">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-2xl bg-white border border-border p-3">
                  <div className="text-[10px] text-muted-foreground">Giá tốt nhất gần bạn</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm font-bold">WinMart Đống Đa</div>
                    <div className="text-sm font-extrabold text-primary">62.000đ/kg</div>
                  </div>
                </div>
                <button className="mt-3 w-full py-3 rounded-2xl gt-gradient text-white text-sm font-semibold">
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <Section>
        <SectionHeading
          eyebrow="Tính năng nổi bật"
          title="Mọi thứ bạn cần để mua trái cây thông minh"
          subtitle="Golden Time kết hợp AI, dữ liệu thị trường và cộng đồng người dùng để bạn ra quyết định tốt hơn."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white rounded-3xl border border-border p-6 hover:gt-shadow transition-all hover:-translate-y-0.5"
            >
              <div className="h-12 w-12 rounded-2xl gt-gradient grid place-items-center text-white mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* KNOWLEDGE */}
      <Section className="bg-cream rounded-[2.5rem] max-w-[calc(100%-2.5rem)] lg:max-w-7xl">
        <SectionHeading
          eyebrow="Kiến thức"
          title="Kiến thức trái cây & dinh dưỡng"
          subtitle="Tổng hợp bài viết giúp bạn chọn, bảo quản và sử dụng trái cây thông minh hơn mỗi ngày."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.slice(0, 6).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/knowledge"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border font-semibold hover:bg-white/80"
          >
            Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* UPDATES */}
      <Section>
        <SectionHeading
          eyebrow="Cập nhật ứng dụng"
          title="Cập nhật mới từ Golden Time"
          subtitle="Theo dõi các tính năng mới và cải tiến gần đây của ứng dụng."
        />
        <div className="grid md:grid-cols-3 gap-5">
          {UPDATES.map((u) => (
            <div key={u.version} className="bg-white rounded-3xl border border-border p-6 hover:gt-shadow transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cream text-primary">v{u.version}</span>
                <span className="text-xs text-muted-foreground">{u.date}</span>
              </div>
              <h3 className="font-bold mb-2">{u.title}</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                {u.changes.slice(0, 3).map((c) => (
                  <li key={c} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{c}</li>
                ))}
              </ul>
              <Link to="/updates" className="text-sm text-primary font-semibold inline-flex items-center gap-1">
                Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* SOCIAL */}
      <Section>
        <SectionHeading
          eyebrow="Mạng xã hội"
          title="Theo dõi Golden Time"
          subtitle="Cập nhật mẹo chọn trái cây, dinh dưỡng và thông tin mới nhất từ Golden Time."
        />
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <a
            href={SOCIAL.facebook}
            className="group flex items-start gap-5 p-7 rounded-3xl bg-white border border-border hover:gt-shadow transition-all"
          >
            <div className="h-14 w-14 rounded-2xl bg-[oklch(0.6_0.18_255)] grid place-items-center text-white">
              <Facebook className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Facebook Fanpage</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Theo dõi Fanpage để xem bài viết và thông báo mới.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Mở Fanpage <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
          <a
            href={SOCIAL.tiktok}
            className="group flex items-start gap-5 p-7 rounded-3xl bg-white border border-border hover:gt-shadow transition-all"
          >
            <div className="h-14 w-14 rounded-2xl bg-foreground grid place-items-center text-white">
              <Music2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">TikTok</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Xem video ngắn về cách chọn trái cây và mẹo dinh dưỡng.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Mở TikTok <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        </div>
      </Section>

      {/* DOWNLOAD */}
      <Section>
        <div className="rounded-[2.5rem] gt-gradient p-10 lg:p-16 text-white overflow-hidden relative">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[oklch(0.95_0.15_85)]/30 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight">Tải ứng dụng Golden Time</h2>
              <p className="mt-4 text-white/85 text-base lg:text-lg max-w-xl">
                Trải nghiệm quét trái cây bằng AI, xem dinh dưỡng, so sánh giá và mua hàng thông minh ngay
                trên điện thoại của bạn.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={SOCIAL.appStore} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white text-foreground font-semibold hover:bg-white/90">
                  <Apple className="h-5 w-5" /> Tải trên App Store
                </a>
                <a href={SOCIAL.googlePlay} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-foreground text-white font-semibold hover:bg-foreground/90">
                  <Download className="h-5 w-5" /> Tải trên Google Play
                </a>
                <a href={SOCIAL.apk} className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/20 border border-white/30 text-white font-semibold hover:bg-white/30">
                  <Download className="h-5 w-5" /> Tải file APK
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 text-center text-foreground gt-shadow">
                <div className="h-44 w-44 rounded-2xl bg-cream grid place-items-center text-6xl">📱</div>
                <div className="mt-3 text-xs font-semibold text-muted-foreground">Quét QR để tải</div>
                <div className="text-sm font-bold">goldentime.vn/app</div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}

export function ArticleCard({ article }: { article: typeof ARTICLES[number] }) {
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: article.slug }}
      className="group bg-white rounded-3xl border border-border overflow-hidden hover:gt-shadow transition-all hover:-translate-y-0.5 flex flex-col"
    >
      <div className={`h-44 bg-gradient-to-br ${article.gradient} grid place-items-center text-7xl`}>
        <span className="group-hover:scale-110 transition-transform">{article.emoji}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-cream px-2 py-1 rounded-full">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readingTime}
          </span>
        </div>
        <h3 className="font-bold leading-snug mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.description}</p>
        <div className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Đọc bài viết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
