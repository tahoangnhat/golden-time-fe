import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SectionCard } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <AdminShell title="Cài đặt hệ thống" subtitle="Thiết lập nền tảng Golden Time">
      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Phí nền tảng & Hoa hồng">
          <div className="space-y-4">
            <Row label="Phí nền tảng cố định">
              <input defaultValue="5,000" className="h-10 w-32 px-3 rounded-xl border border-border text-right" /> <span className="text-sm text-muted-foreground ml-2">₫/đơn</span>
            </Row>
            <Row label="Hoa hồng (%)">
              <input defaultValue="8" className="h-10 w-32 px-3 rounded-xl border border-border text-right" /> <span className="text-sm text-muted-foreground ml-2">%</span>
            </Row>
            <Row label="Hoa hồng cửa hàng Vàng">
              <input defaultValue="6" className="h-10 w-32 px-3 rounded-xl border border-border text-right" /> <span className="text-sm text-muted-foreground ml-2">%</span>
            </Row>
            <Row label="Phí giao hàng tối thiểu">
              <input defaultValue="15,000" className="h-10 w-32 px-3 rounded-xl border border-border text-right" /> <span className="text-sm text-muted-foreground ml-2">₫</span>
            </Row>
          </div>
        </SectionCard>

        <SectionCard title="Nội dung AI Disclaimer">
          <label className="block">
            <span className="text-xs font-semibold">Văn bản hiển thị dưới mọi kết quả AI</span>
            <textarea
              rows={5}
              defaultValue="Kết quả AI chỉ mang tính hỗ trợ tham khảo. Quyết định mua hàng cuối cùng thuộc về người dùng. Golden Time không chịu trách nhiệm về thiệt hại phát sinh từ việc dựa hoàn toàn vào kết quả phân tích AI."
              className="mt-1 w-full p-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)] text-sm"
            />
          </label>
        </SectionCard>

        <SectionCard title="Phương thức thanh toán">
          <div className="space-y-2">
            {[
              { n: "MoMo", on: true }, { n: "VNPay", on: true }, { n: "ZaloPay", on: true },
              { n: "Apple Pay", on: false }, { n: "Thẻ ngân hàng (Napas)", on: true }, { n: "COD", on: true },
            ].map((p) => (
              <label key={p.n} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <span className="font-semibold text-sm">{p.n}</span>
                <input type="checkbox" defaultChecked={p.on} className="h-5 w-9 appearance-none rounded-full bg-muted checked:bg-[oklch(0.62_0.17_145)] relative cursor-pointer transition before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white checked:before:translate-x-4 before:transition" />
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cài đặt thông báo">
          <div className="space-y-2">
            {[
              "Email cảnh báo khi có đơn bị hủy",
              "Push thông báo khi shop mới đăng ký",
              "Email báo cáo doanh thu hàng ngày",
              "Cảnh báo khi tỷ lệ AI sai vượt 1%",
              "Thông báo Slack cho team kỹ thuật",
            ].map((n, i) => (
              <label key={n} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <span className="text-sm">{n}</span>
                <input type="checkbox" defaultChecked={i % 2 === 0} className="h-5 w-9 appearance-none rounded-full bg-muted checked:bg-[oklch(0.62_0.17_145)] relative cursor-pointer transition before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white checked:before:translate-x-4 before:transition" />
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tài khoản Admin" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tên Admin" defaultValue="Nguyễn Quản Trị" />
            <Field label="Email" defaultValue="admin@goldentime.vn" />
            <Field label="SĐT" defaultValue="0901 234 567" />
            <Field label="Vai trò" defaultValue="Super Admin" disabled />
            <Field label="Mật khẩu mới" type="password" placeholder="••••••••" />
            <Field label="Xác nhận mật khẩu" type="password" placeholder="••••••••" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="h-10 px-4 rounded-xl border border-border font-semibold text-sm">Hủy</button>
            <button className="h-10 px-4 rounded-xl gt-gradient text-white font-semibold text-sm">Lưu thay đổi</button>
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full h-10 px-3 rounded-xl border border-border outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_145)] disabled:bg-muted/50"
      />
    </label>
  );
}