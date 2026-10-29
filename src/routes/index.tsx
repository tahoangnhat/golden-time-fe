import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  LoaderCircle,
  LayoutGrid,
  Apple,
  Leaf,
  PackageCheck,
  ShoppingBasket,
  CalendarDays,
  HeartPulse,
  Utensils,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";
import { DownloadAppDialog } from "@/components/DownloadAppDialog";
import type { Article as ApiArticle } from "@/lib/api";
import { api } from "@/lib/api";
import { ARTICLE_CATEGORIES } from "@/lib/site-data";

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

const ARTICLE_CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Tất cả": LayoutGrid,
  "Dinh dưỡng": Apple,
  "Chọn trái cây": Leaf,
  "Bảo quản": PackageCheck,
  "Mua sắm thông minh": ShoppingBasket,
  "Theo mùa": CalendarDays,
  "Sức khỏe": HeartPulse,
  "Sử dụng": Utensils,
};

function HomePage() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [articleQuery, setArticleQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [visibleArticleCount, setVisibleArticleCount] = useState(6);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState("");

  useEffect(() => {
    api.articles()
      .then(setArticles)
      .catch((cause) => setArticlesError(cause instanceof Error ? cause.message : "Không tải được bài viết."))
      .finally(() => setArticlesLoading(false));
  }, []);

  const categories = useMemo(() => {
    const articleCategories = new Set(articles.map((article) => article.category.trim()).filter(Boolean));
    const preferredOrder = ARTICLE_CATEGORIES.filter((category) => category !== "Tất cả" && articleCategories.has(category));
    const additionalCategories = [...articleCategories].filter((category) => !ARTICLE_CATEGORIES.includes(category as typeof ARTICLE_CATEGORIES[number]));
    return ["Tất cả", ...preferredOrder, ...additionalCategories];
  }, [articles]);

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesCategory = activeCategory === "Tất cả" || article.category === activeCategory;
    const searchableText = `${article.title} ${article.description ?? ""} ${article.category}`.toLocaleLowerCase("vi");
    return matchesCategory && (!articleQuery.trim() || searchableText.includes(articleQuery.trim().toLocaleLowerCase("vi")));
  }), [activeCategory, articleQuery, articles]);

  function updateArticleQuery(value: string) {
    setArticleQuery(value);
    setVisibleArticleCount(6);
  }

  function selectArticleCategory(category: string) {
    setActiveCategory(category);
    setVisibleArticleCount(6);
  }

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
              <a
                href="#knowledge"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-border text-foreground font-semibold hover:bg-cream"
              >
                <BookOpen className="h-5 w-5 text-primary" /> Đọc kiến thức trái cây
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE LIBRARY */}
      <section id="knowledge" className="scroll-mt-20 px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative isolate min-h-[190px] overflow-hidden rounded-[2rem] border border-[#e4edcf] bg-[#f2f7e4] sm:min-h-[210px]">
            <img
              src="/images/knowledge-banner-bg.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#f4f8e8]/95 via-[#f4f8e8]/85 to-[#fff7d9]/55" />
            <div className="relative z-10 flex min-h-[190px] items-center px-6 py-7 sm:min-h-[210px] sm:px-9 lg:px-12">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                  <Leaf className="h-4 w-4" /> Kiến thức
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#173d26] sm:text-3xl lg:text-4xl">
                  Kiến thức trái cây &amp; dinh dưỡng
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
                  Tổng hợp bài viết giúp bạn chọn, bảo quản và sử dụng trái cây thông minh hơn mỗi ngày.
                </p>
              </div>
              <div aria-hidden="true" className="absolute right-8 top-1/2 hidden h-40 w-60 -translate-y-1/2 items-center justify-center sm:flex lg:right-14">
                <div className="absolute bottom-3 left-9 h-24 w-40 rotate-[-5deg] rounded-b-[2rem] border-b-4 border-[#37744b] bg-[#fffdf2]/90 shadow-lg" />
                <BookOpen className="relative z-10 h-24 w-24 text-[#37744b] drop-shadow-sm" strokeWidth={1.5} />
                <span className="absolute bottom-1 left-3 text-4xl drop-shadow">🍊</span>
                <span className="absolute right-5 top-1 text-4xl drop-shadow">🍎</span>
                <span className="absolute bottom-0 right-2 text-4xl drop-shadow">🥭</span>
                <Sparkles className="absolute left-2 top-3 h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Lọc bài viết theo chủ đề">
              {categories.map((category) => {
                const Icon = ARTICLE_CATEGORY_ICONS[category] ?? Leaf;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => selectArticleCategory(category)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${activeCategory === category ? "gt-gradient border-transparent text-white gt-shadow" : "border-border bg-white text-foreground/70 hover:bg-cream"}`}
                  >
                    <Icon className="h-4 w-4" /> {category}
                  </button>
                );
              })}
            </div>
            <label className="relative block w-full shrink-0 lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={articleQuery}
                onChange={(event) => updateArticleQuery(event.target.value)}
                placeholder="Tìm kiếm kiến thức..."
                aria-label="Tìm kiếm bài viết kiến thức"
                className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          {articlesLoading ? (
            <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div>
          ) : articlesError ? (
            <p role="status" className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-900">{articlesError}</p>
          ) : filteredArticles.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border bg-white px-5 py-14 text-center text-sm text-muted-foreground">
              {articles.length ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết kiến thức được xuất bản."}
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.slice(0, visibleArticleCount).map((article) => <ArticleCard key={article.slug} article={article} />)}
              </div>
              {visibleArticleCount < filteredArticles.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleArticleCount((count) => count + 6)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-cream"
                  >
                    Xem thêm bài viết <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
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

export function ArticleCard({ article }: { article: Pick<ApiArticle, "slug" | "title" | "category" | "emoji" | "gradient" | "description" | "coverUrl" | "coverAlt" | "readingTime"> }) {
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
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {article.readingTime} đọc</span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-[#eff7df] px-3 py-2 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            Xem chi tiết <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
