import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, BadgeCheck, Sprout, Truck, Store, User, ShieldCheck } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";

export const Route = createFileRoute("/trace")({
  head: () => ({ meta: [{ title: "Truy xuất nguồn gốc — Golden Time" }] }),
  component: Trace,
});

const timeline = [
  { icon: Sprout, title: "Thu hoạch", date: "15/06/2026 • Mộc Châu", done: true },
  { icon: ShieldCheck, title: "Kiểm định chất lượng", date: "16/06/2026 • Trung tâm KĐ Hà Nội", done: true },
  { icon: Truck, title: "Vận chuyển", date: "17/06/2026 • Xe lạnh 4°C", done: true },
  { icon: Store, title: "Cửa hàng", date: "18/06/2026 • Bách Hóa Xanh Q.1", done: true },
  { icon: User, title: "Đến tay người dùng", date: "Hôm nay", done: false },
];

// deterministic pseudo-random for QR
function qrCells() {
  const out: boolean[] = [];
  let s = 7;
  for (let i = 0; i < 64; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(s / 233280 > 0.45);
  }
  return out;
}
const cells = qrCells();

function Trace() {
  return (
    <PhoneShell hideNav>
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Link to="/result" className="h-9 w-9 grid place-items-center rounded-full bg-white border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-sm">Truy xuất nguồn gốc</span>
        <span className="w-9" />
      </div>

      <div className="px-5">
        <div className="bg-white rounded-3xl p-5 gt-shadow-soft border border-border flex items-center gap-4">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cream to-warm grid place-items-center border border-border p-2">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {cells.map((on, i) => (
                <rect key={i} x={(i % 8) * 12 + 2} y={Math.floor(i / 8) * 12 + 2} width="10" height="10" fill={on ? "#1a1a1a" : "transparent"} rx="1" />
              ))}
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold">Táo Fuji Mộc Châu</h2>
            <p className="text-[11px] text-muted-foreground">Mã lô: TF-MC-2026-0618</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md">
              <BadgeCheck className="h-3 w-3" /> Đã xác thực
            </span>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-4 gt-shadow-soft border border-border space-y-2 text-sm">
          {[
            ["Nông trại", "HTX Trái Cây Mộc Châu"],
            ["Khu vực", "Mộc Châu, Sơn La"],
            ["Ngày thu hoạch", "15/06/2026"],
            ["Ngày nhập hàng", "18/06/2026"],
            ["Chứng nhận", "VietGAP • GlobalG.A.P"],
            ["Bảo quản", "4–6°C • Độ ẩm 90%"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-border last:border-0 pb-2 last:pb-0">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-semibold text-right">{v}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-5 font-bold">Hành trình sản phẩm</h3>
        <div className="mt-3 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />
          <div className="space-y-4">
            {timeline.map(({ icon: Icon, title, date, done }) => (
              <div key={title} className="flex gap-3 relative">
                <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${done ? "gt-gradient text-white gt-shadow" : "bg-white border-2 border-dashed border-border text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-border">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}