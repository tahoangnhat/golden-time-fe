import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pause, Edit3, Trash2, Tag } from "lucide-react";
import { PartnerShell } from "@/components/PartnerShell";

export const Route = createFileRoute("/shop/promotions")({
  head: () => ({ meta: [{ title: "Khuyến mãi — Golden Time Partner" }] }),
  component: Promotions,
});

const PROMOS = [
  { name: "Giảm 10% cho Táo Fuji", scope: "Táo Fuji", discount: "-10%", start: "18/06", end: "30/06", status: "Đang chạy", used: 86 },
  { name: "Combo Healthy Mix", scope: "Táo + Cam + Chuối", discount: "-15%", start: "15/06", end: "25/06", status: "Đang chạy", used: 42 },
  { name: "Miễn phí giao hàng từ 150.000đ", scope: "Toàn cửa hàng", discount: "FreeShip", start: "20/06", end: "27/06", status: "Đang chạy", used: 124 },
  { name: "Flash Sale Cuối Tuần", scope: "Nho mẫu đơn", discount: "-20%", start: "22/06", end: "23/06", status: "Lên lịch", used: 0 },
];

function Promotions() {
  return (
    <PartnerShell title="Khuyến mãi của cửa hàng" subtitle="Tạo & quản lý chương trình giảm giá">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="bg-white rounded-2xl p-5 border border-border gt-shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-600 grid place-items-center">
              <Tag className="h-4 w-4" />
            </div>
            <h3 className="font-bold">Tạo khuyến mãi mới</h3>
          </div>
          <Field label="Tên chương trình" placeholder="VD: Giảm 10% cho Táo Fuji" />
          <Field label="Sản phẩm áp dụng" placeholder="Chọn sản phẩm..." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mức giảm" placeholder="10%" />
            <Field label="Đơn tối thiểu" placeholder="100.000đ" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bắt đầu" placeholder="20/06/2026" type="date" />
            <Field label="Kết thúc" placeholder="30/06/2026" type="date" />
          </div>
          <Field label="Điều kiện áp dụng" placeholder="VD: chỉ áp dụng cho khách mới" textarea />
          <button className="w-full h-11 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" /> Tạo khuyến mãi
          </button>
        </div>

        {/* Promo cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
          {PROMOS.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl border border-border gt-shadow-soft overflow-hidden">
              <div className="gt-gradient text-white p-4">
                <p className="text-xs uppercase tracking-wider opacity-80">{p.scope}</p>
                <p className="text-lg font-extrabold leading-tight mt-1">{p.name}</p>
                <p className="text-3xl font-extrabold mt-2">{p.discount}</p>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <Row label="Thời gian" value={`${p.start} – ${p.end}`} />
                <Row label="Đã dùng" value={`${p.used} lượt`} />
                <Row
                  label="Trạng thái"
                  value={
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      p.status === "Đang chạy" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>{p.status}</span>
                  }
                />
                <div className="flex gap-1.5 pt-2">
                  <button className="flex-1 h-8 rounded-lg bg-[oklch(0.95_0.06_145)] text-[oklch(0.45_0.17_145)] font-semibold inline-flex items-center justify-center gap-1">
                    <Edit3 className="h-3 w-3" /> Sửa
                  </button>
                  <button className="flex-1 h-8 rounded-lg bg-yellow-50 text-yellow-700 font-semibold inline-flex items-center justify-center gap-1">
                    <Pause className="h-3 w-3" /> Tạm dừng
                  </button>
                  <button className="h-8 w-8 rounded-lg bg-red-50 text-red-600 grid place-items-center">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PartnerShell>
  );
}

function Field({
  label, placeholder, type = "text", textarea,
}: { label: string; placeholder?: string; type?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      {textarea ? (
        <textarea rows={2} placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-white text-sm" />
      ) : (
        <input type={type} placeholder={placeholder}
          className="mt-1 w-full h-11 px-3 rounded-xl border border-border bg-white text-sm" />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}