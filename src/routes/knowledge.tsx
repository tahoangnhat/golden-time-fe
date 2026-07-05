import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteShell, Section, SectionHeading } from "@/components/SiteShell";
import { ARTICLES, ARTICLE_CATEGORIES } from "@/lib/site-data";
import { ArticleCard } from "./index";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "Kiến thức trái cây & dinh dưỡng — Golden Time" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Tất cả");
  const [visible, setVisible] = useState(6);

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat = cat === "Tất cả" || a.category === cat;
      const matchQ = !q || (a.title + a.description).toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat]);

  return (
    <SiteShell>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="Thư viện kiến thức"
          title="Kiến thức trái cây & dinh dưỡng"
          subtitle="Tổng hợp các bài viết giúp bạn chọn, bảo quản và sử dụng trái cây thông minh hơn."
        />
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm bài viết..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {ARTICLE_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  cat === c
                    ? "gt-gradient text-white gt-shadow"
                    : "bg-white border border-border text-foreground/70 hover:bg-cream"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Section>
      <Section className="pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Không tìm thấy bài viết phù hợp.</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, visible).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisible((v) => v + 6)}
                  className="px-6 py-3 rounded-xl bg-white border border-border font-semibold hover:bg-cream"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </>
        )}
      </Section>
    </SiteShell>
  );
}