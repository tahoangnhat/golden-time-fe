import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, BarChart3, MapPin, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Về Golden Time" },
      {
        name: "description",
        content:
          "Tìm hiểu câu chuyện, sứ mệnh và tầm nhìn của Golden Time — nền tảng khám phá thông tin trái cây dành cho người tiêu dùng Việt Nam.",
      },
    ],
  }),
  component: AboutPage,
});

const AUDIENCES = [
  "Người mua muốn có thêm thông tin trước khi chọn trái cây",
  "Gia đình quan tâm đến dinh dưỡng, chất lượng và cách bảo quản",
  "Người dùng muốn tham khảo giá và tìm cửa hàng phù hợp",
  "Cửa hàng muốn giới thiệu sản phẩm và thông tin nguồn gốc rõ ràng",
];

const TOOLS = [
  { icon: Sparkles, label: "Khám phá trái cây", detail: "Thử tính năng phân tích hình ảnh bằng AI." },
  { icon: Apple, label: "Tìm hiểu dinh dưỡng", detail: "Tra cứu thông tin dinh dưỡng và kiến thức hữu ích." },
  { icon: BarChart3, label: "Tham khảo giá", detail: "Theo dõi mức giá và thời điểm cập nhật." },
  { icon: MapPin, label: "Tìm nguồn hàng", detail: "Xem thông tin cửa hàng và truy xuất lô hàng." },
];

function AboutPage() {
  const bannerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const title = banner.querySelector<HTMLElement>("[data-about-title]");
    const image = banner.querySelector<HTMLElement>("[data-about-image]");
    let frame = 0;

    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = Math.min(Math.max(window.scrollY, 0), 260);
        if (title) {
          title.style.transform = `translate3d(0, ${offset * 0.12}px, 0)`;
          title.style.opacity = String(1 - offset / 700);
        }
        if (image) image.style.transform = `translate3d(0, ${offset * 0.08}px, 0) scale(1.06)`;
      });
    };

    window.addEventListener("scroll", updateParallax, { passive: true });
    updateParallax();
    return () => {
      window.removeEventListener("scroll", updateParallax);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <SiteShell>
      <div className="bg-white text-foreground">
        <section ref={bannerRef} className="relative isolate min-h-[190px] overflow-hidden bg-[#606562] sm:min-h-[220px]">
          <div
            aria-hidden="true"
            data-about-image
            className="absolute inset-y-0 right-0 w-full bg-cover bg-[center_58%] will-change-transform sm:w-[58%]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #606562 0%, rgb(96 101 98 / 20%) 28%, rgb(20 31 23 / 55%) 100%), url('/images/golden-time-hero.jpg')",
            }}
          />
          <div className="relative mx-auto flex min-h-[190px] max-w-7xl items-center px-5 py-10 sm:min-h-[220px] lg:px-8">
            <div data-about-title className="will-change-transform">
              <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                Golden Time
              </h1>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:pt-16 lg:px-8">
          <section className="py-3 text-center sm:py-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Golden Time
            </p>
            <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Câu chuyện phía sau Golden Time
            </h2>
            <p className="mx-auto mt-5 max-w-5xl text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
              Khi chọn trái cây, người mua thường muốn biết thêm về chất lượng, dinh dưỡng, giá cả và nơi sản phẩm
              được trồng. Golden Time được xây dựng để đưa những thông tin ấy đến gần hơn, giúp việc tìm hiểu và
              lựa chọn trở nên thuận tiện trong một nền tảng duy nhất.
            </p>
          </section>

          <section className="mx-auto mt-9 max-w-5xl py-3 text-center sm:mt-11 sm:py-5">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="mx-auto mt-5 max-w-5xl text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
              Kết nối kiến thức về trái cây, công cụ phân tích, thông tin giá và dữ liệu truy xuất nguồn gốc để người
              dùng có thêm cơ sở tham khảo khi mua sắm. Chúng tôi hướng đến trải nghiệm rõ ràng, hữu ích và dễ tiếp
              cận cho cả người tiêu dùng lẫn cửa hàng.
            </p>
          </section>

          <section className="mx-auto mt-9 max-w-5xl py-3 text-center sm:mt-11 sm:py-5">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
              Chúng tôi phục vụ ai
            </h2>
            <ul className="mx-auto mt-5 max-w-4xl space-y-2 text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
              {AUDIENCES.map((audience) => (
                <li key={audience} className="flex items-start justify-center gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-primary">•</span>
                  <span>{audience}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mx-auto mt-9 max-w-6xl py-3 sm:mt-11 sm:py-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
                Những điều bạn có thể khám phá
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                Từ thông tin tham khảo đến các tiện ích mua sắm, Golden Time đang từng bước xây dựng trải nghiệm
                khám phá trái cây trọn vẹn hơn.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TOOLS.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="rounded-2xl border border-border/70 bg-[#fbfcf9] p-5 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cream text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-bold text-foreground">{label}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-9 max-w-5xl py-3 text-center sm:mt-11 sm:py-5">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
              Tầm nhìn
            </h2>
            <p className="mx-auto mt-5 max-w-5xl text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
              Golden Time hướng đến một thị trường trái cây minh bạch và dễ tiếp cận hơn, nơi người mua có thể tìm
              hiểu sản phẩm tự tin hơn và các cửa hàng có thêm cách chia sẻ thông tin đáng tin cậy.
            </p>
            <Link
              to="/contact"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-orange-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-accent focus-visible:ring-offset-2"
            >
              Kết nối với Golden Time
            </Link>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
