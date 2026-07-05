import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Calendar, Clock, User, Facebook, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";
import { ARTICLES } from "@/lib/site-data";
import { ArticleCard } from "./index";

export const Route = createFileRoute("/knowledge/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = ARTICLES.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Bài viết"} — Golden Time` }],
  }),
});

const SECTIONS = [
  {
    id: "ly-do",
    title: "Vì sao cần kiểm tra độ tươi của trái cây?",
    body: "Trái cây tươi không chỉ ngon hơn mà còn giữ được tối đa vitamin, khoáng chất và chất chống oxy hóa. Mua phải trái cây cũ hoặc bị dập có thể ảnh hưởng đến hương vị, độ an toàn và lãng phí chi phí. Việc kiểm tra nhanh trước khi mua giúp bạn tiết kiệm và bảo vệ sức khỏe gia đình.",
  },
  {
    id: "mau-sac",
    title: "Quan sát màu sắc và bề mặt vỏ",
    body: "Mỗi loại trái cây có một bảng màu đặc trưng khi chín tới. Vỏ căng bóng, đều màu và không có vết thâm là dấu hiệu rõ ràng. Tránh các quả có đốm nâu lan rộng, vỏ nhăn hoặc dấu hiệu mốc nhẹ ở cuống.",
  },
  {
    id: "mui-huong",
    title: "Kiểm tra mùi hương",
    body: "Mùi hương tự nhiên, dịu nhẹ và ngọt là dấu hiệu của trái cây chín đúng độ. Mùi lên men chua, gắt hoặc không có mùi (do bảo quản lạnh quá lâu) thường cho thấy chất lượng đã giảm.",
  },
  {
    id: "do-cung",
    title: "Kiểm tra độ cứng và vết dập",
    body: "Bấm nhẹ vào quả: cảm giác chắc tay nhưng vẫn có độ đàn hồi nhỏ là tốt nhất. Quá mềm thường đã chín quá hoặc bị dập bên trong. Nên xoay quả để kiểm tra toàn bộ bề mặt, tránh các vết lõm bất thường.",
  },
  {
    id: "tranh-mua",
    title: "Khi nào nên tránh mua?",
    body: "Tránh các quả có dấu hiệu rỉ nước, có nấm mốc trắng/xanh, mùi chua nồng, hoặc cuống bị úng. Nếu nhiều quả trong cùng một sạp đều có chung dấu hiệu, có thể cả lô hàng đã bảo quản không tốt.",
  },
  {
    id: "golden-time",
    title: "Golden Time hỗ trợ người dùng như thế nào?",
    body: "Ứng dụng Golden Time cho phép bạn quét trái cây bằng camera để AI đánh giá nhanh độ tươi, độ chín và đề xuất điểm chất lượng. Bạn còn có thể so sánh giá tại các cửa hàng uy tín gần bạn và xem thông tin truy xuất nguồn gốc theo lô hàng.",
  },
  {
    id: "ket-luan",
    title: "Kết luận",
    body: "Chỉ cần vài giây quan sát và sử dụng công cụ hỗ trợ như Golden Time, bạn có thể chọn được trái cây tươi ngon mỗi ngày, vừa tiết kiệm chi phí vừa đảm bảo sức khỏe cho cả gia đình.",
  },
];

function ArticlePage() {
  const article = Route.useLoaderData();
  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <SiteShell>
      <Section className="pt-10 lg:pt-14 pb-8 max-w-4xl">
        <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" /> Tất cả bài viết
        </Link>
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-cream px-3 py-1 rounded-full mb-4">
          {article.category}
        </span>
        <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-8">
          <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {article.author}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {article.date}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readingTime}</span>
        </div>
        <div className={`h-72 lg:h-96 rounded-3xl bg-gradient-to-br ${article.gradient} grid place-items-center text-9xl mb-10`}>
          {article.emoji}
        </div>
      </Section>

      <Section className="py-0 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_240px] gap-12">
          <article className="prose max-w-none">
            {SECTIONS.map((s) => (
              <div key={s.id} id={s.id} className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-extrabold mb-3">{s.title}</h2>
                <p className="text-foreground/80 leading-relaxed">{s.body}</p>
              </div>
            ))}
            <div className="mt-10 p-5 rounded-2xl bg-cream border border-border text-sm text-muted-foreground">
              <strong className="text-foreground">Lưu ý:</strong> Thông tin trong bài viết chỉ mang tính tham khảo và
              không thay thế tư vấn chuyên môn về dinh dưỡng hoặc sức khỏe.
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm font-semibold">Chia sẻ:</span>
              <a href="#" className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-[oklch(0.6_0.18_255)] text-white text-sm">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white border border-border text-sm font-semibold"
              >
                <LinkIcon className="h-4 w-4" /> Copy link
              </button>
            </div>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-24 p-5 rounded-2xl bg-white border border-border">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Mục lục</div>
              <ul className="space-y-2 text-sm">
                {SECTIONS.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`} className="text-foreground/70 hover:text-primary">{s.title}</a></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl font-extrabold mb-6">Bài viết liên quan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {related.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </div>
      </Section>
    </SiteShell>
  );
}