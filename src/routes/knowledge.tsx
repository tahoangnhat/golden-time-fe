import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, LoaderCircle } from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";
import { ARTICLE_CATEGORIES } from "@/lib/site-data";
import { api, type Article } from "@/lib/api";
import { ArticleCard } from "./index";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Kiến thức trái cây & dinh dưỡng — Golden Time" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Tất cả");
  const [visible, setVisible] = useState(6);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api.articles().then(setArticles).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được bài viết."))
      .finally(() => setLoading(false));
  }, []);
  const categories = useMemo(() => ["Tất cả", ...new Set(articles.map((article) => article.category))], [articles]);
  const filtered = useMemo(() => articles.filter((article) => (cat === "Tất cả" || article.category === cat)
    && (!q || `${article.title}${article.description || ""}`.toLowerCase().includes(q.toLowerCase()))), [articles, q, cat]);
  return (
    <SiteShell>
      <Section className="pb-8"><SectionHeading eyebrow="Thư viện kiến thức" title="Kiến thức trái cây & dinh dưỡng" subtitle="Tổng hợp các bài viết giúp bạn chọn, bảo quản và sử dụng trái cây thông minh hơn." />
        <div className="max-w-3xl mx-auto"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Tìm bài viết..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-border focus:border-primary focus:outline-none text-sm" /></div>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">{categories.length > 1 ? categories.map((category) => <button key={category} onClick={() => setCat(category)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${cat === category ? "gt-gradient text-white gt-shadow" : "bg-white border border-border text-foreground/70 hover:bg-cream"}`}>{category}</button>) : ARTICLE_CATEGORIES.slice(0, 1).map((category) => <span key={category} className="px-4 py-2 rounded-full text-xs bg-white border border-border">{category}</span>)}</div>
        </div>
      </Section>
      <Section className="pt-4">{loading ? <div className="py-16 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <div className="text-center py-16 text-red-700">{error}</div> : filtered.length === 0 ? <div className="text-center py-20 text-muted-foreground">Không tìm thấy bài viết phù hợp.</div> : <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.slice(0, visible).map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
        {visible < filtered.length && <div className="mt-12 text-center"><button onClick={() => setVisible((value) => value + 6)} className="px-6 py-3 rounded-xl bg-white border border-border font-semibold hover:bg-cream">Xem thêm</button></div>}
      </>}</Section>
    </SiteShell>
  );
}
