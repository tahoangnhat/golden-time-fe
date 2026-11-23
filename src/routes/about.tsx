import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowUpRight,
  BadgeCheck,
  Heart,
  Leaf,
  MapPin,
  ShoppingBasket,
  Sparkles,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Về Golden Time" },
      {
        name: "description",
        content:
          "Câu chuyện, sứ mệnh và tầm nhìn của Golden Time — giúp mọi người khám phá trái cây với thông tin rõ ràng và hữu ích hơn.",
      },
    ],
  }),
  component: AboutPage,
});

const AUDIENCES = [
  { icon: ShoppingBasket, label: "Người mua", description: "Có thêm thông tin hữu ích trước khi chọn trái cây." },
  { icon: Heart, label: "Gia đình", description: "Quan tâm đến chất lượng, dinh dưỡng và cách sử dụng." },
  { icon: Users, label: "Người dùng", description: "Muốn khám phá trái cây theo cách rõ ràng, dễ hiểu." },
  { icon: Store, label: "Cửa hàng", description: "Có thêm cách giới thiệu sản phẩm minh bạch." },
];

const DISCOVERIES = [
  { icon: Sparkles, label: "Khám phá trái cây", description: "Thử phân tích hình ảnh trái cây bằng AI." },
  { icon: Apple, label: "Tìm hiểu dinh dưỡng", description: "Tra cứu thông tin dinh dưỡng và kiến thức hữu ích." },
  { icon: Tag, label: "Tham khảo giá", description: "Xem mức giá và thời điểm nguồn dữ liệu được cập nhật." },
  { icon: MapPin, label: "Tìm nguồn hàng", description: "Khám phá cửa hàng và thông tin truy xuất sản phẩm." },
];

