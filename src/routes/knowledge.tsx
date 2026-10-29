import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  BookOpen,
  CalendarDays,
  HeartPulse,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  PackageCheck,
  Search,
  ShoppingBasket,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { api, type Article } from "@/lib/api";
import { ArticleCard } from "./index";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Kiến thức trái cây & dinh dưỡng — Golden Time" }] }),
  component: KnowledgePage,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Tất cả": LayoutGrid,
  "Dinh dưỡng": Apple,
  "Chọn trái cây": Leaf,
  "Bảo quản": PackageCheck,
  "Sử dụng trái cây": Utensils,
  "Sức khỏe an toàn": HeartPulse,
  "Mua sắm thông minh": ShoppingBasket,
  "Theo mùa": CalendarDays,
};
const FEATURED_CATEGORIES = ["Dinh dưỡng", "Chọn trái cây", "Bảo quản", "Sử dụng trái cây", "Sức khỏe an toàn"] as const;

function KnowledgePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isKnowledgeIndex = pathname === "/knowledge" || pathname === "/knowledge/";

  return isKnowledgeIndex ? <KnowledgeIndexPage /> : <Outlet />;
}

function KnowledgeIndexPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [visibleCount, setVisibleCount] = useState(6);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.articles()
      .then(setArticles)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được bài viết."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const articleCategories = new Set(articles.map((article) => article.category.trim()).filter(Boolean));
    const additionalCategories = [...articleCategories].filter((item) => !FEATURED_CATEGORIES.includes(item as typeof FEATURED_CATEGORIES[number]));
    return ["Tất cả", ...FEATURED_CATEGORIES, ...additionalCategories];
  }, [articles]);

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === "Tất cả" || article.category === category;
    const searchableText = `${article.title} ${article.description ?? ""} ${article.category}`.toLocaleLowerCase("vi");
    return matchesCategory && (!query.trim() || searchableText.includes(query.trim().toLocaleLowerCase("vi")));
  }), [articles, category, query]);

  function updateQuery(value: string) {
    setQuery(value);
    setVisibleCount(6);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setVisibleCount(6);
  }

  return (
    <SiteShell>
      <section className="px-5 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <section className="relative isolate min-h-[190px] overflow-hidden rounded-[2rem] border border-[#e4edcf] bg-[#f2f7e4] sm:min-h-[210px]">
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
                <h1 className="text-2xl font-extrabold tracking-tight text-[#173d26] sm:text-3xl lg:text-4xl">
                  Kiến thức trái cây &amp; dinh dưỡng
                </h1>
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
          </section>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Lọc bài viết theo chủ đề">
              {categories.map((item) => {
                const Icon = CATEGORY_ICONS[item] ?? Leaf;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={category === item}
                    onClick={() => updateCategory(item)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${category === item ? "gt-gradient border-transparent text-white gt-shadow" : "border-border bg-white text-foreground/70 hover:bg-cream"}`}
                  >
                    <Icon className="h-4 w-4" /> {item}
                  </button>
                );
              })}
            </div>
            <label className="relative block w-full shrink-0 lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="Tìm kiếm kiến thức..."
                aria-label="Tìm kiếm bài viết kiến thức"
                className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          {loading ? (
            <div className="grid min-h-64 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div>
          ) : error ? (
            <p role="status" className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-900">{error}</p>
          ) : filteredArticles.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border bg-white px-5 py-14 text-center text-sm text-muted-foreground">
              {articles.length ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết kiến thức được xuất bản."}
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.slice(0, visibleCount).map((article) => <ArticleCard key={article.slug} article={article} />)}
              </div>
              {visibleCount < filteredArticles.length && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 6)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-cream"
                  >
                    Xem thêm bài viết
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
