import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminShell, AdminTable, FilterBar, SectionCard, StatusBadge } from "@/components/AdminShell";
import { LocationPicker } from "@/components/LocationPicker";
import { api, type AdminShop, type BusinessApplication } from "@/lib/api";
import type { Coordinates } from "@/lib/geo";

export const Route = createFileRoute("/admin/shops")({ component: AdminShops });

function AdminShops() {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [applicationNotice, setApplicationNotice] = useState("");
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [applicationLocations, setApplicationLocations] = useState<Record<number, Coordinates | null>>({});
  const [locationPickerApplicationId, setLocationPickerApplicationId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  useEffect(() => {
    api.adminShops().then(setShops).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được cửa hàng."));
    api.adminBusinessApplications().then(setApplications).catch((cause) => setApplicationError(cause instanceof Error ? cause.message : "Không tải được hồ sơ doanh nghiệp."));
  }, []);
  const filtered = useMemo(() => shops.filter((shop) => `${shop.name} ${shop.owner ?? ""} ${shop.address ?? ""}`.toLowerCase().includes(query.toLowerCase())), [shops, query]);
  const pendingApplications = applications.filter((application) => application.status === "PENDING");

  async function openLicense(application: BusinessApplication) {
    setApplicationError("");
    try {
      const file = await api.adminBusinessLicense(application.id);
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = application.licenseOriginalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setApplicationError(cause instanceof Error ? cause.message : "Không mở được giấy phép kinh doanh.");
    }
  }

  async function decide(application: BusinessApplication, approved: boolean) {
    const reason = reasons[application.id]?.trim() ?? "";
    if (!approved && !reason) {
      setApplicationError("Lý do từ chối là bắt buộc.");
      return;
    }
    const location = applicationLocations[application.id] ?? null;
    if (approved && !location) {
      setApplicationError("Hãy chọn vị trí cửa hàng trên bản đồ trước khi chấp nhận hồ sơ.");
      setLocationPickerApplicationId(application.id);
      return;
    }
    setApplicationError("");
    setApplicationNotice("");
    setBusyId(application.id);
    try {
      const updated = await api.decideBusinessApplication(application.id, approved, reason || undefined, location && {
        latitude: location.lat,
        longitude: location.lng,
      });
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (updated.notificationSent === false) {
        setApplicationNotice("Quyết định đã được lưu nhưng email chưa gửi được. Sau khi cấu hình Gmail API, hãy bấm Gửi lại email.");
      } else {
        setApplicationNotice("Quyết định đã được lưu và email thông báo đã gửi.");
      }
      if (approved) {
        setApplicationLocations((current) => ({ ...current, [application.id]: null }));
        setLocationPickerApplicationId(null);
        setShops(await api.adminShops());
      }
    } catch (cause) {
      setApplicationError(cause instanceof Error ? cause.message : "Không xử lý được hồ sơ doanh nghiệp.");
    } finally {
      setBusyId(null);
    }
  }

  async function resendNotification(application: BusinessApplication) {
    setApplicationError("");
    setApplicationNotice("");
    setBusyId(application.id);
    try {
      const updated = await api.resendBusinessApplicationNotification(application.id);
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setApplicationNotice(updated.notificationSent
        ? "Email thông báo đã được gửi lại."
        : "Chưa gửi được email. Kiểm tra cấu hình Gmail API và nhật ký backend trên Render.");
    } catch (cause) {
      setApplicationError(cause instanceof Error ? cause.message : "Không gửi lại được email thông báo.");
    } finally {
      setBusyId(null);
    }
  }

  return <AdminShell title="Quản lý cửa hàng đối tác" subtitle={`${shops.length} cửa hàng trong hệ thống`}>
    <SectionCard title={`Hồ sơ đăng ký doanh nghiệp (${pendingApplications.length} chờ duyệt)`}>
      {applicationError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{applicationError}</p>}
      {applicationNotice && <p role="status" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{applicationNotice}</p>}
      <p className="mb-3 text-xs text-muted-foreground">Khi chấp nhận hồ sơ, hãy ghim vị trí chính xác của cửa hàng trên OpenStreetMap. Tọa độ được lưu để sắp xếp cửa hàng gần người dùng.</p>
      <div className="space-y-4">
        {applications.map((application) => <article key={application.id} className="rounded-2xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">{application.businessName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">Mã số đăng ký: {application.registrationNumber} · Gửi {new Date(application.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={application.status === "PENDING" ? "Chờ duyệt" : application.status === "APPROVED" ? "Đã duyệt" : "Từ chối"} />
              {application.status !== "PENDING" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${application.notificationSent ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
                {application.notificationSent ? "Đã gửi email" : "Email chưa gửi"}
              </span>}
            </div>
          </div>
          <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Người liên hệ:</span> {application.contactName}</p>
            <p><span className="text-muted-foreground">Email:</span> {application.email}</p>
            <p><span className="text-muted-foreground">Điện thoại:</span> {application.phone}</p>
            <p className="sm:col-span-2"><span className="text-muted-foreground">Địa chỉ:</span> {application.address}</p>
          </div>
          <button onClick={() => void openLicense(application)} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-cream">Tải giấy phép: {application.licenseOriginalName}</button>
          {application.status !== "PENDING" && application.notificationSent !== true && <button disabled={busyId === application.id} onClick={() => void resendNotification(application)} className="ml-2 mt-3 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-cream disabled:opacity-50">{busyId === application.id ? "Đang gửi…" : "Gửi lại email"}</button>}
          {application.status === "PENDING" ? <>
            <div className="mt-4 rounded-xl bg-cream/70 p-3">
              <p className="text-xs font-semibold">Vị trí cửa hàng bắt buộc khi chấp nhận</p>
              <button type="button" onClick={() => setLocationPickerApplicationId((current) => current === application.id ? null : application.id)} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-cream">
                <MapPin className="h-4 w-4" />{locationPickerApplicationId === application.id ? "Đóng chọn vị trí" : applicationLocations[application.id] ? "Sửa vị trí đã ghim" : "Chọn vị trí trên bản đồ"}
              </button>
              {locationPickerApplicationId === application.id && <LocationPicker
                address={application.address}
                value={applicationLocations[application.id] ?? null}
                onChange={(value) => setApplicationLocations((current) => ({ ...current, [application.id]: value }))}
              />}
            </div>
            <label className="mt-4 block"><span className="text-xs font-semibold">Lý do từ chối (bắt buộc khi từ chối)</span><textarea value={reasons[application.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [application.id]: event.target.value }))} rows={2} maxLength={1000} className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" /></label>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button disabled={busyId === application.id} onClick={() => void decide(application, false)} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Từ chối</button>
              <button disabled={busyId === application.id} onClick={() => void decide(application, true)} className="rounded-xl gt-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busyId === application.id ? "Đang xử lý…" : "Chấp nhận"}</button>
            </div>
          </> : application.status === "REJECTED" && application.rejectionReason && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">Lý do từ chối: {application.rejectionReason}</p>}
        </article>)}
        {applications.length === 0 && !applicationError && <p className="py-6 text-center text-sm text-muted-foreground">Chưa có hồ sơ đăng ký doanh nghiệp.</p>}
      </div>
    </SectionCard>

    <FilterBar><div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]"><Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm cửa hàng, chủ shop..." className="flex-1 bg-transparent outline-none text-sm" /></div></FilterBar>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <SectionCard title={`Cửa hàng (${filtered.length})`}>
      <AdminTable head={<><th className="py-2 pr-3">Cửa hàng</th><th className="py-2 pr-3">Chủ cửa hàng</th><th className="py-2 pr-3">Địa chỉ</th><th className="py-2 pr-3 text-right">Sản phẩm</th><th className="py-2 pr-3 text-right">Rating</th><th className="py-2 pr-3">Trạng thái</th><th className="py-2 pr-3 text-right">Giá trị đơn</th></>}>
        {filtered.map((shop) => <tr key={shop.id} className="hover:bg-muted/30"><td className="py-3 pr-3 font-semibold">{shop.name}</td><td className="py-3 pr-3">{shop.owner || "Chưa gán chủ cửa hàng"}</td><td className="py-3 pr-3 text-muted-foreground">{shop.address || "—"}</td><td className="py-3 pr-3 text-right">{shop.products}</td><td className="py-3 pr-3 text-right"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{Number(shop.rating).toFixed(1)} ({shop.reviewCount})</span></td><td className="py-3 pr-3"><StatusBadge status={shop.status} /></td><td className="py-3 pr-3 text-right font-bold">{shop.orderValue.toLocaleString("vi-VN")}₫</td></tr>)}
        {!error && filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Chưa có cửa hàng trong cơ sở dữ liệu.</td></tr>}
      </AdminTable>
    </SectionCard>
  </AdminShell>;
}
