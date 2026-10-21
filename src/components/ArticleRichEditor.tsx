import { useEffect, useRef, useState } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, ImagePlus, Italic, Link2,
  List, ListOrdered, Quote, Underline,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
};

const fontClasses: Record<string, string> = {
  "Phông chữ mặc định": "article-font-sans",
  "Phông chữ có chân": "article-font-serif",
};
const sizeClasses: Record<string, string> = {
  "Cỡ nhỏ": "article-size-small",
  "Cỡ thường": "article-size-normal",
  "Cỡ lớn": "article-size-large",
  "Cỡ rất lớn": "article-size-xl",
};

export function ArticleRichEditor({ value, onChange, onUploadImage }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "<p><br></p>";
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function run(command: string, argument?: string) {
    focusEditor();
    document.execCommand(command, false, argument);
    emitChange();
  }

  function applyClass(className: string) {
    focusEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className = className;
    span.append(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);
    emitChange();
  }

  function align(className: string) {
    focusEditor();
    const selection = window.getSelection();
    const element = selection?.anchorNode?.parentElement?.closest("p,h2,h3,h4,li,blockquote,figcaption");
    if (!element) return;
    element.classList.remove("article-align-left", "article-align-center", "article-align-right");
    element.classList.add(className);
    emitChange();
  }

  function emitChange() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function insertImage(url: string, alt: string) {
    const safeUrl = url.trim();
    if (!safeUrl || !(/^(https?:\/\/|\/uploads\/)/i.test(safeUrl))) {
      window.alert("Dùng đường dẫn ảnh HTTPS hoặc ảnh đã tải lên Golden Time.");
      return;
    }
    focusEditor();
    const escape = (input: string) => input.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.execCommand("insertHTML", false, `<figure><img src="${escape(safeUrl)}" alt="${escape(alt)}"></figure><p><br></p>`);
    emitChange();
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      insertImage(url, window.prompt("Mô tả ngắn cho ảnh (alt text)", file.name.replace(/\.[^.]+$/, "")) || "");
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "Tải ảnh chưa thành công.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function insertLink() {
    const value = window.prompt("Dán liên kết HTTPS hoặc mailto:");
    if (!value) return;
    if (!/^(https?:\/\/|mailto:)/i.test(value)) {
      window.alert("Liên kết phải bắt đầu bằng https:// hoặc mailto:");
      return;
    }
    run("createLink", value);
  }

  const button = (label: string, icon: React.ReactNode, onClick: () => void) => (
    <button type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick}
      className="h-9 min-w-9 px-2 rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground inline-flex items-center justify-center gap-1">
      {icon}<span className="hidden xl:inline text-xs">{label}</span>
    </button>
  );

  return <div className="overflow-hidden rounded-2xl border border-border bg-white">
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-white p-2">
      {button("Đậm", <Bold className="h-4 w-4" />, () => run("bold"))}
      {button("Nghiêng", <Italic className="h-4 w-4" />, () => run("italic"))}
      {button("Gạch chân", <Underline className="h-4 w-4" />, () => run("underline"))}
      <span className="mx-1 h-6 w-px bg-border" />
      {button("Tiêu đề", <Heading2 className="h-4 w-4" />, () => run("formatBlock", "<h2>"))}
      {button("Danh sách", <List className="h-4 w-4" />, () => run("insertUnorderedList"))}
      {button("Đánh số", <ListOrdered className="h-4 w-4" />, () => run("insertOrderedList"))}
      {button("Trích dẫn", <Quote className="h-4 w-4" />, () => run("formatBlock", "<blockquote>"))}
      <span className="mx-1 h-6 w-px bg-border" />
      {button("Canh trái", <AlignLeft className="h-4 w-4" />, () => align("article-align-left"))}
      {button("Canh giữa", <AlignCenter className="h-4 w-4" />, () => align("article-align-center"))}
      {button("Canh phải", <AlignRight className="h-4 w-4" />, () => align("article-align-right"))}
      {button("Chèn liên kết", <Link2 className="h-4 w-4" />, insertLink)}
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => fileRef.current?.click()}
        disabled={uploading} className="h-9 rounded-lg px-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:bg-cream disabled:opacity-50">
        <ImagePlus className="h-4 w-4" />{uploading ? "Đang tải ảnh…" : "Chèn ảnh"}
      </button>
      <input ref={fileRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void handleImageFile(event.target.files?.[0])} />
      <span className="mx-1 h-6 w-px bg-border" />
      <select aria-label="Phông chữ" defaultValue="" onChange={(event) => { if (event.target.value) applyClass(event.target.value); event.target.value = ""; }} className="h-9 max-w-36 rounded-lg border border-border bg-white px-2 text-xs">
        <option value="" disabled>Phông chữ</option>{Object.entries(fontClasses).map(([label, className]) => <option key={className} value={className}>{label}</option>)}
      </select>
      <select aria-label="Cỡ chữ" defaultValue="" onChange={(event) => { if (event.target.value) applyClass(event.target.value); event.target.value = ""; }} className="h-9 rounded-lg border border-border bg-white px-2 text-xs">
        <option value="" disabled>Cỡ chữ</option>{Object.entries(sizeClasses).map(([label, className]) => <option key={className} value={className}>{label}</option>)}
      </select>
      <select aria-label="Màu chữ" defaultValue="" onChange={(event) => { if (event.target.value) applyClass(event.target.value); event.target.value = ""; }} className="h-9 rounded-lg border border-border bg-white px-2 text-xs">
        <option value="" disabled>Màu chữ</option><option value="article-color-green">Xanh Golden Time</option><option value="article-color-orange">Cam</option><option value="article-color-muted">Xám</option>
      </select>
    </div>
    <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="Nội dung bài viết" aria-multiline="true"
      onInput={emitChange} onBlur={emitChange} className="article-editor min-h-[28rem] px-5 py-4 outline-none" />
    <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">Có thể dán văn bản trực tiếp. Ảnh trong bài được tải lên riêng và thêm vào nội dung.</div>
  </div>;
}
