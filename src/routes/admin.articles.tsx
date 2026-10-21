import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Check, Clock3, ExternalLink, FilePlus2, ImagePlus, LoaderCircle, Pencil,
  Search, Send, Sparkles, Star, Trash2, X,
} from "lucide-react";
import { AdminShell, StatCard } from "@/components/AdminShell";
import { ArticleRichEditor } from "@/components/ArticleRichEditor";
import { api, formatDate, type AdminArticle, type ArticleWritePayload } from "@/lib/api";

export const Route = createFileRoute("/admin/articles")({ component: AdminArticles });

type ArticleForm = Omit<ArticleWritePayload, "publishedAt"> & { publishedAt: string };

const emptyArticle = (): ArticleForm => ({
  slug: "", title: "", category: "Dinh dưỡng", emoji: "🍊", gradient: "from-green-100 to-orange-100",
  description: "", body: "<p><br></p>", author: "Golden Time", publishedAt: "", published: false,
  coverUrl: "", coverAlt: "", featured: false, seoTitle: "", seoDescription: "",
});

function AdminArticles() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyArticle);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function loadArticles() {
    setLoading(true);
    setError("");
    try { setArticles(await api.adminArticles()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được danh sách bài viết."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadArticles(); }, []);

  const filteredArticles = useMemo(() => articles.filter((article) => {
    const matchesQuery = !query || `${article.title} ${article.slug} ${article.category}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"));
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "PUBLISHED" ? article.published : !article.published);
    return matchesQuery && matchesStatus;
  }), [articles, query, statusFilter]);
  const publishedCount = articles.filter((article) => article.published).length;
  const draftCount = articles.length - publishedCount;

  function beginCreate() {
    setEditingId(null);
    setForm(emptyArticle());
    setSlugTouched(false);
    setError("");
    setNotice("");
    setEditing(true);
  }

  function beginEdit(article: AdminArticle) {
    setEditingId(article.id);
    setForm({
      slug: article.slug, title: article.title, category: article.category, emoji: article.emoji || "📄",
      gradient: article.gradient || "from-green-100 to-orange-100", description: article.description || "",
      body: article.body || "<p><br></p>", author: article.author || "Golden Time",
      publishedAt: article.publishedAt?.slice(0, 10) || "", published: article.published,
      coverUrl: article.coverUrl || "", coverAlt: article.coverAlt || "", featured: Boolean(article.featured),
      seoTitle: article.seoTitle || "", seoDescription: article.seoDescription || "",
    });
    setSlugTouched(true);
    setError("");
    setNotice("");
    setEditing(true);
  }

  function updateTitle(title: string) {
    setForm((current) => ({ ...current, title, slug: slugTouched ? current.slug : makeSlug(title) }));
  }

  function update<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(publish: boolean) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload: ArticleWritePayload = { ...form, published: publish, publishedAt: form.publishedAt || null };
      const saved = editingId === null ? await api.createArticle(payload) : await api.updateArticle(editingId, payload);
      setArticles((current) => [saved, ...current.filter((article) => article.id !== saved.id)]);
      setEditingId(saved.id);
      setForm((current) => ({ ...current, slug: saved.slug, published: saved.published, publishedAt: saved.publishedAt || "" }));
      setNotice(publish ? "Bài viết đã được xuất bản lên website." : "Bản nháp đã được lưu.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được bài viết.");
    } finally { setSaving(false); }
  }

  async function removeArticle(article: AdminArticle) {
    if (!window.confirm(`Xóa bài viết “${article.title}”? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.deleteArticle(article.id);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      if (editingId === article.id) setEditing(false);
      setNotice("Đã xóa bài viết.");
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không xóa được bài viết."); }
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const image = await api.uploadArticleImage(file);
      update("coverUrl", image.url);
      if (!form.coverAlt) update("coverAlt", file.name.replace(/\.[^.]+$/, ""));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tải ảnh bìa chưa thành công."); }
    finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  const actions = !editing && <button type="button" onClick={beginCreate} className="inline-flex items-center gap-2 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white gt-shadow">
    <FilePlus2 className="h-4 w-4" /> Tạo bài viết
  </button>;

  return <AdminShell title="Quản lý bài viết" subtitle="Soạn, chỉnh sửa và xuất bản nội dung lên website công khai" actions={actions}>
    {error && <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Đóng thông báo"><X className="h-4 w-4" /></button></div>}
    {notice && <div role="status" className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
    {editing ? <ArticleEditorPanel
      form={form} editingId={editingId} saving={saving} uploadingCover={uploadingCover} coverInputRef={coverInputRef}
      onBack={() => { setEditing(false); setError(""); }} onUpdate={update} onUpdateTitle={updateTitle}
      onSlugEdit={(slug) => { setSlugTouched(true); update("slug", slug); }} onSave={save}
      onUploadCover={uploadCover} onUploadInline={async (file) => (await api.uploadArticleImage(file)).url}
      onPreview={() => setPreviewOpen(true)} onDelete={editingId === null ? undefined : () => { const found = articles.find((article) => article.id === editingId); if (found) void removeArticle(found); }}
    /> : <>
      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <StatCard label="Tổng số bài" value={String(articles.length)} hint="Bản nháp và bài đã xuất bản" icon={FilePlus2} />
        <StatCard label="Đang công khai" value={String(publishedCount)} hint="Hiển thị với khách truy cập" icon={Send} tone="primary" />
        <StatCard label="Bản nháp" value={String(draftCount)} hint="Chưa xuất hiện trên website" icon={Clock3} tone="orange" />
      </div>
      <section className="overflow-hidden rounded-3xl border border-border bg-white gt-shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tiêu đề, chuyên mục, đường dẫn…" className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm outline-none focus:border-primary" /></div>
          <div className="flex gap-2">
            {[{ value: "ALL", label: "Tất cả" }, { value: "PUBLISHED", label: "Đã xuất bản" }, { value: "DRAFT", label: "Bản nháp" }].map((item) => <button key={item.value} type="button" onClick={() => setStatusFilter(item.value as typeof statusFilter)} className={`rounded-full px-3 py-2 text-xs font-semibold ${statusFilter === item.value ? "gt-gradient text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{item.label}</button>)}
          </div>
        </div>
        {loading ? <div className="grid min-h-56 place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" /></div> : filteredArticles.length === 0 ? <div className="py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cream text-primary"><FilePlus2 className="h-5 w-5" /></div><p className="mt-3 font-semibold">{articles.length ? "Không có bài viết phù hợp" : "Chưa có bài viết nào"}</p><p className="mt-1 text-sm text-muted-foreground">Bắt đầu soạn nội dung đầu tiên cho website.</p><button type="button" onClick={beginCreate} className="mt-4 rounded-xl gt-gradient px-4 py-2.5 text-sm font-semibold text-white">Tạo bài viết</button></div> : <div className="divide-y divide-border">
          {filteredArticles.map((article) => <article key={article.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className={`h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${article.gradient || "from-green-100 to-orange-100"} sm:w-28`}>
              {article.coverUrl ? <img src={article.coverUrl} alt={article.coverAlt || article.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl">{article.emoji || "📄"}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${article.published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{article.published ? "Đang công khai" : "Bản nháp"}</span><span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-primary">{article.category}</span>{article.featured && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[11px] font-semibold text-yellow-700"><Star className="h-3 w-3 fill-current" /> Nổi bật</span>}</div>
              <h2 className="mt-2 truncate text-base font-bold">{article.title}</h2>
              <p className="mt-1 truncate text-xs text-muted-foreground">/knowledge/{article.slug} · Sửa lần cuối {formatDate(article.updatedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {article.published && <Link to="/knowledge/$slug" params={{ slug: article.slug }} target="_blank" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted" title="Mở bài viết công khai"><ExternalLink className="h-4 w-4" /></Link>}
              <button type="button" onClick={() => beginEdit(article)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted"><Pencil className="h-4 w-4" /> Sửa</button>
              <button type="button" onClick={() => void removeArticle(article)} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-red-700 hover:bg-red-50" aria-label={`Xóa ${article.title}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>)}
        </div>}
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Hiển thị {filteredArticles.length} / {articles.length} bài viết</div>
      </section>
    </>}
    {previewOpen && <ArticlePreview form={form} onClose={() => setPreviewOpen(false)} />}
  </AdminShell>;
}

function ArticleEditorPanel({
  form, editingId, saving, uploadingCover, coverInputRef, onBack, onUpdate, onUpdateTitle, onSlugEdit,
  onSave, onUploadCover, onUploadInline, onPreview, onDelete,
}: {
  form: ArticleForm; editingId: number | null; saving: boolean; uploadingCover: boolean; coverInputRef: React.RefObject<HTMLInputElement | null>;
  onBack: () => void; onUpdate: <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => void;
  onUpdateTitle: (title: string) => void; onSlugEdit: (slug: string) => void;
  onSave: (publish: boolean) => void; onUploadCover: (file?: File) => void; onUploadInline: (file: File) => Promise<string>;
  onPreview: () => void; onDelete?: () => void;
}) {
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Danh sách bài viết</button>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onPreview} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-muted"><ExternalLink className="h-4 w-4" /> Xem trước</button>
        {onDelete && <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Xóa</button>}
      </div>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section className="min-w-0 space-y-4 rounded-3xl border border-border bg-white p-4 sm:p-6 gt-shadow-soft">
        <div className="space-y-3">
          <label className="block"><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tiêu đề bài viết</span><input value={form.title} onChange={(event) => onUpdateTitle(event.target.value)} maxLength={512} placeholder="Ví dụ: Cách chọn trái cây tươi ngon" className="mt-1.5 h-14 w-full rounded-xl border border-border px-4 text-lg font-bold outline-none focus:border-primary" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Đường dẫn công khai</span><div className="mt-1.5 flex items-center rounded-xl border border-border bg-muted/30 px-3 text-sm"><span className="shrink-0 text-muted-foreground">/knowledge/</span><input value={form.slug} onChange={(event) => onSlugEdit(event.target.value)} placeholder="duong-dan-bai-viet" className="h-10 min-w-0 flex-1 bg-transparent outline-none" /></div></label>
        </div>
        <label className="block"><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mô tả ngắn</span><textarea value={form.description || ""} onChange={(event) => onUpdate("description", event.target.value)} maxLength={2000} rows={3} placeholder="Tóm tắt nội dung để hiển thị trên danh sách bài viết và kết quả tìm kiếm…" className="mt-1.5 w-full resize-y rounded-xl border border-border p-3 text-sm leading-6 outline-none focus:border-primary" /><span className="mt-1 block text-right text-[11px] text-muted-foreground">{(form.description || "").length}/2000</span></label>
        <div><div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nội dung bài viết</span><span className="inline-flex items-center gap-1 text-[11px] text-primary"><Sparkles className="h-3 w-3" /> Trình soạn thảo</span></div><ArticleRichEditor value={form.body} onChange={(body) => onUpdate("body", body)} onUploadImage={onUploadInline} /></div>
      </section>
      <aside className="space-y-4">
        <Panel title="Xuất bản">
          <label className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3"><span><span className="block text-sm font-semibold">Bài viết nổi bật</span><span className="block text-xs text-muted-foreground">Ưu tiên hiển thị trên trang danh sách</span></span><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => onUpdate("featured", event.target.checked)} className="h-4 w-4 accent-green-600" /></label>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Ngày xuất bản</span><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.publishedAt || ""} onChange={(event) => onUpdate("publishedAt", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <div className="mt-4 grid gap-2"><button type="button" disabled={saving} onClick={() => onSave(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl gt-gradient text-sm font-bold text-white disabled:opacity-60"><Send className="h-4 w-4" />{saving ? "Đang lưu…" : form.published ? "Lưu và cập nhật công khai" : "Xuất bản"}</button><button type="button" disabled={saving} onClick={() => onSave(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-60"><Check className="h-4 w-4" />{saving ? "Đang lưu…" : "Lưu bản nháp"}</button></div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{form.published ? "Bài viết hiện đang hiển thị công khai. Lưu bản nháp sẽ gỡ bài khỏi website." : "Bản nháp chỉ quản trị viên nhìn thấy cho đến khi xuất bản."}</p>
        </Panel>
        <Panel title="Thông tin bài viết">
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Chuyên mục</span><input list="article-categories" value={form.category} onChange={(event) => onUpdate("category", event.target.value)} maxLength={128} placeholder="Dinh dưỡng" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /><datalist id="article-categories">{["Chọn trái cây", "Dinh dưỡng", "Bảo quản", "Mua sắm thông minh", "Theo mùa", "Sức khỏe"].map((category) => <option key={category} value={category} />)}</datalist></label>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Tác giả</span><input value={form.author} onChange={(event) => onUpdate("author", event.target.value)} maxLength={255} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Biểu tượng khi chưa có ảnh bìa</span><input value={form.emoji} onChange={(event) => onUpdate("emoji", event.target.value)} maxLength={16} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
        </Panel>
        <Panel title="Ảnh bìa">
          <div className={`relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${form.gradient || "from-green-100 to-orange-100"}`}>
            {form.coverUrl ? <img src={form.coverUrl} alt={form.coverAlt || "Xem trước ảnh bìa"} className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-primary/70" />}
          </div>
          <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => onUploadCover(event.target.files?.[0])} />
          <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted disabled:opacity-60"><ImagePlus className="h-4 w-4" />{uploadingCover ? "Đang tải ảnh…" : "Tải ảnh từ máy"}</button>
          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Ảnh tải lên được chuyển an toàn qua backend lên Cloudinary để giữ ổn định sau khi deploy. Cần cấu hình thông tin Cloudinary trong biến môi trường backend; URL HTTPS công khai cũng có thể dùng trực tiếp.</p>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Hoặc dán URL ảnh công khai</span><input value={form.coverUrl || ""} onChange={(event) => onUpdate("coverUrl", event.target.value)} placeholder="https://..." className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Mô tả ảnh (alt text)</span><input value={form.coverAlt || ""} onChange={(event) => onUpdate("coverAlt", event.target.value)} maxLength={512} placeholder="Mô tả ngắn giúp hỗ trợ đọc màn hình" className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
          {form.coverUrl && <button type="button" onClick={() => { onUpdate("coverUrl", ""); onUpdate("coverAlt", ""); }} className="mt-2 text-xs font-semibold text-red-700 hover:underline">Gỡ ảnh bìa</button>}
        </Panel>
        <Panel title="Tối ưu tìm kiếm">
          <label className="block"><span className="text-xs font-semibold text-muted-foreground">Tiêu đề SEO</span><input value={form.seoTitle || ""} onChange={(event) => onUpdate("seoTitle", event.target.value)} maxLength={255} placeholder={form.title || "Tiêu đề hiển thị trên Google"} className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-sm" /></label>
          <label className="mt-3 block"><span className="text-xs font-semibold text-muted-foreground">Mô tả SEO</span><textarea value={form.seoDescription || ""} onChange={(event) => onUpdate("seoDescription", event.target.value)} maxLength={2000} rows={3} placeholder="Mô tả ngắn hiển thị trên công cụ tìm kiếm" className="mt-1 w-full rounded-xl border border-border p-3 text-sm" /></label>
        </Panel>
      </aside>
    </div>
  </div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-white p-4 gt-shadow-soft"><h2 className="mb-3 text-sm font-bold">{title}</h2>{children}</section>;
}

function ArticlePreview({ form, onClose }: { form: ArticleForm; onClose: () => void }) {
  const safeHtml = sanitizePreviewHtml(form.body);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Xem trước bài viết">
    <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Xem trước · Golden Time</p><p className="mt-0.5 text-xs text-muted-foreground">/knowledge/{form.slug || "duong-dan-bai-viet"}</p></div><button type="button" onClick={onClose} aria-label="Đóng xem trước" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button></div>
      <div className="overflow-y-auto"><article className="mx-auto max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
        <span className="inline-flex rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{form.category || "Chuyên mục"}</span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{form.title || "Tiêu đề bài viết"}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{form.author || "Golden Time"} · {form.publishedAt ? formatDate(form.publishedAt) : "Ngày xuất bản"}</p>
        {form.coverUrl && <img src={form.coverUrl} alt={form.coverAlt || form.title} className="mt-8 max-h-[28rem] w-full rounded-3xl object-cover" />}
        {form.description && <p className="mt-7 text-lg font-semibold leading-8">{form.description}</p>}
        <div className="article-content mt-7" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </article></div>
    </div>
  </div>;
}

const PREVIEW_TAGS = new Set(["P", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "HR", "PRE", "CODE", "A", "STRONG", "B", "EM", "I", "U", "S", "SPAN", "BR", "FIGURE", "FIGCAPTION", "IMG", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]);
function sanitizePreviewHtml(html: string) {
  if (typeof DOMParser === "undefined") return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  for (const element of Array.from(document.body.querySelectorAll("*"))) {
    if (!PREVIEW_TAGS.has(element.tagName)) { element.replaceWith(...Array.from(element.childNodes)); continue; }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === "class") {
        const allowed = attribute.value.split(/\s+/).filter((value) => value.startsWith("article-")).join(" ");
        allowed ? element.setAttribute("class", allowed) : element.removeAttribute("class");
      } else if (element.tagName === "IMG" && attribute.name === "src") {
        if (!/^(https?:\/\/|\/uploads\/)/i.test(attribute.value)) element.removeAttribute("src");
      } else if (element.tagName === "IMG" && attribute.name === "alt") continue;
      else if (element.tagName === "A" && attribute.name === "href") {
        if (!/^(https?:\/\/|mailto:)/i.test(attribute.value)) element.removeAttribute("href");
      } else if (element.tagName === "A" && ["title", "target", "rel"].includes(attribute.name)) continue;
      else element.removeAttribute(attribute.name);
    }
  }
  return document.body.innerHTML;
}

function makeSlug(value: string) {
  return value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
