import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Apple,
  BarChart3,
  QrCode,
  ShoppingBag,
  ScanLine,
  Star,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";
import { DownloadAppDialog } from "@/components/DownloadAppDialog";
import type { Article as ApiArticle, AppUpdate } from "@/lib/api";
import { api, formatDate } from "@/lib/api";

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
  { icon: ScanLine, title: "Phân tích ảnh trái cây", desc: "Ảnh được gửi tới dịch vụ AI đã cấu hình. Chỉ hiển thị kết quả do dịch vụ trả về." },
  { icon: Star, title: "Thông tin chất lượng", desc: "Hiển thị điểm số và nhận xét nếu được dịch vụ phân tích cung cấp." },
  { icon: Apple, title: "Tra cứu dinh dưỡng", desc: "Đọc dữ liệu dinh dưỡng đã có trong hệ thống; không tạo số liệu thay thế." },
  { icon: BarChart3, title: "So sánh giá", desc: "Hiển thị báo giá có nguồn và thời gian thu thập khi nguồn dữ liệu trả về kết quả." },
  { icon: QrCode, title: "Truy xuất theo mã lô", desc: "Tra cứu lô hàng và các mốc hành trình đã được cửa hàng ghi nhận." },
  { icon: ShoppingBag, title: "Đặt hàng một cửa hàng", desc: "Tạo đơn COD thử nghiệm từ sản phẩm và tồn kho đang có trong hệ thống." },
  { icon: Sparkles, title: "Đánh giá có xác thực", desc: "Chỉ người đã quét sản phẩm hoặc đặt đơn mới đủ điều kiện gửi đánh giá." },
];

function HomePage() {
  const [recentArticles, setRecentArticles] = useState<ApiArticle[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<AppUpdate[]>([]);
  useEffect(() => {
    api.articles().then((items) => setRecentArticles(items.slice(0, 6))).catch(() => setRecentArticles([]));
    api.updates().then((items) => setRecentUpdates(items.slice(0, 3))).catch(() => setRecentUpdates([]));
  }, []);
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-40 h-[480px] w-[480px] rounded-full bg-[oklch(0.92_0.18_120)] blur-3xl opacity-50" />
        <div className="absolute top-40 -left-32 h-[420px] w-[420px] rounded-full bg-[oklch(0.94_0.16_85)] blur-3xl opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20">
          <div className="max-w-3xl">
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
        </div>
      </section>

      {/* FEATURES */}
      <Section>
        <SectionHeading
          eyebrow="Tính năng nổi bật"
          title="Các luồng chính của MVP"
          subtitle="Số liệu và nội dung lấy từ backend, nhà cung cấp AI hoặc nguồn giá đã kết nối."
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
          {recentArticles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
          {recentArticles.length === 0 && <p className="md:col-span-2 lg:col-span-3 text-center text-sm text-muted-foreground">Bài viết sẽ xuất hiện khi backend sẵn sàng.</p>}
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
          {recentUpdates.map((u) => (
            <div key={u.version} className="bg-white rounded-3xl border border-border p-6 hover:gt-shadow transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cream text-primary">v{u.version}</span>
                <span className="text-xs text-muted-foreground">{formatDate(u.date)}</span>
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
          {recentUpdates.length === 0 && <p className="md:col-span-3 text-center text-sm text-muted-foreground">Chưa có bản cập nhật được công bố.</p>}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="rounded-[2rem] bg-cream px-6 py-9 text-center sm:px-10 sm:py-11">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Golden Time trên điện thoại
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Quét trái cây, kiểm tra chất lượng và mua trái cây đáng tin cậy ngay trên điện thoại.
          </p>
          <div className="mt-6">
            <DownloadAppDialog
              trigger={
                <button className="inline-flex h-11 items-center justify-center rounded-xl gt-gradient px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Tải ứng dụng
                </button>
              }
            />
          </div>
        </div>
      </section>

    </SiteShell>
  );
}

export function ArticleCard({ article }: { article: Pick<ApiArticle, "slug" | "title" | "category" | "emoji" | "gradient" | "description" | "readingTime"> }) {
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
