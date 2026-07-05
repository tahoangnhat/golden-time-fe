import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Camera, MapPin, Phone, Clock, Truck } from "lucide-react";
import { PartnerShell } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/profile")({
  head: () => ({ meta: [{ title: "Hồ sơ cửa hàng — Golden Time Partner" }] }),
  component: Profile,
});

function Profile() {
  return (
    <PartnerShell title="Hồ sơ cửa hàng" subtitle="Cập nhật thông tin hiển thị trên Golden Time">
      <div className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-hidden">
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-br from-[oklch(0.62_0.17_145)] to-orange-400">
          <button className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/95 text-xs font-semibold flex items-center gap-1">
            <Camera className="h-3 w-3" /> Đổi ảnh bìa
          </button>
          <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-2xl bg-white border-4 border-white gt-shadow grid place-items-center text-4xl">
            🍊
          </div>
        </div>
        <div className="pt-14 px-6 pb-6 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold">Trái Cây Tươi</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Đã xác minh
              </span>
              <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Đối tác Vàng
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Tham gia Golden Time từ 03/2025</p>
          </div>
          <button className="px-4 py-2 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow">
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Section title="Thông tin cơ bản" className="lg:col-span-2 space-y-3">
          <Field label="Tên cửa hàng" value="Trái Cây Tươi" />
          <Field label="Mô tả" value="Cửa hàng chuyên trái cây sạch nhập khẩu và nội địa, cam kết chất lượng AI Quality 85+." textarea />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Số điện thoại" value="0909 123 456" icon={Phone} />
            <Field label="Email" value="traicaytuoi@gmail.com" />
          </div>
          <Field label="Địa chỉ" value="123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM" icon={MapPin} />
        </Section>

        <Section title="Giờ hoạt động & giao hàng" className="space-y-3">
          <Field label="Giờ mở cửa" value="07:00 – 22:00 (T2 – CN)" icon={Clock} />
          <Field label="Bán kính giao hàng" value="5 km" icon={Truck} />
          <Field label="Phí giao hàng" value="15.000đ (Miễn phí từ 150.000đ)" />
          <div>
            <p className="text-xs font-semibold">Phương thức thanh toán</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Momo", "ZaloPay", "VNPay", "Thẻ Visa", "COD"].map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] text-xs font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </PartnerShell>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-border gt-shadow-soft ${className}`}>
      <h3 className="font-bold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label, value, textarea, icon: Icon,
}: { label: string; value: string; textarea?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      <div className="relative mt-1">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
        {textarea ? (
          <textarea
            rows={3}
            defaultValue={value}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm"
          />
        ) : (
          <input
            defaultValue={value}
            className={`w-full h-11 ${Icon ? "pl-9" : "pl-3"} pr-3 rounded-xl border border-border bg-white text-sm`}
          />
        )}
      </div>
    </div>
  );
}