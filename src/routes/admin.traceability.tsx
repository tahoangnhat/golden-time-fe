import { createFileRoute } from "@tanstack/react-router";
import { Check, X, QrCode, Route as RouteIcon } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  SectionCard,
  StatusBadge,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/traceability")({
  component: AdminTraceability,
});

const TRACE = [
  { product: "Táo Fuji Nhật", shop: "Trái Cây Tươi HN", supplier: "Aomori Apple Co.", area: "Aomori, Nhật Bản", harvest: "02/06/2026", import: "10/06/2026", cert: "GlobalGAP, JAS", status: "Đã xác minh" },
  { product: "Xoài cát Hòa Lộc", shop: "Fruit Mart SG", supplier: "HTX Hòa Lộc", area: "Cái Bè, Tiền Giang", harvest: "15/06/2026", import: "16/06/2026", cert: "VietGAP", status: "Đã xác minh" },
  { product: "Bơ sáp Đắk Lắk", shop: "Hoa Quả Sạch CT", supplier: "Nông trại Đại Phú", area: "CưM'gar, Đắk Lắk", harvest: "12/06/2026", import: "14/06/2026", cert: "VietGAP, Organic", status: "Đã xác minh" },
  { product: "Dâu tây Đà Lạt", shop: "Vườn Quê ĐN", supplier: "Vườn Dâu Anh Đào", area: "Đà Lạt, Lâm Đồng", harvest: "18/06/2026", import: "19/06/2026", cert: "VietGAP", status: "Chưa xác minh" },
  { product: "Nho mẫu đơn", shop: "Trái Cây Tươi HN", supplier: "K-Farm Korea", area: "Gyeongsan, Hàn Quốc", harvest: "01/06/2026", import: "09/06/2026", cert: "Korea GAP", status: "Chưa xác minh" },
  { product: "Cam sành Hà Giang", shop: "Vựa Mộc Châu", supplier: "HTX Bắc Quang", area: "Bắc Quang, Hà Giang", harvest: "10/06/2026", import: "13/06/2026", cert: "VietGAP", status: "Đã xác minh" },
];

function AdminTraceability() {
  return (
    <AdminShell title="Truy xuất nguồn gốc" subtitle="Xác minh thông tin nguồn gốc sản phẩm">
      <SectionCard title={`Hồ sơ truy xuất (${TRACE.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">Sản phẩm</th>
              <th className="py-2 pr-3">Cửa hàng</th>
              <th className="py-2 pr-3">Nhà cung cấp</th>
              <th className="py-2 pr-3">Khu vực</th>
              <th className="py-2 pr-3">Ngày thu hoạch</th>
              <th className="py-2 pr-3">Ngày nhập</th>
              <th className="py-2 pr-3">Chứng nhận</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {TRACE.map((t, i) => (
            <tr key={i} className="hover:bg-muted/30">
              <td className="py-3 pr-3 font-semibold">{t.product}</td>
              <td className="py-3 pr-3 text-muted-foreground">{t.shop}</td>
              <td className="py-3 pr-3">{t.supplier}</td>
              <td className="py-3 pr-3 text-sm">{t.area}</td>
              <td className="py-3 pr-3 text-xs">{t.harvest}</td>
              <td className="py-3 pr-3 text-xs">{t.import}</td>
              <td className="py-3 pr-3">
                {t.cert.split(", ").map((c) => (
                  <span key={c} className="inline-flex mr-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">{c}</span>
                ))}
              </td>
              <td className="py-3 pr-3"><StatusBadge status={t.status} /></td>
              <td className="py-3 pr-3">
                <div className="flex items-center justify-end gap-1">
                  {t.status === "Chưa xác minh" && (
                    <>
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-green-50 text-green-600" title="Xác minh"><Check className="h-4 w-4" /></button>
                      <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600" title="Từ chối"><X className="h-4 w-4" /></button>
                    </>
                  )}
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem QR"><QrCode className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Hành trình sản phẩm"><RouteIcon className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>
    </AdminShell>
  );
}