import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, BookOpen, Leaf, Clock } from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";
import { DownloadAppDialog } from "@/components/DownloadAppDialog";
import type { Article as ApiArticle } from "@/lib/api";

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

function HomePage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative isolate flex min-h-[640px] items-center overflow-hidden lg:min-h-[720px]">
        <img
          src="/images/golden-time-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[18%_center] sm:object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#fffdf3]/95 via-[#fffdf3]/75 to-[#fffdf3]/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/65" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-16">
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Golden Time và quyền truy cập Google</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Golden Time giúp người dùng phân tích ảnh trái cây bằng AI, tra cứu dinh dưỡng, tìm cửa hàng và đặt hàng; doanh nghiệp có thể đăng ký cửa hàng qua cổng đối tác. Khi tích hợp Gmail API được bật, Golden Time chỉ dùng quyền gửi thư để thông báo kết quả xét duyệt hồ sơ đến email doanh nghiệp đã đăng ký, không đọc hộp thư.
          </p>
          <Link to="/privacy" className="mt-4 inline-flex text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
            Đọc Chính sách quyền riêng tư
          </Link>
        </div>
      </section>

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

function formatPublishedAt(value?: string | null) {
  if (!value) return "Chưa cập nhật ngày đăng";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00+07:00` : value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật ngày đăng";
  const options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" };
  if (!dateOnly) options.timeStyle = "short";
  return new Intl.DateTimeFormat("vi-VN", options).format(date);
}

export function ArticleCard({ article }: { article: Pick<ApiArticle, "slug" | "title" | "category" | "emoji" | "gradient" | "description" | "coverUrl" | "coverAlt" | "publishedAt"> }) {
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:gt-shadow"
    >
      <div className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${article.gradient} sm:h-40`}>
        {article.coverUrl ? <img src={article.coverUrl} alt={article.coverAlt || article.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-7xl transition-transform group-hover:scale-105">{article.emoji}</div>}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-primary shadow-sm backdrop-blur">
          <Leaf className="h-3 w-3" /> {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <h3 className="mb-2 font-bold leading-snug text-foreground transition-colors group-hover:text-primary">{article.title}</h3>
        {article.description && <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Đăng {formatPublishedAt(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-[#eff7df] px-3 py-2 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            Xem chi tiết <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
