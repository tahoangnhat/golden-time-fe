import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowRight,
  BarChart3,
  Camera,
  Clock,
  Leaf,
  MapPin,
  PackageCheck,
  ScanLine,
  ShoppingBasket,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { api, type Article as ApiArticle } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Golden Time — Trái cây thông minh cùng AI" },
      {
        name: "description",
        content:
          "Golden Time là nền tảng công nghệ thực phẩm Việt Nam giúp đánh giá chất lượng trái cây bằng AI, xem dinh dưỡng, so sánh giá và mua trái cây đáng tin cậy.",
      },
      { property: "og:title", content: "Golden Time — Trái cây thông minh cùng AI" },
      { property: "og:description", content: "Quét AI · Dinh dưỡng · So sánh giá · Truy xuất nguồn gốc." },
    ],
  }),
  component: HomePage,
});

const homeFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ScanLine,
    title: "Phân tích chất lượng bằng AI",
    description: "Quét trái cây để xem độ tươi, độ chín và gợi ý lựa chọn nhanh hơn.",
  },
  {
    icon: Apple,
    title: "Dinh dưỡng trong từng loại quả",
    description: "Tra cứu calo, vitamin và thông tin hữu ích cho khẩu phần của bạn.",
  },
  {
    icon: BarChart3,
    title: "So sánh giá trái cây",
    description: "Tham khảo giá từ nhiều nguồn để chọn sản phẩm phù hợp ngân sách.",
  },
  {
    icon: ShoppingBasket,
    title: "Mua sắm tại cửa hàng đáng tin cậy",
    description: "Tìm sản phẩm, xem thông tin cửa hàng và đặt hàng trực tiếp.",
  },
  {
    icon: MapPin,
    title: "Tìm cửa hàng gần bạn",
    description: "Khám phá các cửa hàng trái cây quanh vị trí của bạn.",
  },
  {
    icon: PackageCheck,
    title: "Truy xuất nguồn gốc",
    description: "Xem thông tin lô hàng, nơi cung cấp và các mốc kiểm tra.",
  },
];

const guideSteps: { icon: LucideIcon; number: string; title: string; description: string }[] = [
  { icon: UserRound, number: "01", title: "Đăng nhập", description: "Đăng nhập để lưu kết quả quét vào tài khoản của bạn." },
  { icon: Camera, number: "02", title: "Chụp hoặc tải ảnh", description: "Mở Quét trái cây, chụp trực tiếp hoặc chọn ảnh rõ nét từ thiết bị." },
  { icon: ScanLine, number: "03", title: "Phân tích bằng AI", description: "Nhấn Phân tích ngay để xem đánh giá khi dịch vụ AI đã sẵn sàng." },
  { icon: BarChart3, number: "04", title: "Khám phá kết quả", description: "Xem chất lượng, độ tươi, độ chín rồi tra cứu dinh dưỡng hoặc giá." },
];

