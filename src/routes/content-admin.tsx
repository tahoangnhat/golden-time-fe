import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit, EyeOff, Trash2, X, Save, FileText, Sparkles, Link as LinkIcon } from "lucide-react";
import { SiteShell, Section } from "@/components/SiteShell";
import { ARTICLES, UPDATES } from "@/lib/site-data";

export const Route = createFileRoute("/content-admin")({
  head: () => ({ meta: [{ title: "Quản lý nội dung — Golden Time" }] }),
  component: ContentAdminPage,
});

const TABS = [
  { id: "articles", label: "Bài viết kiến thức", icon: FileText },
  { id: "updates", label: "Cập nhật ứng dụng", icon: Sparkles },
  { id: "social", label: "Liên kết mạng xã hội", icon: LinkIcon },
] as const;

function ContentAdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("articles");
  return (
    <SiteShell>
      <Section className="py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <div>
            <div className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-cream px-3 py-1 rounded-full mb-3">
              Demo CMS
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Quản lý nội dung</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Bản mẫu giao diện để đội ngũ Golden Time hình dung quy trình quản lý bài viết, cập nhật và mạng xã hội.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-2 border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px ${
                tab === t.id ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "articles" && <ArticlesTab />}
          {tab === "updates" && <UpdatesTab />}
          {tab === "social" && <SocialTab />}
        </div>
      </Section>
    </SiteShell>
  );
}

function ArticlesTab() {
  const [openModal, setOpenModal] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-muted-foreground">{ARTICLES.length} bài viết</div>
        <button onClick={() => setOpenModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gt-gradient text-white text-sm font-semibold gt-shadow">
          <Plus className="h-4 w-4" /> Thêm bài viết
        </button>
      </div>
      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-foreground/70 text-xs uppercase tracking-wider">
              <tr>
                <Th>Tiêu đề</Th><Th>Danh mục</Th><Th>Tác giả</Th><Th>Ngày đăng</Th><Th>Trạng thái</Th><Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {ARTICLES.map((a, i) => (
                <tr key={a.slug} className="border-t border-border">
                  <Td><div className="flex items-center gap-3"><span className="text-xl">{a.emoji}</span><span className="font-semibold">{a.title}</span></div></Td>
                  <Td><span className="text-xs font-bold px-2 py-1 rounded-full bg-cream text-primary">{a.category}</span></Td>
                  <Td>{a.author}</Td>
                  <Td>{a.date}</Td>
                  <Td>{i % 3 === 0 ? <Badge color="amber">Nháp</Badge> : <Badge color="green">Công khai</Badge>}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <IconBtn title="Chỉnh sửa"><Edit className="h-4 w-4" /></IconBtn>
                      <IconBtn title="Ẩn bài viết"><EyeOff className="h-4 w-4" /></IconBtn>
                      <IconBtn title="Xóa" danger><Trash2 className="h-4 w-4" /></IconBtn>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {openModal && <AddArticleModal onClose={() => setOpenModal(false)} />}
    </div>
  );
}

function UpdatesTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-muted-foreground">{UPDATES.length} bản cập nhật</div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gt-gradient text-white text-sm font-semibold gt-shadow">
          <Plus className="h-4 w-4" /> Thêm cập nhật
        </button>
      </div>
      <div className="bg-white border border-border rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-foreground/70 text-xs uppercase tracking-wider">
            <tr><Th>Version</Th><Th>Ngày</Th><Th>Loại</Th><Th>Changelog</Th><Th>Hành động</Th></tr>
          </thead>
          <tbody>
            {UPDATES.map((u) => (
              <tr key={u.version} className="border-t border-border">
                <Td><span className="font-bold">v{u.version}</span></Td>
                <Td>{u.date}</Td>
                <Td><Badge color="green">{u.type}</Badge></Td>
                <Td className="max-w-md"><ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-xs">{u.changes.slice(0,2).map(c => <li key={c}>{c}</li>)}</ul></Td>
                <Td>
                  <div className="flex gap-1">
                    <IconBtn><Edit className="h-4 w-4" /></IconBtn>
                    <IconBtn danger><Trash2 className="h-4 w-4" /></IconBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SocialTab() {
  const fields = [
    { l: "Fanpage URL", v: "https://facebook.com/goldentime" },
    { l: "TikTok URL", v: "https://tiktok.com/@goldentime" },
    { l: "App Store URL", v: "https://apps.apple.com/app/goldentime" },
    { l: "Google Play URL", v: "https://play.google.com/store/apps/details?id=vn.goldentime" },
    { l: "APK Download URL", v: "https://goldentime.vn/download/goldentime.apk" },
  ];
  return (
    <div className="bg-white border border-border rounded-3xl p-6 lg:p-8 max-w-3xl">
      <h3 className="text-lg font-extrabold mb-1">Liên kết mạng xã hội & tải ứng dụng</h3>
      <p className="text-sm text-muted-foreground mb-6">Cập nhật các URL hiển thị trên toàn website.</p>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.l}>
            <label className="text-sm font-semibold mb-1.5 block">{f.l}</label>
            <input defaultValue={f.v} className="w-full px-4 py-3 rounded-2xl bg-cream border border-border focus:border-primary focus:outline-none text-sm" />
          </div>
        ))}
      </div>
      <button className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl gt-gradient text-white font-semibold gt-shadow">
        <Save className="h-4 w-4" /> Lưu liên kết
      </button>
    </div>
  );
}

function AddArticleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
          <h3 className="text-lg font-extrabold">Thêm bài viết</h3>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-xl bg-cream"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Tiêu đề bài viết" placeholder="VD: Cách bảo quản dưa hấu lâu ngày" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Danh mục" placeholder="Chọn trái cây" />
            <Field label="Trạng thái" placeholder="Nháp / Công khai" />
          </div>
          <Field label="Ảnh đại diện" placeholder="https://..." />
          <Field label="Mô tả ngắn" placeholder="Tóm tắt nội dung trong 1-2 câu" />
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Nội dung bài viết</label>
            <textarea rows={8} placeholder="Nội dung markdown..." className="w-full px-4 py-3 rounded-2xl bg-cream border border-border focus:border-primary focus:outline-none text-sm" />
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-cream font-semibold text-sm">Hủy</button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gt-gradient text-white font-semibold text-sm gt-shadow">
            <Save className="h-4 w-4" /> Lưu bài viết
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-5 py-3 font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td>;
}
function Badge({ color, children }: { color: "green" | "amber"; children: React.ReactNode }) {
  const c = color === "green"
    ? "bg-[oklch(0.94_0.14_140)] text-[oklch(0.35_0.15_145)]"
    : "bg-[oklch(0.94_0.14_85)] text-[oklch(0.4_0.16_70)]";
  return <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${c}`}>{children}</span>;
}
function IconBtn({ children, danger, title }: { children: React.ReactNode; danger?: boolean; title?: string }) {
  return (
    <button title={title} className={`h-8 w-8 grid place-items-center rounded-lg ${danger ? "text-[oklch(0.55_0.2_30)] hover:bg-[oklch(0.95_0.08_30)]" : "text-foreground/70 hover:bg-cream"}`}>
      {children}
    </button>
  );
}
function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold mb-1.5 block">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full px-4 py-3 rounded-2xl bg-cream border border-border focus:border-primary focus:outline-none text-sm" />
    </div>
  );
}