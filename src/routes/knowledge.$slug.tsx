import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, User, Facebook, Link as LinkIcon, ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell, Section } from "@/components/SiteShell";
import { api, formatDate, type Article } from "@/lib/api";
import { ArticleCard } from "./index";

export const Route = createFileRoute("/knowledge/$slug")({
  head: () => ({ meta: [{ title: "Bài viết — Golden Time" }] }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.article(slug), api.articles()]).then(([current, all]) => {
      setArticle(current);
      setRelated(all.filter((item) => item.slug !== current.slug).slice(0, 3));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được bài viết."))
      .finally(() => setLoading(false));
  }, [slug]);
  return (
    <SiteShell>
      <Section className="pt-10 lg:pt-14 pb-8 max-w-4xl">
        <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"><ArrowLeft className="h-4 w-4" /> Tất cả bài viết</Link>
        {loading ? <div className="py-20 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error || !article ? <div className="py-16 text-center text-red-700">{error || "Không tìm thấy bài viết."}</div> : <>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-cream px-3 py-1 rounded-full mb-4">{article.category}</span>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-8"><span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {article.author}</span><span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(article.publishedAt)}</span><span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readingTime}</span></div>
          <div className={`h-72 lg:h-96 rounded-3xl bg-gradient-to-br ${article.gradient} grid place-items-center text-9xl mb-10`}>{article.emoji}</div>
          {article.description && <p className="text-lg font-semibold leading-relaxed mb-6">{article.description}</p>}
          <article className="prose max-w-none"><p className="text-foreground/80 leading-relaxed whitespace-pre-line">{article.body}</p><div className="mt-10 p-5 rounded-2xl bg-cream border border-border text-sm text-muted-foreground"><strong className="text-foreground">Lưu ý:</strong> Thông tin trong bài viết chỉ mang tính tham khảo, không thay thế tư vấn chuyên môn về dinh dưỡng hoặc sức khỏe.</div>
            <div className="mt-8 flex items-center gap-3"><span className="text-sm font-semibold">Chia sẻ:</span><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`} target="_blank" rel="noreferrer" className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-[oklch(0.6_0.18_255)] text-white text-sm"><Facebook className="h-4 w-4" /> Facebook</a><button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white border border-border text-sm font-semibold"><LinkIcon className="h-4 w-4" /> Copy link</button></div>
          </article>
        </>}
      </Section>
      {related.length > 0 && <Section className="py-0 max-w-6xl"><h2 className="text-2xl font-extrabold mb-6">Bài viết liên quan</h2><div className="grid md:grid-cols-3 gap-6">{related.map((item) => <ArticleCard key={item.slug} article={item} />)}</div></Section>}
    </SiteShell>
  );
}
