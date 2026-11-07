import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  CircleHelp,
  Leaf,
  Menu,
  ScanLine,
  ShoppingBasket,
  Sparkles,
  X,
} from "lucide-react";
import type { Article as ApiArticle } from "@/lib/api";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.fruitscanai.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FruitScan AI — Unlock the secrets of your fruit" },
      {
        name: "description",
        content:
          "Identify fruits, check freshness and explore nutrition with FruitScan AI. Scan a fruit and get helpful insights in seconds.",
      },
      { property: "og:title", content: "FruitScan AI — Unlock the secrets of your fruit" },
      {
        property: "og:description",
        content: "Your intelligent fruit companion for identification, nutrition and freshness.",
      },
    ],
  }),
  component: FruitScanLanding,
});

const features = [
  {
    icon: ScanLine,
    number: "01",
    title: "Advanced AI analysis",
    description: "Point your camera at a fruit and let AI help identify its variety and key details.",
    tone: "orange",
  },
  {
    icon: Apple,
    number: "02",
    title: "Smart calorie tracking",
    description: "Add scanned fruit to your daily log and keep your nutrition in one simple view.",
    tone: "peach",
  },
  {
    icon: CalendarClock,
    number: "03",
    title: "Food management tools",
    description: "Use expiry reminders, ripeness alerts and cleaning tips to waste less food.",
    tone: "yellow",
  },
  {
    icon: Leaf,
    number: "04",
    title: "Detailed nutrition insights",
    description: "Explore useful nutritional information and storage ideas for the fruit you love.",
    tone: "green",
  },
  {
    icon: BookOpenCheck,
    number: "05",
    title: "Recipes before expiry",
    description: "Get recipe inspiration for fruit that is ready to be enjoyed soon.",
    tone: "pink",
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Ripeness & storage guide",
    description: "Learn when fruit is ready and how to store it so it stays fresh for longer.",
    tone: "lavender",
  },
];

const articles = [
  {
    category: "THE FRUIT GUIDE",
    title: "Why choose FruitScan AI as your intelligent fruit companion?",
    description: "A simpler way to learn about freshness, nutrition and the fruit in your basket.",
    art: "🍊",
    tint: "from-[#fff0d8] to-[#ffd49a]",
  },
  {
    category: "PLANS & PRICING",
    title: "Choosing your perfect FruitScan AI plan",
    description: "Find the plan that fits the way you discover and enjoy fresh fruit.",
    art: "🍋",
    tint: "from-[#fff9cc] to-[#f8df73]",
  },
  {
    category: "DID YOU KNOW?",
    title: "4 surprising things your AI fruit scanner can do",
    description: "Go beyond identification with ideas for better everyday fruit habits.",
    art: "🍓",
    tint: "from-[#ffe4df] to-[#ffb4a7]",
  },
];

const faqs = [
  {
    question: "How accurate is the fruit identification?",
    answer:
      "FruitScan AI uses image recognition to suggest a fruit and share related information. For the clearest result, use a well-lit photo with the fruit in focus; results can vary with image quality and fruit variety.",
  },
  {
    question: "How many photos can I analyze?",
    answer:
      "The Free plan includes 10 scans when you get started. Basic includes 500 fruit scans each month, while Premium includes unlimited scans.",
  },
  {
    question: "Can it identify exotic fruits?",
    answer:
      "FruitScan AI is designed to recognize a broad range of fruit. Less common varieties may be harder to identify, so a clear photo from more than one angle can help.",
  },
];

function FruitScanLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="top" className="fruit-landing min-h-screen overflow-hidden bg-white text-[#202020]">
      <header className="relative z-30 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between rounded-full border border-black/[0.06] bg-white/90 px-4 py-2.5 shadow-[0_8px_30px_rgba(68,48,18,0.06)] backdrop-blur-xl sm:px-6 sm:py-3">
          <a href="#top" className="group inline-flex items-center gap-3" aria-label="FruitScan AI home">
            <CitrusMark className="h-10 w-10 transition-transform duration-500 group-hover:rotate-12 sm:h-11 sm:w-11" />
            <span className="text-[15px] font-extrabold tracking-[-0.04em] sm:text-base">
              fruit<span className="text-[#fb8500]">scan</span><span className="font-medium">ai</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#646464] lg:flex">
            <a className="transition-colors hover:text-[#f47b00]" href="#features">Features</a>
            <a className="transition-colors hover:text-[#f47b00]" href="#plans">Plans</a>
            <a className="transition-colors hover:text-[#f47b00]" href="#stories">Stories</a>
            <a className="transition-colors hover:text-[#f47b00]" href="#faq">FAQ</a>
          </nav>

          <a
            href={playStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[#fb8500] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(251,133,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ed7800] hover:shadow-[0_12px_25px_rgba(251,133,0,0.28)] lg:inline-flex"
          >
            Download app <ArrowUpRight className="h-4 w-4" />
          </a>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-[#424242] transition hover:bg-[#fff2e2] lg:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mx-auto mt-2 grid max-w-[1240px] gap-1 rounded-[26px] border border-black/[0.06] bg-white p-3 shadow-xl lg:hidden">
            {[
              ["Features", "#features"],
              ["Plans", "#plans"],
              ["Stories", "#stories"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a key={label} href={href} onClick={closeMenu} className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#464646] transition hover:bg-[#fff5e8] hover:text-[#f47b00]">
                {label}
              </a>
            ))}
            <a href={playStoreUrl} target="_blank" rel="noreferrer" onClick={closeMenu} className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#fb8500] px-4 py-3 text-sm font-bold text-white">
              Download app <ArrowUpRight className="h-4 w-4" />
            </a>
          </nav>
        )}
      </header>

      <section className="relative isolate px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,#fff1d6_0%,rgba(255,241,214,0)_70%)] sm:-right-12 sm:top-4" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-36 bottom-[-150px] -z-10 h-[390px] w-[390px] rounded-full bg-[radial-gradient(circle,#fff7ea_0%,rgba(255,247,234,0)_70%)]" />

        <div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div className="hero-copy max-w-[610px]">
            <div className="mb-6 inline-flex animate-[rise-in_650ms_ease-out_both] items-center gap-2 rounded-full border border-[#f7dfc5] bg-white/90 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#d76e00] shadow-[0_6px_18px_rgba(108,71,22,0.06)] sm:text-xs">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fff0dc]"><Sparkles className="h-3 w-3" /></span>
              Your little fruit intelligence
            </div>
            <h1 className="max-w-[640px] animate-[rise-in_750ms_90ms_ease-out_both] text-[clamp(2.7rem,7vw,5rem)] font-light leading-[1.04] tracking-[-0.065em] text-[#242424]">
              Unlock the secrets of your <span className="relative inline-block font-semibold">fruit<span aria-hidden="true" className="absolute -bottom-1 left-[4%] h-[7px] w-[94%] -rotate-2 rounded-full bg-[#fb8500] sm:-bottom-0.5 sm:h-[9px]" /></span>.
            </h1>
            <p className="mt-7 animate-[rise-in_750ms_180ms_ease-out_both] text-[1.05rem] font-semibold tracking-[-0.025em] text-[#333] sm:text-xl">
              Fruit ScanAI
            </p>
            <p className="mt-3 max-w-[515px] animate-[rise-in_750ms_260ms_ease-out_both] text-[15px] leading-7 text-[#777] sm:text-base sm:leading-8">
              Instantly identify fruits and their nutritional value with just a scan. Discover ripeness, variety, and more, all at your fingertips.
            </p>
            <div className="mt-8 flex animate-[rise-in_750ms_340ms_ease-out_both] flex-wrap items-center gap-3">
              <a href={playStoreUrl} target="_blank" rel="noreferrer" className="group inline-flex h-[54px] items-center gap-3 rounded-[15px] bg-[#fb8500] px-6 text-sm font-bold text-white shadow-[0_12px_24px_rgba(251,133,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#ef7800] hover:shadow-[0_17px_30px_rgba(251,133,0,0.28)]">
                Download now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#features" className="inline-flex h-[54px] items-center gap-2 rounded-[15px] border border-[#eee5da] bg-white/75 px-5 text-sm font-bold text-[#4d4d4d] transition hover:border-[#f7c58f] hover:bg-[#fffaf3]">
                Explore features <ArrowDown className="h-4 w-4 text-[#f47b00]" />
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs text-[#8a8177]">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#fff1d8]">🍋</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#ffe6df]">🍓</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#f3f1da]">🥝</span>
              </div>
              <span>Curiosity, made fresh.</span>
            </div>
          </div>

          <div className="hero-art relative mx-auto w-full max-w-[470px] animate-[rise-in_850ms_140ms_ease-out_both] lg:ml-auto">
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffe6bd_0%,#fff5e5_50%,rgba(255,255,255,0)_72%)] sm:h-[420px] sm:w-[420px]" />
            <div aria-hidden="true" className="float-citrus absolute -right-1 top-4 z-10 grid h-[68px] w-[68px] place-items-center rounded-full border-[6px] border-white bg-[radial-gradient(circle_at_35%_30%,#ffe084,#ff9f1c_60%,#ee7400)] text-3xl shadow-[0_14px_30px_rgba(198,105,13,0.2)] sm:-right-2 sm:top-2 sm:h-[82px] sm:w-[82px]">🍊</div>
            <div aria-hidden="true" className="float-citrus-slow absolute -left-1 top-[40%] z-20 grid h-[52px] w-[52px] place-items-center rounded-full border-[5px] border-white bg-[radial-gradient(circle_at_35%_30%,#fff5b4,#ffd84a_58%,#f8a500)] text-[25px] shadow-[0_12px_24px_rgba(198,105,13,0.14)] sm:-left-3 sm:h-[62px] sm:w-[62px]">🍋</div>

            <div className="relative mx-auto w-[min(82%,326px)] rounded-[38px] border border-white/80 bg-white p-[9px] shadow-[0_28px_80px_rgba(133,83,19,0.17)] sm:w-[326px] sm:rounded-[42px] sm:p-[11px]">
              <div className="relative min-h-[460px] overflow-hidden rounded-[30px] bg-[#fffaf3] px-5 pb-5 pt-4 sm:min-h-[490px] sm:rounded-[33px] sm:px-6">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#4a4037]"><span>9:41</span><span className="flex gap-1.5"><span>●●●</span><span>▰</span></span></div>
                <div className="mt-5 flex items-center justify-between">
                  <div><p className="text-[10px] text-[#9d8d7b]">Good morning,</p><p className="mt-0.5 text-[16px] font-extrabold tracking-[-0.04em]">Fruit lover!</p></div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-sm">☀️</span>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(102,76,45,0.05)]">
                  <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#a69a8b]">Today&apos;s discovery</p><p className="mt-1 text-[13px] font-extrabold">Sweet & sunny</p></div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fff2dc] text-[#f88a00]"><Sparkles className="h-4 w-4" /></span>
                </div>
                <div className="relative mt-4 grid min-h-[210px] place-items-center overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#fff1ce,#ffd48e_57%,#ffb968)]">
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.8),transparent_52%)]" />
                  <div aria-hidden="true" className="absolute left-[12%] top-[18%] h-2 w-2 rounded-full bg-white/80" />
                  <div aria-hidden="true" className="absolute right-[18%] top-[25%] h-3 w-3 rounded-full bg-white/70" />
                  <span aria-hidden="true" className="fruit-emoji relative z-10 -rotate-6 text-[112px] drop-shadow-[0_15px_12px_rgba(126,73,18,0.19)]">🥭</span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-[15px] border border-white/70 bg-white/85 px-3 py-2 backdrop-blur">
                    <div><p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#ab9071]">AI identified</p><p className="mt-0.5 text-xs font-extrabold">Mango</p></div>
                    <span className="rounded-full bg-[#e8f4d7] px-2.5 py-1 text-[9px] font-bold text-[#548128]">Fresh</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[["Calories", "60 kcal"], ["Vitamin C", "36%"], ["Ripeness", "Ready"]].map(([label, value], index) => (
                    <div key={label} className="rounded-[15px] bg-white px-2 py-3 text-center shadow-[0_7px_20px_rgba(102,76,45,0.04)]">
                      <span className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[10px] ${index === 0 ? "bg-[#fff0d9] text-[#ed8507]" : index === 1 ? "bg-[#eff4dc] text-[#679342]" : "bg-[#ffede7] text-[#e77a5e]"}`}>{index === 0 ? "✦" : index === 1 ? "●" : "✓"}</span>
                      <p className="mt-1.5 text-[8px] text-[#9b8d7d]">{label}</p><p className="mt-0.5 text-[9px] font-extrabold text-[#463e36]">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[15px] bg-[#fb8500] text-[11px] font-bold text-white shadow-[0_8px_15px_rgba(251,133,0,0.18)]"><ScanLine className="h-4 w-4" /> Scan a fruit</div>
              </div>
            </div>

            <div className="absolute -left-1 top-[23%] z-20 hidden items-center gap-2.5 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-[0_12px_30px_rgba(85,62,31,0.12)] sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0dc] text-[#ef8707]"><ScanLine className="h-[18px] w-[18px]" /></span>
              <span><span className="block text-[9px] text-[#a39789]">Quick scan</span><span className="mt-0.5 block text-[11px] font-extrabold">Insights in a moment</span></span>
            </div>
            <div className="absolute -right-1 bottom-[16%] z-20 hidden items-center gap-2.5 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-[0_12px_30px_rgba(85,62,31,0.12)] sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf5de] text-[#719d48]"><Leaf className="h-[18px] w-[18px]" /></span>
              <span><span className="block text-[9px] text-[#a39789]">Your daily guide</span><span className="mt-0.5 block text-[11px] font-extrabold">Fresh ideas, every day</span></span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-[920px] flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[#f1ede7] pt-6 text-[11px] font-semibold text-[#988f84] sm:mt-20 sm:gap-x-12 sm:text-xs">
          <span className="inline-flex items-center gap-2"><ScanLine className="h-4 w-4 text-[#fb8500]" /> Fruit identification</span>
          <span className="inline-flex items-center gap-2"><Leaf className="h-4 w-4 text-[#fb8500]" /> Nutrition insights</span>
          <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#fb8500]" /> Ripeness guidance</span>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10" id="about">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 rounded-[30px] bg-[#fff8ef] p-6 sm:rounded-[40px] sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:p-14">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e4790a]"><span className="h-px w-6 bg-[#f7a33c]" /> Fresh thinking</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-[2.7rem]">A little more wonder in every bite.</h2>
          </div>
          <div className="lg:border-l lg:border-[#f0e5d8] lg:pl-12">
            <p className="text-sm leading-7 text-[#777168] sm:text-[15px] sm:leading-8">FruitScan AI brings fruit discovery, nutrition and freshness guidance together in one simple place. Take a closer look at what you eat, learn something new and make your next fruit choice with confidence.</p>
            <a href="#features" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#e87900] transition hover:gap-3">Learn more <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10" id="features">
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-[620px] text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fff2e1] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#d9780a]"><Sparkles className="h-3.5 w-3.5" /> Explore our app</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.8rem]">Small scans. <span className="text-[#f58208]">Big discoveries.</span></h2>
            <p className="mt-4 text-sm leading-7 text-[#858078] sm:text-[15px]">Everything you need to get to know your fruit, all at your fingertips.</p>
          </div>

          <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, number, title, description, tone }) => (
              <article key={number} className="group relative overflow-hidden rounded-[25px] border border-[#f0ece7] bg-white p-5 transition duration-300 hover:-translate-y-1.5 hover:border-[#f5d6b2] hover:shadow-[0_20px_50px_rgba(111,71,22,0.09)] sm:rounded-[28px] sm:p-6">
                <span className={`grid h-[50px] w-[50px] place-items-center rounded-[17px] ${toneClass(tone)} transition duration-300 group-hover:rotate-[-5deg] group-hover:scale-105`}><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
                <span className="absolute right-5 top-6 text-[11px] font-extrabold tracking-[0.12em] text-[#d9d2c8]">{number}</span>
                <h3 className="mt-6 text-[16px] font-extrabold tracking-[-0.03em] text-[#292621]">{title}</h3>
                <p className="mt-2.5 max-w-[290px] text-[13px] leading-6 text-[#888178]">{description}</p>
                <span aria-hidden="true" className="absolute -bottom-9 -right-8 h-24 w-24 rounded-full border border-[#f6eee5] transition duration-500 group-hover:scale-125" />
              </article>
            ))}
          </div>
          <div className="mt-9 text-center">
            <a href={playStoreUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-[#eee4d8] px-5 py-3 text-xs font-bold text-[#51483e] transition hover:border-[#f1bb7c] hover:bg-[#fffaf4]">Explore all app features <ArrowRight className="h-4 w-4 text-[#f58208] transition-transform group-hover:translate-x-1" /></a>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="video-title">
        <div className="mx-auto grid max-w-[1120px] items-center gap-8 rounded-[30px] bg-[#24211e] p-6 text-white sm:rounded-[38px] sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:p-12">
          <div className="py-2">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#ffbd70]"><span className="h-1.5 w-1.5 rounded-full bg-[#fb8500]" /> Meet FruitScan AI</p>
            <h2 id="video-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-[2.4rem]">A fresh perspective on fruit.</h2>
            <p className="mt-4 text-sm leading-7 text-white/60">See how a simple scan can open up a world of fruit knowledge.</p>
            <a href="https://www.youtube.com/watch?v=iRtbbxop8HA" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-[#29231d] transition hover:-translate-y-0.5 hover:bg-[#fff2df]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#fb8500] text-white">▶</span> Watch introduction</a>
          </div>
          <a href="https://www.youtube.com/watch?v=iRtbbxop8HA" target="_blank" rel="noreferrer" aria-label="Watch the FruitScan AI introduction video" className="group relative block aspect-video overflow-hidden rounded-[23px] bg-[radial-gradient(circle_at_70%_40%,#f7a439_0%,#965423_20%,#3a2d22_62%,#211e1a_100%)] shadow-[0_20px_45px_rgba(0,0,0,0.28)]">
            <span aria-hidden="true" className="absolute -right-4 top-[-35%] text-[170px] opacity-80 transition duration-700 group-hover:scale-110 sm:text-[230px]">🍊</span>
            <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-black/45 to-transparent" />
            <span className="absolute inset-0 grid place-items-center"><span className="grid h-[62px] w-[62px] place-items-center rounded-full border border-white/50 bg-white/90 pl-1 text-[#ee7e08] shadow-xl transition duration-300 group-hover:scale-110 group-hover:bg-white">▶</span></span>
            <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/90 backdrop-blur sm:bottom-5 sm:left-5">Fruit intelligence, in a nutshell</span>
          </a>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10" id="stories">
        <div className="mx-auto max-w-[1120px]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e4790a]">A little fresh reading</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.7rem]">Our latest stories</h2>
              <p className="mt-3 text-sm text-[#888178]">A few more ways to get curious about fruit.</p>
            </div>
            <a href="https://fruitscanai.odoo.com/blog" target="_blank" rel="noreferrer" className="group mb-1 inline-flex items-center gap-2 text-xs font-bold text-[#e87900] transition hover:gap-3">See all stories <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <a key={article.title} href="https://fruitscanai.odoo.com/blog" target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[26px] border border-[#eeeae4] bg-white p-2 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(111,71,22,0.09)]">
                <div className={`relative grid h-[175px] place-items-center overflow-hidden rounded-[20px] bg-gradient-to-br ${article.tint}`}>
                  <span aria-hidden="true" className="absolute -right-3 -top-8 text-[125px] opacity-20 blur-[1px]">{article.art}</span>
                  <span aria-hidden="true" className="relative text-[88px] drop-shadow-[0_12px_14px_rgba(115,67,16,0.16)] transition duration-500 group-hover:scale-110 group-hover:rotate-6">{article.art}</span>
                  <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-extrabold tracking-[0.1em] text-[#79552b] backdrop-blur">{article.category}</span>
                </div>
                <div className="px-3 pb-4 pt-4">
                  <h3 className="text-[15px] font-extrabold leading-snug tracking-[-0.025em] text-[#2d2b27] transition-colors group-hover:text-[#e87900]">{article.title}</h3>
                  <p className="mt-2 text-[12px] leading-5 text-[#89837b]">{article.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-[#e87900]">Read story <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#fff8ef] px-5 py-16 sm:px-8 sm:py-24 lg:px-10" id="plans">
        <div aria-hidden="true" className="absolute -right-24 top-0 -z-10 h-[330px] w-[330px] rounded-full border border-[#f6e7d3]" />
        <div aria-hidden="true" className="absolute -right-12 top-12 -z-10 h-[240px] w-[240px] rounded-full border border-[#f6e7d3]" />
        <div className="mx-auto max-w-[1120px]">
          <div className="mx-auto max-w-[610px] text-center">
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e4790a]"><ShoppingBasket className="h-4 w-4" /> What we provide</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.8rem]">Find your fresh start.</h2>
            <p className="mt-3 text-sm leading-7 text-[#898178]">Start with the essentials, then choose the little extras that fit your routine.</p>
          </div>
          <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">
            <PlanCard name="Free" price="₹0" period="forever" description="A lovely place to begin." features={["Basic fruit identification", "10 scans to get started", "Nutrition information", "Ripeness detection", "Recipe suggestions", "Shopping and market details"]} />
            <PlanCard name="Basic" price="₹70" period="/ month" description="For your everyday discoveries." features={["500 fruit scans each month", "Fruit identification", "Nutrition and ripeness insights", "Recipe suggestions", "Shopping and market details", "Ad-free experience"]} note="₹700 billed yearly" />
            <PlanCard name="Premium" price="₹149" period="/ month" description="A little more help, every day." features={["Unlimited fruit scans", "Everything in Basic", "Expiry date reminders", "Storage and ripeness tracker", "Shopping list helper", "Morning nutrition planner", "Pesticide and washing guide"]} note="₹1,499 billed yearly" featured />
          </div>
          <p className="mt-5 text-center text-[10px] text-[#a1988d]">Plan pricing shown in INR, as listed by FruitScan AI.</p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10" id="why-fruitscan">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e4790a]"><span className="text-base">✳</span> Why choose us</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-[2.8rem]">Know your fruit. Enjoy the moment.</h2>
            <p className="mt-4 max-w-[420px] text-sm leading-7 text-[#898178]">A helpful companion for the small choices that make fresh food feel even better.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [ScanLine, "Instant identification", "Get to know the fruit in front of you."],
              [ShoppingBasket, "Market price details", "Explore price information while planning."],
              [Apple, "Nutrition at a glance", "Find useful details about what you enjoy."],
              [Leaf, "Freshness guidance", "Get ideas for ripeness and storage."],
            ].map(([Icon, title, copy]) => {
              const FeatureIcon = Icon as typeof ScanLine;
              return <div key={title as string} className="flex gap-3 rounded-[22px] border border-[#efebe5] bg-white p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#fff2df] text-[#ee8105]"><FeatureIcon className="h-[18px] w-[18px]" /></span><span><span className="block text-[13px] font-extrabold">{title as string}</span><span className="mt-1 block text-[11px] leading-5 text-[#8c857d]">{copy as string}</span></span></div>;
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10" id="faq">
        <div className="mx-auto grid max-w-[1020px] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e4790a]"><CircleHelp className="h-4 w-4" /> Need a little help?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.055em] sm:text-[2.7rem]">Top questions, answered.</h2>
            <p className="mt-3 text-sm leading-7 text-[#898178]">A few quick notes to help you get started with FruitScan AI.</p>
            <a href="mailto:Fruitscanai@gmail.com" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#e87900]">Still curious? Get in touch <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          <div className="divide-y divide-[#eee9e1] border-y border-[#eee9e1]">
            {faqs.map(({ question, answer }, index) => {
              const expanded = openFaq === index;
              return (
                <div key={question} className="py-1">
                  <button type="button" aria-expanded={expanded} onClick={() => setOpenFaq(expanded ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-bold text-[#34312c] transition hover:text-[#e87900] sm:text-[15px]">
                    {question}<ChevronDown className={`h-4 w-4 shrink-0 text-[#f08a19] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden"><p className="max-w-[620px] pb-5 pr-8 text-[13px] leading-6 text-[#898178]">{answer}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:px-10">
        <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[30px] bg-[#fb8500] px-6 py-10 text-white sm:rounded-[38px] sm:px-10 sm:py-14 lg:px-14">
          <div aria-hidden="true" className="absolute -right-10 -top-20 text-[190px] opacity-20 sm:-right-2 sm:-top-28 sm:text-[260px]">🍊</div>
          <div className="relative max-w-[630px]">
            <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/75"><Sparkles className="h-3.5 w-3.5" /> A fresher perspective</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-[2.65rem]">Your next fruit discovery is one scan away.</h2>
            <p className="mt-3 max-w-[470px] text-sm leading-7 text-white/80">Take FruitScan AI with you and make every fruit a little more interesting.</p>
            <a href={playStoreUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-white px-5 py-3.5 text-xs font-extrabold text-[#d66e00] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#fff7ea]">Download now <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#f0ece7] px-5 pb-7 pt-9 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="inline-flex items-center gap-3 self-start">
            <CitrusMark className="h-9 w-9" />
            <span className="text-sm font-extrabold tracking-[-0.04em]">fruit<span className="text-[#fb8500]">scan</span><span className="font-medium">ai</span></span>
          </a>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-[#827c73] sm:justify-center">
            <a className="transition hover:text-[#e87900]" href="#top">Home</a>
            <a className="transition hover:text-[#e87900]" href="#features">Features</a>
            <a className="transition hover:text-[#e87900]" href="#plans">Plans</a>
            <a className="transition hover:text-[#e87900]" href="https://fruitscanai.odoo.com/privacy" target="_blank" rel="noreferrer">Privacy policy</a>
            <a className="transition hover:text-[#e87900]" href="mailto:Fruitscanai@gmail.com">Contact</a>
          </nav>
          <p className="text-[10px] text-[#a19a90]">© FruitScan AI</p>
        </div>
      </footer>
    </main>
  );
}

function CitrusMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" role="img" aria-label="FruitScan AI orange mark">
      <defs>
        <radialGradient id="citrus-fill" cx="30%" cy="24%" r="82%"><stop stopColor="#FFE18D" /><stop offset=".42" stopColor="#FFAA32" /><stop offset="1" stopColor="#F47C00" /></radialGradient>
        <filter id="citrus-shadow" x="0" y="0" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9B5A0E" floodOpacity=".22" /></filter>
      </defs>
      <circle cx="23.5" cy="24" r="18.5" fill="url(#citrus-fill)" filter="url(#citrus-shadow)" />
      <circle cx="23.5" cy="24" r="15.3" stroke="#FFF8E7" strokeWidth="1.5" />
      <circle cx="23.5" cy="24" r="2.1" fill="#FFF9E7" />
      <g stroke="#FFF9E7" strokeWidth="1.45" strokeLinecap="round" opacity=".98">
        <path d="M23.5 21.8 23.2 9.1" /><path d="m25.5 22.2 7.3-10.1" /><path d="m26 24 12.2-3.4" />
        <path d="m25.3 25.9 9.7 8.2" /><path d="m23.2 26.2-.8 12.2" /><path d="m21.2 25.6-7.9 9.2" />
        <path d="m21 23.5-12-2.1" /><path d="m21.8 21.9-5.5-11.1" />
      </g>
      <path d="M23 5.3c2.7-3 6.3-3.4 9.5-1.8-1.8 3.6-4.8 5.2-8.6 4.3" fill="#78A84F" stroke="#5B8C39" strokeWidth=".8" />
    </svg>
  );
}

function toneClass(tone: string) {
  const tones: Record<string, string> = {
    orange: "bg-[#fff0dc] text-[#eb8208]",
    peach: "bg-[#ffebe5] text-[#e77c62]",
    yellow: "bg-[#fff8d8] text-[#cf9b16]",
    green: "bg-[#edf5df] text-[#6b9846]",
    pink: "bg-[#ffebed] text-[#d96c7b]",
    lavender: "bg-[#f0edff] text-[#8372ce]",
  };
  return tones[tone] ?? tones.orange;
}

function PlanCard({
  name,
  price,
  period,
  description,
  features: items,
  note,
  featured = false,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  note?: string;
  featured?: boolean;
}) {
  return (
    <article className={`relative flex flex-col rounded-[27px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(105,72,32,0.1)] sm:rounded-[30px] sm:p-6 ${featured ? "border-[#fb8500] bg-white shadow-[0_14px_36px_rgba(206,115,15,0.13)]" : "border-[#eee7dd] bg-white/90"}`}>
      {featured && <span className="absolute right-5 top-5 rounded-full bg-[#fff0dc] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#db7300]">Most loved</span>}
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8e8375]">{name}</p>
      <p className="mt-3 text-[13px] text-[#8a8279]">{description}</p>
      <p className="mt-5 flex items-end gap-1.5"><span className="text-[2.45rem] font-extrabold leading-none tracking-[-0.07em] text-[#292621]">{price}</span><span className="pb-1 text-xs text-[#948a7e]">{period}</span></p>
      {note && <p className="mt-2 text-[10px] font-semibold text-[#a09689]">{note}</p>}
      <a href={playStoreUrl} target="_blank" rel="noreferrer" className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[13px] text-xs font-extrabold transition ${featured ? "bg-[#fb8500] text-white shadow-[0_8px_18px_rgba(251,133,0,0.2)] hover:bg-[#ed7800]" : "border border-[#eee5d9] bg-white text-[#403b35] hover:border-[#f1bd80] hover:bg-[#fffaf4]"}`}>Choose {name} <ArrowRight className="h-3.5 w-3.5" /></a>
      <div className="my-5 h-px bg-[#f0ece6]" />
      <ul className="space-y-3">
        {items.map((item) => <li key={item} className="flex gap-2.5 text-[11px] leading-5 text-[#6f685f]"><span className={`mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full ${featured ? "bg-[#fff0dc] text-[#e87900]" : "bg-[#f3f1ec] text-[#7b9d58]"}`}><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>{item}</li>)}
      </ul>
    </article>
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

export function ArticleCard({
  article,
}: {
  article: Pick<ApiArticle, "slug" | "title" | "category" | "emoji" | "gradient" | "description" | "coverUrl" | "coverAlt" | "publishedAt">;
}) {
  return (
    <Link
      to="/knowledge/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:gt-shadow"
    >
      <div className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${article.gradient} sm:h-40`}>
        {article.coverUrl ? (
          <img
            src={article.coverUrl}
            alt={article.coverAlt || article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-7xl transition-transform group-hover:scale-105">{article.emoji}</div>
        )}
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
