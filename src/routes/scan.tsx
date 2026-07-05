import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ImageUp, Zap, Lightbulb } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Quét AI — Golden Time" }] }),
  component: Scan,
});

function Scan() {
  return (
    <PhoneShell bg="bg-[oklch(0.18_0.03_150)]">
      <div className="text-white">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 backdrop-blur">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold">Quét trái cây</span>
          <button className="h-9 w-9 grid place-items-center rounded-full bg-white/10 backdrop-blur">
            <Lightbulb className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 mt-2 aspect-[3/4] rounded-[2rem] overflow-hidden relative bg-gradient-to-br from-[oklch(0.3_0.08_140)] to-[oklch(0.18_0.05_150)]">
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[10rem] drop-shadow-2xl">🍎</span>
          </div>
          <div className="absolute inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 h-10 w-10 border-t-4 border-l-4 border-[oklch(0.85_0.18_120)] rounded-tl-2xl" />
            <div className="absolute top-0 right-0 h-10 w-10 border-t-4 border-r-4 border-[oklch(0.85_0.18_120)] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-[oklch(0.85_0.18_120)] rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-[oklch(0.85_0.18_120)] rounded-br-2xl" />
          </div>
          <div className="absolute bottom-5 inset-x-5 bg-black/40 backdrop-blur rounded-2xl px-4 py-3 text-center">
            <p className="text-sm font-medium">Chụp trái cây để AI phân tích độ tươi, độ chín và chất lượng</p>
          </div>
        </div>

        <div className="px-5 mt-6 space-y-3">
          <Link to="/result" className="block w-full text-center py-4 rounded-2xl gt-gradient font-semibold gt-shadow">
            <span className="inline-flex items-center gap-2"><Zap className="h-5 w-5 fill-white" /> Phân tích ngay</span>
          </Link>
          <button className="w-full py-4 rounded-2xl bg-white/10 backdrop-blur font-semibold border border-white/15">
            <span className="inline-flex items-center gap-2"><ImageUp className="h-5 w-5" /> Tải ảnh lên</span>
          </button>
          <p className="text-[11px] text-white/60 text-center pt-1">Kết quả chỉ mang tính tham khảo trong bản demo</p>
        </div>
      </div>
    </PhoneShell>
  );
}