import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminShell, AdminTable, FilterBar, SectionCard, StatusBadge } from "@/components/AdminShell";
import { api, type AdminUser } from "@/lib/api";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  USER: "Người dùng",
  SHOP_OWNER: "Doanh nghiệp",
  ADMIN: "Quản trị viên",
};

const ROLE_STYLES: Record<AdminUser["role"], string> = {
  USER: "bg-blue-50 text-blue-700",
  SHOP_OWNER: "bg-emerald-50 text-emerald-700",
  ADMIN: "bg-amber-50 text-amber-700",
};

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | AdminUser["role"]>("Tất cả");
  const [minOrders, setMinOrders] = useState("");
  const [minScans, setMinScans] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminUsers()
      .then(setUsers)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được người dùng."));
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const orderThreshold = minOrders === "" ? null : Number(minOrders);
    const scanThreshold = minScans === "" ? null : Number(minScans);

    return users.filter((user) => {
      const status = user.enabled ? "Hoạt động" : "Đã khóa";
      const matchesQuery = `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(normalizedQuery);
      const matchesOrders = orderThreshold === null || user.orders >= orderThreshold;
      const matchesScans = scanThreshold === null || user.scans >= scanThreshold;

      return (statusFilter === "Tất cả" || status === statusFilter)
        && (roleFilter === "Tất cả" || user.role === roleFilter)
        && matchesQuery
        && matchesOrders
        && matchesScans;
    });
  }, [users, query, statusFilter, roleFilter, minOrders, minScans]);

  return (
    <AdminShell title="Quản lý người dùng" subtitle={`Tổng cộng ${users.length} người dùng`}>
      <FilterBar>
        <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg bg-[oklch(0.97_0.04_95)] px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, email, ID..."
            aria-label="Tìm người dùng theo tên, email hoặc ID"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
          aria-label="Lọc theo vai trò"
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
        >
          <option value="Tất cả">Tất cả vai trò</option>
          <option value="USER">Người dùng</option>
          <option value="SHOP_OWNER">Doanh nghiệp</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm">
          <span className="whitespace-nowrap text-muted-foreground">Đơn từ</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={minOrders}
            onChange={(event) => setMinOrders(event.target.value)}
            aria-label="Lọc theo số đơn tối thiểu"
            placeholder="Tối thiểu"
            className="w-20 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </label>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm">
          <span className="whitespace-nowrap text-muted-foreground">Quét AI từ</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={minScans}
            onChange={(event) => setMinScans(event.target.value)}
            aria-label="Lọc theo số lượt quét AI tối thiểu"
            placeholder="Tối thiểu"
            className="w-20 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </label>
        {["Tất cả", "Hoạt động", "Đã khóa"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`h-9 rounded-lg px-3 text-sm font-semibold ${statusFilter === status ? "gt-gradient text-white" : "bg-muted text-foreground/70 hover:bg-muted/70"}`}
          >
            {status}
          </button>
        ))}
      </FilterBar>

      {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <SectionCard title={`Danh sách người dùng (${filtered.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Tên người dùng</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Vai trò</th>
              <th className="py-2 pr-3 text-right">Đơn</th>
              <th className="py-2 pr-3 text-right">Quét AI</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3">Ngày tham gia</th>
            </>
          }
        >
          {filtered.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30">
              <td className="py-3 pr-3 font-mono text-xs">{user.id}</td>
              <td className="py-3 pr-3 font-semibold">{user.name}</td>
              <td className="py-3 pr-3 text-muted-foreground">{user.email}</td>
              <td className="py-3 pr-3">
                <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </td>
              <td className="py-3 pr-3 text-right tabular-nums">{user.orders}</td>
              <td className="py-3 pr-3 text-right tabular-nums">{user.scans}</td>
              <td className="py-3 pr-3"><StatusBadge status={user.enabled ? "Hoạt động" : "Đã khóa"} /></td>
              <td className="py-3 pr-3 text-xs text-muted-foreground">{new Date(user.joined).toLocaleDateString("vi-VN")}</td>
            </tr>
          ))}
          {!error && filtered.length === 0 && (
            <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Chưa có người dùng phù hợp.</td></tr>
          )}
        </AdminTable>
      </SectionCard>
    </AdminShell>
  );
}
