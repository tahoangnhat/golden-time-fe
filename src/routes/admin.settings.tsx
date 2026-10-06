import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, SectionCard } from "@/components/AdminShell";
import { api, type AdminPriceSource } from "@/lib/api";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const [sources, setSources] = useState<AdminPriceSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  async function loadSources() {
    setLoading(true);
    try { setSources(await api.adminPriceSources()); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được nguồn giá."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadSources(); }, []);

  async function refreshSources() {
    setRefreshing(true); setError(""); setRefreshMessage("");
    try {
      const result = await api.refreshPrices();
      setRefreshMessage(`Đã xử lý ${result.sources} nguồn: cập nhật ${result.updated}, lỗi ${result.failed}.`);
      await loadSources();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không làm mới được dữ liệu giá.");
    } finally { setRefreshing(false); }
  }

  return <AdminShell title="Cài đặt hệ thống" subtitle="Trạng thái các nguồn dữ liệu và dịch vụ MVP">
    <div className="grid lg:grid-cols-2 gap-4">
      <SectionCard title="Nguồn giá">
        <p className="text-sm text-muted-foreground">Giá chỉ được hiển thị sau khi lấy thành công từ trang bán lẻ. Mỗi báo giá lưu kèm đường dẫn và thời điểm lấy.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {refreshMessage && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{refreshMessage}</p>}
        <button type="button" disabled={refreshing} onClick={() => void refreshSources()} className="mt-4 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {refreshing ? "Đang cập nhật…" : "Cập nhật giá từ nguồn thật"}
        </button>
        <div className="mt-5 space-y-3">
          {sources.map((source) => <article key={source.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-sm">{source.retailer} · {source.fruit}</h3><p className="mt-1 text-xs text-muted-foreground">{source.productName}</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${source.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{source.enabled ? "Đang bật" : "Đã tắt"}</span></div>
            <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-primary underline">Trang nguồn</a>
            <p className="mt-2 text-xs text-muted-foreground">Crawl thành công gần nhất: {source.lastSuccessAt ? new Date(source.lastSuccessAt).toLocaleString("vi-VN") : "Chưa có"}</p>
            {source.lastError && <p className="mt-1 text-xs text-red-700">Lỗi gần nhất: {source.lastError}</p>}
          </article>)}
          {!loading && sources.length === 0 && <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Chưa cấu hình nguồn giá.</p>}
          {loading && <p className="text-sm text-muted-foreground">Đang tải trạng thái nguồn…</p>}
        </div>
      </SectionCard>
      <div className="space-y-4">
        <SectionCard title="Dịch vụ AI"><p className="text-sm text-muted-foreground">Phân tích ảnh chỉ hoạt động khi cấu hình AI_SERVICE_URL. Kết quả không được tự tạo khi dịch vụ chưa có.</p></SectionCard>
        <SectionCard title="Thanh toán"><p className="text-sm text-muted-foreground">MVP hiện chỉ ghi nhận đơn COD; cổng thanh toán chưa được tích hợp.</p></SectionCard>
        <SectionCard title="Thiết lập nền tảng"><p className="text-sm text-muted-foreground">Phí, chính sách đối tác, nội dung thông báo và quản lý tài khoản quản trị chưa có API lưu cấu hình.</p></SectionCard>
      </div>
    </div>
  </AdminShell>;
}
