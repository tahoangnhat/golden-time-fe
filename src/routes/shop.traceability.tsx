import { createFileRoute } from "@tanstack/react-router";
import { QrCode, Sprout, ShieldCheck, Truck, Store, User } from "lucide-react";
import { PartnerShell } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/traceability")({
  head: () => ({ meta: [{ title: "Truy xuất nguồn gốc — Golden Time Partner" }] }),
  component: Traceability,
});

const STEPS = [
  { icon: Sprout, label: "Thu hoạch", date: "15/06/2026", desc: "Nông trại Mộc Châu" },
  { icon: ShieldCheck, label: "Kiểm định", date: "16/06/2026", desc: "Đạt chuẩn VietGAP" },
  { icon: Truck, label: "Vận chuyển", date: "17/06/2026", desc: "Xe lạnh 5°C" },
  { icon: Store, label: "Nhập cửa hàng", date: "18/06/2026", desc: "Trái Cây Tươi, Quận 1" },
  { icon: User, label: "Đến tay người dùng", date: "—", desc: "Sẵn sàng giao" },
];

function Traceability() {
  return (
    <PartnerShell title="Truy xuất nguồn gốc" subtitle="Tạo hồ sơ nguồn gốc cho từng lô hàng để khách yên tâm">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border gt-shadow-soft space-y-4">
          <h3 className="font-bold">Thông tin nguồn gốc lô hàng</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Tên nông trại / nhà cung cấp" value="HTX Trái Cây Mộc Châu" />
            <Field label="Khu vực" value="Sơn La, Việt Nam" />
            <Field label="Ngày thu hoạch" value="15/06/2026" type="date" />
            <Field label="Ngày nhập hàng" value="18/06/2026" type="date" />
            <Field label="Chứng nhận" value="VietGAP, GlobalG.A.P." />
            <Field label="Điều kiện bảo quản" value="5-8°C, độ ẩm 85%" />
          </div>
          <Field
            label="Mã QR sản phẩm"
            value="GT-MCS-20260618-TF032"
            hint="Mã sẽ in lên bao bì sản phẩm để khách quét"
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="px-4 py-2.5 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow">
              Tạo thông tin truy xuất
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm">
              Gửi Admin xác minh
            </button>
            <button className="px-4 py-2.5 rounded-xl border border-border font-semibold text-sm">
              Lưu nháp
            </button>
          </div>
        </div>

        {/* QR preview */}
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
          <h3 className="font-bold">Mã QR truy xuất</h3>
          <div className="mt-4 aspect-square rounded-2xl bg-[oklch(0.97_0.04_95)] grid place-items-center">
            <QrCode className="h-32 w-32 text-foreground" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mã: <span className="font-bold text-foreground">GT-MCS-20260618-TF032</span>
          </p>
          <button className="mt-3 w-full h-10 rounded-xl border border-border font-semibold text-sm">
            Tải mã QR
          </button>
        </div>
      </div>

      {/* Timeline preview */}
      <div className="mt-6 bg-white rounded-2xl p-5 border border-border gt-shadow-soft">
        <h3 className="font-bold">Hành trình sản phẩm</h3>
        <p className="text-xs text-muted-foreground">Khách sẽ thấy timeline này khi quét mã QR.</p>
        <ol className="mt-6 relative grid md:grid-cols-5 gap-6">
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[oklch(0.62_0.17_145)] to-orange-400" />
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="relative text-center">
                <div className="mx-auto h-10 w-10 rounded-full gt-gradient grid place-items-center text-white gt-shadow z-10 relative">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-2 font-semibold text-sm">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.date}</p>
                <p className="text-xs">{s.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </PartnerShell>
  );
}

function Field({ label, value, type = "text", hint }: { label: string; value: string; type?: string; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)]/30"
      />
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}