import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  CalendarDays,
  HeartPulse,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  PackageCheck,
  Search,
  ShoppingBasket,
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
      <section className="pb-8">
        <header className="relative isolate h-[200px] w-full overflow-hidden bg-[#edf0df] sm:h-[205px]">
          <img
            src="/images/knowledge-banner-photo.avif"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[#343832]/45" />
          <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-9 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.75rem]">
                Kiến thức trái cây &amp; dinh dưỡng
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/95 drop-shadow-sm sm:text-base">
                Tổng hợp bài viết giúp bạn chọn, bảo quản và sử dụng trái cây thông minh hơn mỗi ngày.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