function HomePage() {
  const [latestArticles, setLatestArticles] = useState<ApiArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const heroRef = useRef<HTMLElement | null>(null);
  const featuresRef = useRef<HTMLElement | null>(null);
  const guideRef = useRef<HTMLElement | null>(null);
  const whySectionRef = useRef<HTMLElement | null>(null);
  const whyTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.articles()
      .then((articles) => {
        if (cancelled) return;
        const latest = articles
          .filter((article) => article.published)
          .sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);
        setLatestArticles(latest);
      })
      .catch(() => {
        if (!cancelled) setLatestArticles([]);
      })
      .finally(() => {
        if (!cancelled) setArticlesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-visible", Boolean(entry?.isIntersecting)),
      { threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = featuresRef.current;
    if (!section) return;

    const items = section.querySelectorAll<HTMLElement>(".home-feature-reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = guideRef.current;
    if (!section) return;

    const items = section.querySelectorAll<HTMLElement>(".home-guide-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -5% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = whySectionRef.current;
    const title = whyTitleRef.current;
    if (!section || !title) return;

    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-visible", Boolean(entry?.isIntersecting)),
      { threshold: 0.5 },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  return (
    <SiteShell>
      {/* HERO */}
      <section ref={heroRef} className="golden-time-hero relative isolate flex min-h-[640px] items-center overflow-hidden lg:min-h-[720px]">
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
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              <span className="hero-title-fade block whitespace-nowrap text-[clamp(1.5rem,4vw,3.75rem)]">Trái cây thông minh cùng</span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-title-slide inline-block text-primary">Golden Time</span>
              </span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-xl">
              Nền tảng giúp người dùng đánh giá chất lượng trái cây, xem dinh dưỡng, so sánh giá và mua trái
              cây đáng tin cậy — tất cả trong một ứng dụng.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8" aria-labelledby="latest-content-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="latest-content-title" className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Nội dung mới nhất
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              Khám phá nội dung mới nhất từ Golden Time.
            </p>
          </div>
          <Link
            to="/knowledge"
            className="group mb-1 inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/75"
          >
            Xem tất cả <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {articlesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Đang tải bài viết mới nhất">
            {[0, 1, 2].map((item) => (
              <div key={item} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : latestArticles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <LatestContentCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border bg-white px-5 py-8 text-center text-sm text-muted-foreground">
            Bài viết mới sẽ được cập nhật tại đây.
          </p>
        )}
      </section>

      <section
        ref={featuresRef}
        className="home-features mx-auto grid max-w-7xl items-start gap-12 px-5 pb-24 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8"
        aria-labelledby="home-features-title"
      >
        <div>
          <div className="home-feature-reveal max-w-2xl">
            <h2 id="home-features-title" className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
              Mọi điều cần thiết để chọn trái cây thông minh hơn
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Từ quét AI đến tìm cửa hàng, Golden Time giúp bạn tự tin hơn trong từng lựa chọn.
            </p>
          </div>

          <div className="mt-8 divide-y divide-border/80 border-b border-border/80">
            {homeFeatures.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="home-feature-reveal flex gap-4 py-4 sm:gap-5 sm:py-5"
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream text-primary sm:h-[52px] sm:w-[52px]">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="pt-0.5">
                  <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">{title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="home-feature-reveal relative mx-auto w-full max-w-[480px] lg:sticky lg:top-24" style={{ transitionDelay: "160ms" }}>
          <div aria-hidden="true" className="absolute inset-7 rounded-full bg-[radial-gradient(circle,#e9f2d7_0%,#f5f7eb_54%,rgba(255,255,255,0)_76%)]" />
          <div className="relative overflow-hidden rounded-[30px] border border-[#e4ebd9] bg-[#f6f8f0] p-4 shadow-[0_25px_65px_-35px_rgba(25,65,36,0.28)] sm:rounded-[36px] sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lg shadow-sm">🍊</span>
                <span>
                  <span className="block text-xs font-extrabold text-foreground">Golden Time</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">Trí tuệ trái cây AI</span>
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-primary shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI đang quét
              </span>
            </div>

            <div className="relative mt-5 grid min-h-[290px] place-items-center overflow-hidden rounded-[25px] bg-[linear-gradient(145deg,#e8f0d8,#f8f5df_53%,#f7dfb0)] sm:min-h-[340px] sm:rounded-[30px]">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,rgba(255,255,255,0.82),transparent_59%)]" />
              <div aria-hidden="true" className="absolute left-[13%] top-[18%] h-2 w-2 rounded-full bg-white/80" />
              <div aria-hidden="true" className="absolute right-[17%] top-[25%] h-3 w-3 rounded-full bg-white/80" />
              <span aria-hidden="true" className="relative z-10 -rotate-6 text-[135px] drop-shadow-[0_18px_14px_rgba(77,81,40,0.24)] transition-transform duration-700 hover:rotate-0 hover:scale-110 sm:text-[165px]">🥭</span>
              <span aria-hidden="true" className="absolute left-[16%] top-[20%] h-14 w-14 rounded-tl-xl border-l-[3px] border-t-[3px] border-white/90" />
              <span aria-hidden="true" className="absolute right-[16%] top-[20%] h-14 w-14 rounded-tr-xl border-r-[3px] border-t-[3px] border-white/90" />
              <span aria-hidden="true" className="absolute bottom-[18%] left-[16%] h-14 w-14 rounded-bl-xl border-b-[3px] border-l-[3px] border-white/90" />
              <span aria-hidden="true" className="absolute bottom-[18%] right-[16%] h-14 w-14 rounded-br-xl border-b-[3px] border-r-[3px] border-white/90" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Minh họa kết quả quét</span>
                  <span className="mt-1 block text-sm font-extrabold text-foreground">Xoài · Tươi tốt</span>
                </span>
                <span className="rounded-xl bg-[#edf5df] px-3 py-2 text-xs font-extrabold text-primary">92/100</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                ["Chất lượng", "AI đánh giá", "🌿"],
                ["Dinh dưỡng", "Thông tin quả", "🍃"],
                ["Giá tốt", "So sánh nhanh", "📊"],
              ].map(([label, detail, emoji]) => (
                <div key={label} className="rounded-2xl border border-[#e9ecdf] bg-white/90 p-3 text-center">
                  <span aria-hidden="true" className="text-base">{emoji}</span>
                  <p className="mt-1 text-[10px] font-extrabold text-foreground">{label}</p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -left-2 top-[15%] hidden items-center gap-2 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-lg sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff1d8] text-lg">🍎</span>
            <span><span className="block text-[9px] text-muted-foreground">Lựa chọn tươi ngon</span><span className="mt-0.5 block text-[11px] font-extrabold">Chọn quả ngon</span></span>
          </div>
          <div className="absolute -right-2 bottom-[15%] hidden items-center gap-2 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-lg sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf5df] text-lg">🛒</span>
            <span><span className="block text-[9px] text-muted-foreground">Cửa hàng gần bạn</span><span className="mt-0.5 block text-[11px] font-extrabold">Mua sắm tiện lợi</span></span>
          </div>
        </div>
      </section>

      <section
        ref={guideRef}
        className="home-guide mx-auto max-w-7xl px-5 pb-24 pt-2 lg:px-8"
        aria-labelledby="home-guide-title"
      >
        <div className="overflow-hidden rounded-[30px] bg-[#f7f8f3] px-5 py-8 sm:rounded-[38px] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="home-guide-reveal max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Hướng dẫn nhanh
              </span>
              <h2 id="home-guide-title" className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
                Bắt đầu với Golden Time thật dễ dàng
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Làm theo bốn bước đơn giản để quét trái cây và tìm hiểu thêm về lựa chọn của bạn.
              </p>
              <Link
                to="/scan"
                className="group mt-6 inline-flex items-center gap-2 rounded-xl gt-gradient px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Bắt đầu quét trái cây <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="home-guide-reveal relative mx-auto w-full max-w-[520px]" style={{ transitionDelay: "100ms" }}>
              <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,#e5efd5_0%,rgba(229,239,213,0)_72%)]" />
              <div className="relative mx-auto max-w-[390px] rounded-[28px] border border-white bg-white p-3 shadow-[0_22px_60px_-30px_rgba(38,67,43,0.3)] sm:rounded-[32px] sm:p-4">
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className="text-xs font-extrabold text-foreground">Kết quả phân tích</span>
                  <span className="rounded-full bg-[#edf5df] px-2.5 py-1 text-[9px] font-bold text-primary">Màn hình minh họa</span>
                </div>
                <div className="relative grid min-h-[180px] place-items-center overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#edf4df,#fff4dc_58%,#f8ddb0)] sm:min-h-[210px]">
                  <span aria-hidden="true" className="absolute left-[12%] top-[14%] h-10 w-10 rounded-tl-xl border-l-2 border-t-2 border-white/90" />
                  <span aria-hidden="true" className="absolute right-[12%] top-[14%] h-10 w-10 rounded-tr-xl border-r-2 border-t-2 border-white/90" />
                  <span aria-hidden="true" className="absolute bottom-[14%] left-[12%] h-10 w-10 rounded-bl-xl border-b-2 border-l-2 border-white/90" />
                  <span aria-hidden="true" className="absolute bottom-[14%] right-[12%] h-10 w-10 rounded-br-xl border-b-2 border-r-2 border-white/90" />
                  <span aria-hidden="true" className="text-[100px] drop-shadow-[0_15px_12px_rgba(90,75,41,0.2)] sm:text-[120px]">🥭</span>
                  <span className="absolute bottom-2.5 left-2.5 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-bold text-foreground shadow-sm">Xoài · Tươi tốt</span>
                  <span className="absolute bottom-2.5 right-2.5 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-extrabold text-primary shadow-sm">92/100</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[["Độ tươi", "Cao"], ["Độ chín", "Vừa ăn"], ["Độ ngọt", "Tự nhiên"]].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#f8f8f5] px-2 py-2.5 text-center">
                      <p className="text-[9px] text-muted-foreground">{label}</p>
                      <p className="mt-1 text-[10px] font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-1 top-[12%] hidden items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 shadow-lg sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff1d8] text-[#dd8413]"><Camera className="h-4 w-4" /></span>
                <span className="text-[10px] font-bold text-foreground">Chụp ảnh dễ dàng</span>
              </div>
            </div>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {guideSteps.map(({ icon: Icon, number, title, description }, index) => (
              <article
                key={number}
                className="home-guide-reveal group relative rounded-[22px] border border-transparent bg-white/75 p-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#cfe0b9] hover:shadow-[0_15px_35px_-20px_rgba(41,75,42,0.35)] sm:p-5"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f0f1f3] text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Bước {number}</p>
                <h3 className="mt-1.5 text-base font-extrabold tracking-tight text-foreground">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={whySectionRef}
        className="why-choose mx-auto grid max-w-7xl items-center gap-10 px-5 pb-24 pt-2 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-8"
        aria-labelledby="why-choose-title"
      >
        <div className="max-w-2xl">
          <h2
            ref={whyTitleRef}
            id="why-choose-title"
            className="why-choose-title text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            Tại sao nên chọn Golden Time?
          </h2>
          <ul className="relative mt-8 space-y-5 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-border">
            {[
              "Nhận diện và đánh giá chất lượng trái cây bằng AI",
              "So sánh giá thị trường từ nhiều nguồn",
              "Tra cứu thông tin dinh dưỡng chi tiết, dễ hiểu",
              "Xem độ tươi, độ chín và hướng dẫn bảo quản",
            ].map((benefit) => (
              <li key={benefit} className="relative flex items-start gap-4">
                <span className="relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fff2df]">
                  <span className="h-2 w-2 rounded-full bg-[#fb8500]" />
                </span>
                <p className="pt-1 text-sm font-semibold leading-6 text-foreground sm:text-base">{benefit}</p>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="hidden w-full max-w-[480px] justify-self-end lg:block">
          <svg viewBox="0 0 480 360" className="h-auto w-full" fill="none">
            <g fill="#F2F0F5">
              <path d="M408 72h72v72h-72z" />
              <path d="m336 144 72-72v72z" />
              <path d="M408 144h72v72h-72z" />
              <path d="m264 216 72-72v72z" />
              <path d="M336 216h72v72h-72z" />
              <path d="m408 216 72 72h-72z" />
              <path d="M192 288h72v72h-72z" />
              <path d="m264 288 72-72v72z" />
              <path d="M336 288h72v72h-72z" />
              <path d="m408 288 72 72h-72z" />
            </g>
            <g fill="#5F9861">
              <path d="m408 144 72 72h-72z" />
              <path d="m336 216 72 72h-72z" />
              <path d="M264 288h72v72h-72z" />
              <path d="m120 288 72 72h-72z" />
            </g>
            <g fill="#FB8500">
              <path d="m408 0 72 72h-72z" />
              <path d="m192 288 72 72h-72z" />
              <path d="m408 288 72 72h-72z" />
            </g>
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
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

    </SiteShell>
  );
}

function LatestContentCard({ article }: { article: ApiArticle }) {
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: article.slug }}
      className="group relative z-0 block aspect-[4/3] overflow-hidden rounded-xl bg-[#50524f] shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_22px_45px_-16px_rgba(20,35,23,0.5)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {article.coverUrl ? (
        <img
          src={article.coverUrl}
          alt={article.coverAlt || article.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className={`absolute inset-0 grid place-items-center bg-gradient-to-br ${article.gradient}`}>
          <span className="text-8xl drop-shadow-lg transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-6">
            {article.emoji}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/55 transition-colors duration-300 group-hover:bg-black/65" />
      <div className="absolute inset-0 grid place-items-center p-6 text-center sm:p-7">
        <h3 className="line-clamp-4 max-w-[22rem] text-xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-[1.035] sm:text-2xl lg:text-[1.75rem]">
          {article.title}
        </h3>
      </div>
      <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-white/95 text-primary opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
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
