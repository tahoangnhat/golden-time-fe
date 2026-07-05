import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Eye, Lock, Unlock, History, Download } from "lucide-react";
import {
  AdminShell,
  AdminTable,
  FilterBar,
  StatusBadge,
  SectionCard,
  Drawer,
} from "@/components/AdminShell";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const USERS = [
  { id: "U10241", name: "Nguyễn Thị Hồng", email: "hong.nguyen@gmail.com", orders: 28, scans: 142, status: "Hoạt động", joined: "12/03/2025" },
  { id: "U10242", name: "Trần Văn Minh", email: "minh.tran@gmail.com", orders: 15, scans: 88, status: "Hoạt động", joined: "04/04/2025" },
  { id: "U10243", name: "Lê Thị Mai", email: "mai.le@yahoo.com", orders: 42, scans: 201, status: "Hoạt động", joined: "21/01/2025" },
  { id: "U10244", name: "Phạm Quốc Hùng", email: "hung.pham@gmail.com", orders: 3, scans: 12, status: "Tạm khóa", joined: "08/06/2025" },
  { id: "U10245", name: "Võ Thị Lan", email: "lan.vo@outlook.com", orders: 64, scans: 312, status: "Hoạt động", joined: "15/11/2024" },
  { id: "U10246", name: "Đặng Văn Phú", email: "phu.dang@gmail.com", orders: 9, scans: 47, status: "Đã khóa", joined: "02/02/2026" },
  { id: "U10247", name: "Hoàng Thị Yến", email: "yen.hoang@gmail.com", orders: 22, scans: 95, status: "Hoạt động", joined: "30/05/2025" },
  { id: "U10248", name: "Bùi Thanh Tùng", email: "tung.bui@gmail.com", orders: 11, scans: 64, status: "Hoạt động", joined: "18/12/2025" },
];

function AdminUsers() {
  const [filter, setFilter] = useState("Tất cả");
  const [selected, setSelected] = useState<typeof USERS[number] | null>(null);

  const filtered = USERS.filter((u) => filter === "Tất cả" || u.status === filter);

  return (
    <AdminShell title="Quản lý người dùng" subtitle={`Tổng cộng ${USERS.length} người dùng`}>
      <FilterBar>
        <div className="flex items-center gap-2 bg-[oklch(0.97_0.04_95)] px-3 h-9 rounded-lg flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Tìm theo tên, email, ID..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        {["Tất cả", "Hoạt động", "Tạm khóa", "Đã khóa"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`h-9 px-3 rounded-lg text-sm font-semibold ${
              filter === s ? "gt-gradient text-white" : "bg-muted text-foreground/70 hover:bg-muted/70"
            }`}
          >
            {s}
          </button>
        ))}
        <button className="h-9 px-3 rounded-lg text-sm font-semibold bg-white border border-border flex items-center gap-1.5">
          <Download className="h-4 w-4" /> Xuất CSV
        </button>
      </FilterBar>

      <SectionCard title={`Danh sách người dùng (${filtered.length})`}>
        <AdminTable
          head={
            <>
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Tên người dùng</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3 text-right">Đơn</th>
              <th className="py-2 pr-3 text-right">Quét AI</th>
              <th className="py-2 pr-3">Trạng thái</th>
              <th className="py-2 pr-3">Ngày tham gia</th>
              <th className="py-2 pr-3 text-right">Hành động</th>
            </>
          }
        >
          {filtered.map((u) => (
            <tr key={u.id} className="hover:bg-muted/30">
              <td className="py-3 pr-3 font-mono text-xs">{u.id}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full gt-gradient grid place-items-center text-white text-xs font-bold">
                    {u.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <span className="font-semibold">{u.name}</span>
                </div>
              </td>
              <td className="py-3 pr-3 text-muted-foreground">{u.email}</td>
              <td className="py-3 pr-3 text-right font-semibold">{u.orders}</td>
              <td className="py-3 pr-3 text-right font-semibold">{u.scans}</td>
              <td className="py-3 pr-3"><StatusBadge status={u.status} /></td>
              <td className="py-3 pr-3 text-xs text-muted-foreground">{u.joined}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => setSelected(u)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Xem chi tiết">
                    <Eye className="h-4 w-4" />
                  </button>
                  {u.status === "Hoạt động" ? (
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-red-600" title="Khóa tài khoản">
                      <Lock className="h-4 w-4" />
                    </button>
                  ) : (
                    <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-green-50 text-green-600" title="Mở khóa">
                      <Unlock className="h-4 w-4" />
                    </button>
                  )}
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted" title="Lịch sử mua hàng">
                    <History className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </SectionCard>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Chi tiết người dùng">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full gt-gradient grid place-items-center text-white text-xl font-extrabold">
                {selected.name.split(" ").slice(-1)[0][0]}
              </div>
              <div>
                <p className="font-extrabold text-lg">{selected.name}</p>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
                <p className="text-lg font-extrabold">{selected.orders}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Quét AI</p>
                <p className="text-lg font-extrabold">{selected.scans}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Đánh giá</p>
                <p className="text-lg font-extrabold">{Math.floor(selected.orders * 0.6)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Thông tin</p>
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between"><dt className="text-muted-foreground">ID</dt><dd className="font-mono">{selected.id}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Ngày tham gia</dt><dd>{selected.joined}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">SĐT</dt><dd>0987 123 456</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Khu vực</dt><dd>Hà Nội</dd></div>
              </dl>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 h-10 rounded-xl gt-gradient text-white font-semibold text-sm">
                Xem lịch sử mua hàng
              </button>
              <button className="h-10 px-4 rounded-xl border border-red-200 text-red-600 font-semibold text-sm">
                Khóa tài khoản
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </AdminShell>
  );
}