function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const items = page.querySelectorAll<HTMLElement>("[data-about-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    page.classList.add("about-page-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -7% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      page.classList.remove("about-page-ready");
    };
  }, []);

  return (
    <SiteShell>
      <div ref={pageRef} className="about-page overflow-hidden bg-[#fffdf7] text-[#18351f]">
        <section className="about-banner relative isolate mx-auto mt-7 min-h-[230px] max-w-[1440px] overflow-hidden sm:mt-10 sm:min-h-[290px]">
          <img
            src="/images/about-fruit-market.jpg"
            alt="Quầy trái cây nhiều màu sắc"
            className="absolute inset-0 h-full w-full object-cover object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102d19]/35 via-transparent to-[#102d19]/20" />
          <div className="absolute right-0 top-[22%] h-[58%] w-[38%] bg-[#145527]/95" />
          <div className="absolute left-0 top-0 flex h-[56%] w-[72%] items-center bg-[#36aa4d] px-6 sm:px-10 lg:px-16">
            <h1 data-about-reveal className="about-reveal relative z-10 text-4xl font-extrabold tracking-wide text-white sm:text-6xl lg:text-8xl">
              Golden Time
            </h1>
          </div>
          <div className="absolute bottom-0 left-0 h-[19%] w-full bg-gradient-to-b from-white/0 to-[#fffdf7]/80" />
        </section>

        <section className="about-story mx-auto max-w-5xl px-5 pb-24 pt-16 text-center sm:pb-32 sm:pt-20 lg:px-8">
          <h2 data-about-reveal className="about-reveal mx-auto w-fit text-4xl font-extrabold tracking-tight text-[#203e21] sm:text-6xl lg:text-7xl">
            <span className="relative z-0 inline-block px-3 pb-1 after:absolute after:bottom-0 after:left-0 after:-z-10 after:h-5 after:w-full after:rounded-full after:bg-[#dce8ca] sm:after:h-7">CÂU CHUYỆN</span>
          </h2>
          <p data-about-reveal className="about-reveal mx-auto mt-9 max-w-3xl text-base leading-8 text-[#28352e] sm:text-lg sm:leading-9">
            Khi chọn trái cây, người mua thường muốn biết thêm về chất lượng, dinh dưỡng, giá cả và nơi sản phẩm được trồng.
          </p>
          <p data-about-reveal className="about-reveal mx-auto mt-5 max-w-3xl text-base leading-8 text-[#28352e] sm:text-lg sm:leading-9">
            <strong className="font-extrabold text-[#2f9144]">Golden Time</strong> được xây dựng để đưa những thông tin ấy đến gần hơn, giúp việc tìm hiểu và lựa chọn trở nên thuận tiện trong một nền tảng duy nhất.
          </p>
        </section>

        <section className="about-wave-top relative bg-[#fff7dc] px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div data-about-reveal className="about-reveal max-w-2xl">
              <div className="mb-5 flex items-center gap-3 text-[#ef8b00]"><span className="h-1 w-12 rounded-full bg-[#ef8b00]" /><span className="text-xs font-extrabold uppercase tracking-[0.22em]">Golden Time</span></div>
              <h2 className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl">Sứ mệnh<br /><span className="font-medium">của chúng tôi</span></h2>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#364136] sm:text-lg">
                Kết nối kiến thức về trái cây, công cụ phân tích và thông tin truy xuất nguồn gốc để người dùng có thêm cơ sở tham khảo khi mua sắm.
              </p>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#364136] sm:text-lg">
                Chúng tôi hướng đến trải nghiệm rõ ràng, hữu ích và dễ tiếp cận cho cả người tiêu dùng lẫn cửa hàng.
              </p>
            </div>
            <div data-about-reveal className="about-reveal grid grid-cols-2 gap-4 sm:gap-6">
              <img src="/images/about-fruit-market.jpg" alt="Quầy trái cây tươi tại cửa hàng" loading="lazy" className="h-64 w-full rounded-[2rem] object-cover shadow-lg sm:h-[430px]" />
              <img src="/images/about-fruit-grid.jpg" alt="Táo, cam, táo xanh và chanh được bày bán" loading="lazy" className="mt-12 h-64 w-full rounded-[2rem] object-cover shadow-lg sm:mt-20 sm:h-[430px]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28 lg:px-8">
          <h2 data-about-reveal className="about-reveal mx-auto mb-12 w-fit text-center text-4xl font-extrabold uppercase tracking-tight text-[#203e21] sm:mb-16 sm:text-6xl">
            <span className="relative z-0 inline-block px-3 pb-1 after:absolute after:bottom-0 after:left-0 after:-z-10 after:h-5 after:w-full after:rounded-full after:bg-[#dce8ca] sm:after:h-7">Chúng tôi phục vụ ai?</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {AUDIENCES.map(({ icon: Icon, label, description }, index) => (
              <article key={label} data-about-reveal style={{ transitionDelay: `${index * 100}ms` }} className="about-reveal group min-h-40 rounded-[2rem] bg-[#72a35e] p-6 text-white transition-transform duration-300 hover:-translate-y-1 hover:bg-[#649653] sm:p-9">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/90"><Icon className="h-5 w-5" strokeWidth={2.5} /></div>
                <h3 className="mt-5 text-2xl font-semibold sm:text-3xl">{label}</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/90 sm:text-base">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-discover relative bg-[#e9ecd8] px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div data-about-reveal className="about-reveal mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#438349]"><LeafIcon /> Cùng khám phá</span>
              <h2 className="mt-5 text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-6xl">Những điều bạn có thể khám phá</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#475342] sm:text-lg">
                Từ thông tin tham khảo đến các tiện ích mua sắm, Golden Time đang từng bước xây dựng trải nghiệm khám phá trái cây trọn vẹn hơn.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {DISCOVERIES.map(({ icon: Icon, label, description }, index) => (
                <article key={label} data-about-reveal style={{ transitionDelay: `${index * 90}ms` }} className="about-reveal group min-h-64 rounded-[2rem] bg-[#72a35e] p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff9e7] text-[#6b9558] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"><Icon className="h-8 w-8" strokeWidth={2.2} /></span>
                  <h3 className="mt-7 text-2xl font-bold leading-tight">{label}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/90 sm:text-base">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-5 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div data-about-reveal className="about-reveal">
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#438349]"><BadgeCheck className="h-5 w-5" /> Hướng đến tương lai</span>
              <h2 className="mt-5 w-fit text-5xl font-extrabold uppercase tracking-tight text-[#203e21] sm:text-7xl"><span className="relative z-0 inline-block px-2 pb-2 after:absolute after:bottom-1 after:left-0 after:-z-10 after:h-5 after:w-full after:rounded-full after:bg-[#dce8ca]">Tầm nhìn</span></h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#29352d] sm:text-xl sm:leading-9">
                Golden Time hướng đến một thị trường trái cây minh bạch và dễ tiếp cận hơn, nơi người mua có thể tìm hiểu sản phẩm tự tin hơn và các cửa hàng có thêm cách chia sẻ thông tin đáng tin cậy.
              </p>
              <Link to="/contact" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#f28a00] px-7 py-4 text-base font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#dc7900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f28a00] focus-visible:ring-offset-2">
                Kết nối với chúng tôi <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <div data-about-reveal className="about-reveal relative min-h-[380px] sm:min-h-[560px]">
              <img src="/images/about-produce-shelves.jpg" alt="Kệ hàng trái cây nhiều loại tại cửa hàng" loading="lazy" className="absolute right-0 top-0 h-[78%] w-[68%] rounded-[2rem] object-cover shadow-xl sm:rounded-[2.5rem]" />
              <img src="/images/about-berries.jpg" alt="Các loại quả mọng tươi" loading="lazy" className="absolute bottom-0 left-0 h-[48%] w-[64%] rounded-[2rem] border-4 border-[#fffdf7] object-cover shadow-xl sm:rounded-[2.5rem]" />
              <span className="absolute bottom-[8%] right-[5%] grid h-16 w-16 place-items-center rounded-full bg-[#fff1ca] text-[#e38400] shadow-md sm:h-20 sm:w-20"><Sparkles className="h-8 w-8 sm:h-10 sm:w-10" /></span>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function LeafIcon() {
  return <Leaf className="h-4 w-4" aria-hidden="true" />;
}
