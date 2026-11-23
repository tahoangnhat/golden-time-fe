import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Mail, Sparkles, Store } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Liên hệ Golden Time" },
      {
        name: "description",
        content: "Liên hệ Golden Time về tài khoản, đơn hàng, hồ sơ doanh nghiệp hoặc quyền riêng tư.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <div className="overflow-hidden bg-[#fffdf7] text-[#263c20]">
        <section className="relative isolate flex min-h-[340px] items-end justify-center overflow-hidden px-5 pb-12 pt-20 text-center sm:min-h-[380px] sm:pb-14">
          <img
            src="/images/about-berries.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_42%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/25 via-[#fffdf7]/55 to-[#fffdf7]" />
          <div className="relative mx-auto max-w-4xl">
            <Sparkles className="absolute -right-7 -top-7 h-10 w-10 rotate-12 text-[#f28a00] sm:-right-12 sm:-top-8 sm:h-14 sm:w-14" aria-hidden="true" />
            <h1 className="relative inline-block px-3 pb-2 text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="relative z-0 after:absolute after:bottom-0 after:left-0 after:-z-10 after:h-5 after:w-full after:rounded-full after:bg-[#e6e9d6] sm:after:h-7">
                Thông tin liên hệ
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#39452f] sm:text-lg sm:leading-8">
              Liên hệ Golden Time về tài khoản, đơn hàng, hồ sơ doanh nghiệp hoặc quyền riêng tư.
            </p>
          </div>
        </section>

        <section className="relative bg-[#fff6d8] px-4 pb-20 pt-5 sm:px-7 sm:pb-28 sm:pt-8">
          <div className="pointer-events-none absolute right-[7%] top-0 hidden -translate-y-1/2 text-[#f28a00] sm:block" aria-hidden="true">
            <Sparkles className="h-16 w-16 rotate-12" />
          </div>
          <div className="mx-auto grid max-w-[1520px] gap-5 sm:gap-6">
            <article className="grid min-h-[210px] items-center gap-5 rounded-[28px] border-2 border-[#20231f] bg-white p-5 shadow-[0_12px_28px_rgba(40,54,31,0.06)] sm:grid-cols-[250px_1fr] sm:gap-8 sm:rounded-[34px] sm:px-7 sm:py-6 lg:grid-cols-[300px_1fr] lg:gap-12 lg:px-10">
              <div className="flex items-center justify-center border-b border-[#397443]/70 pb-5 sm:h-full sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8 lg:pr-12">
                <div className="relative grid h-32 w-36 place-items-center rounded-[42%] bg-[#f0f1df] sm:h-40 sm:w-44">
                  <Leaf className="absolute -left-4 top-0 h-12 w-12 -rotate-45 fill-[#73a85b] text-[#73a85b] sm:-left-6 sm:h-14 sm:w-14" aria-hidden="true" />
                  <Mail className="h-16 w-16 -rotate-6 text-[#397443] sm:h-20 sm:w-20" strokeWidth={1.35} aria-hidden="true" />
                </div>
              </div>
              <div className="py-1">
                <h2 className="text-xl font-extrabold sm:text-2xl">Email hỗ trợ</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3c4536] sm:text-base sm:leading-7">
                  Gửi yêu cầu đến địa chỉ bên dưới. Với yêu cầu về dữ liệu cá nhân, hãy ghi rõ email tài khoản để chúng tôi xác minh.
                </p>
                <a
                  href="mailto:nhatdeveloper04@gmail.com"
                  className="mt-4 inline-flex min-h-12 w-full max-w-[520px] items-center gap-3 rounded-full bg-[#e9ebda] px-5 py-3 font-bold text-[#2d4024] underline decoration-1 underline-offset-2 transition hover:bg-[#dce4ca] sm:mt-5 sm:px-7 sm:text-lg"
                >
                  <Mail className="h-6 w-6 shrink-0 fill-[#719b5f] text-[#719b5f]" aria-hidden="true" />
                  <span className="break-all">nhatdeveloper04@gmail.com</span>
                </a>
              </div>
            </article>

            <article className="grid min-h-[210px] items-center gap-5 rounded-[28px] border-2 border-[#20231f] bg-white p-5 shadow-[0_12px_28px_rgba(40,54,31,0.06)] sm:grid-cols-[250px_1fr] sm:gap-8 sm:rounded-[34px] sm:px-7 sm:py-6 lg:grid-cols-[300px_1fr] lg:gap-12 lg:px-10">
              <div className="flex items-center justify-center border-b border-[#397443]/70 pb-5 sm:h-full sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8 lg:pr-12">
                <div className="relative grid h-32 w-36 place-items-center rounded-[42%] bg-[#f0f1df] sm:h-40 sm:w-44">
                  <Leaf className="absolute -left-4 top-0 h-12 w-12 -rotate-45 fill-[#73a85b] text-[#73a85b] sm:-left-6 sm:h-14 sm:w-14" aria-hidden="true" />
                  <Store className="h-16 w-16 text-[#397443] sm:h-20 sm:w-20" strokeWidth={1.5} aria-hidden="true" />
                </div>
              </div>
              <div className="py-1">
                <h2 className="text-xl font-extrabold sm:text-2xl">Tài khoản doanh nghiệp</h2>
                <p className="mt-2 text-sm leading-6 text-[#3c4536] sm:text-base sm:leading-7">
                  Đăng nhập bằng tài khoản doanh nghiệp đã được Admin chấp nhận.
                </p>
                <Link
                  to="/business/login"
                  className="mt-4 inline-flex min-h-12 w-full max-w-[520px] items-center justify-between gap-4 rounded-full bg-[#397443] py-1.5 pl-5 pr-2.5 font-bold text-white transition hover:bg-[#2f6539] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397443] focus-visible:ring-offset-2 sm:mt-5 sm:pl-7 sm:text-lg"
                >
                  <span className="inline-flex items-center gap-4">
                    <Store className="h-6 w-6" aria-hidden="true" />
                    Cổng doanh nghiệp
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eef0dc] text-[#397443]">
                    <ArrowRight className="h-6 w-6" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
