import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, ImagePlus, Italic, Link2,
  List, ListOrdered, Quote, Underline, Maximize2,
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [selectionBox, setSelectionBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [imageWidth, setImageWidth] = useState(0);
  const [widthInput, setWidthInput] = useState("");
  const [widthUnit, setWidthUnit] = useState<"px" | "%">("px");
  const resizeRef = useRef<{ pointerId: number; startX: number; startY: number; startWidth: number; maxWidth: number; signX: number; signY: number } | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "<p><br></p>";
  }, [value]);

  function refreshSelectionBox(image = selectedImage) {
    const canvas = canvasRef.current;
    if (!canvas || !image || !image.isConnected) return;
    const canvasRect = canvas.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    setSelectionBox({ left: imageRect.left - canvasRect.left, top: imageRect.top - canvasRect.top, width: imageRect.width, height: imageRect.height });
  }

  useEffect(() => {
    const update = () => refreshSelectionBox();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedImage) return;
    const observer = new ResizeObserver(() => refreshSelectionBox());
    observer.observe(selectedImage);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [selectedImage]);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const resize = resizeRef.current;
      if (!resize || resize.pointerId !== event.pointerId || !selectedImage) return;
      const delta = ((event.clientX - resize.startX) * resize.signX + (event.clientY - resize.startY) * resize.signY) / Math.SQRT2;
      const minWidth = Math.min(48, resize.maxWidth);
      const nextWidth = Math.min(resize.maxWidth, Math.max(minWidth, resize.startWidth + delta));
      selectedImage.style.width = `${Math.round(nextWidth)}px`;
      selectedImage.style.height = "auto";
      setImageWidth(Math.round(nextWidth));
      setWidthInput(String(Math.round(nextWidth)));
      refreshSelectionBox(selectedImage);
    }
    function onPointerUp(event: PointerEvent) {
      if (resizeRef.current?.pointerId !== event.pointerId) return;
      resizeRef.current = null;
      emitChange();
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [selectedImage]);

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

  function selectImage(image: HTMLImageElement) {
    setSelectedImage(image);
    const width = image.style.width.trim();
    const match = width.match(/^(\d+(?:\.\d+)?)(px|%)$/);
    if (match?.[2] === "%") {
      setWidthUnit("%");
      setImageWidth(Number(match[1]));
      setWidthInput(match[1]);
    } else {
      setWidthUnit("px");
      const nextWidth = Math.round(image.getBoundingClientRect().width);
      setImageWidth(nextWidth);
      setWidthInput(String(nextWidth));
    }
    requestAnimationFrame(() => refreshSelectionBox(image));
  }

  function imageMaxWidth(image: HTMLImageElement) {
    const figure = image.closest("figure");
    return Math.max(1, figure?.clientWidth || editorRef.current?.clientWidth || 1);
  }

  function applyImageWidth(image: HTMLImageElement, requestedWidth: number, unit: "px" | "%" = widthUnit) {
    if (!Number.isFinite(requestedWidth)) return;
    const value = unit === "%"
      ? Math.min(100, Math.max(1, requestedWidth))
      : Math.min(imageMaxWidth(image), Math.max(Math.min(32, imageMaxWidth(image)), requestedWidth));
    image.style.width = `${Number(value.toFixed(2))}${unit}`;
    image.style.height = "auto";
    const nextWidth = Number(value.toFixed(unit === "px" ? 0 : 2));
    setImageWidth(nextWidth);
    setWidthInput(String(nextWidth));
    refreshSelectionBox(image);
    emitChange();
  }

  function startResize(event: ReactPointerEvent<HTMLButtonElement>, signX: number, signY: number) {
    if (!selectedImage) return;
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = {
      pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      startWidth: selectedImage.getBoundingClientRect().width, maxWidth: imageMaxWidth(selectedImage), signX, signY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeByKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>, signX: number, signY: number) {
    if (!selectedImage || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const delta = direction * (event.shiftKey ? 50 : 10);
    applyImageWidth(selectedImage, selectedImage.getBoundingClientRect().width + delta, "px");
  }

  function insertImage(url: string, alt: string) {
    const safeUrl = url.trim();
    if (!safeUrl || !(/^(https?:\/\/|\/uploads\/)/i.test(safeUrl))) {
      window.alert("Dùng đường dẫn ảnh HTTPS hoặc ảnh đã tải lên Golden Time.");
      return;
    }
    focusEditor();
    const escape = (input: string) => input.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.execCommand("insertHTML", false, `<figure><img src="${escape(safeUrl)}" alt="${escape(alt)}" style="height: auto;"></figure><p><br></p>`);
    const images = editorRef.current?.querySelectorAll("img");
    const insertedImage = images?.[images.length - 1];
    if (insertedImage) selectImage(insertedImage);
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

  const imageWidthChoices = [25, 50, 75, 100];

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
    {selectedImage?.isConnected && <div className="flex flex-wrap items-center gap-2 border-b border-green-200 bg-green-50/80 px-3 py-2.5" aria-label="Điều chỉnh kích thước ảnh">
      <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-semibold text-green-900"><Maximize2 className="h-4 w-4" />Kích thước ảnh</span>
      <label className="flex h-9 items-center overflow-hidden rounded-lg border border-green-200 bg-white">
        <span className="sr-only">Chiều rộng ảnh</span>
        <input type="number" min={widthUnit === "%" ? 1 : 32} max={widthUnit === "%" ? 100 : Math.round(imageMaxWidth(selectedImage))}
          value={widthInput} onChange={(event) => setWidthInput(event.target.value)}
          onBlur={() => { if (widthInput) applyImageWidth(selectedImage, Number(widthInput)); }}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyImageWidth(selectedImage, Number(widthInput)); event.currentTarget.blur(); } }}
          onMouseDown={(event) => event.stopPropagation()} className="h-full w-20 px-2 text-sm outline-none" aria-label="Chiều rộng ảnh" />
        <select value={widthUnit} onChange={(event) => {
          const nextUnit = event.target.value as "px" | "%";
          const currentPixels = selectedImage.getBoundingClientRect().width;
          const nextWidth = nextUnit === "%" ? currentPixels / imageMaxWidth(selectedImage) * 100 : currentPixels;
          setWidthUnit(nextUnit);
          applyImageWidth(selectedImage, nextWidth, nextUnit);
        }} className="h-full border-l border-green-100 bg-green-50 px-2 text-xs font-semibold outline-none" aria-label="Đơn vị chiều rộng">
          <option value="px">px</option><option value="%">%</option>
        </select>
      </label>
      <span className="text-[11px] text-green-900/70">Chiều cao tự động theo tỷ lệ ảnh</span>
      <span className="mx-1 hidden h-6 w-px bg-green-200 sm:block" />
      <span className="text-[11px] font-semibold text-green-900">Theo vùng nội dung</span>
      {imageWidthChoices.map((percent) => <button key={percent} type="button" aria-pressed={widthUnit === "%" && Math.abs(imageWidth - percent) < 0.1}
        onMouseDown={(event) => event.preventDefault()} onClick={() => { setWidthUnit("%"); applyImageWidth(selectedImage, percent, "%"); }}
        className={`h-8 rounded-lg px-2.5 text-xs font-semibold ${widthUnit === "%" && Math.abs(imageWidth - percent) < 0.1 ? "bg-green-700 text-white" : "bg-white text-green-900 ring-1 ring-green-200 hover:bg-green-100"}`}>{percent}%</button>)}
    </div>}
    <div ref={canvasRef} className="relative">
      <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="Nội dung bài viết" aria-multiline="true"
        onInput={emitChange} onBlur={emitChange}
        onMouseDown={(event) => { if (event.target instanceof HTMLImageElement) event.preventDefault(); }}
        onClick={(event) => {
          if (!(event.target instanceof Element)) return;
          const image = event.target.closest("img");
          if (image instanceof HTMLImageElement) selectImage(image);
          else setSelectedImage(null);
        }}
        onKeyDown={(event) => { if (event.key === "Escape") setSelectedImage(null); }}
        className="article-editor min-h-[28rem] px-5 py-4 outline-none" />
      {selectedImage?.isConnected && <div contentEditable={false} className="pointer-events-none absolute z-10 border-2 border-primary"
        style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height }}>
        {([{ sx: -1, sy: -1, position: "-left-2 -top-2", label: "Góc trên trái" }, { sx: 1, sy: -1, position: "-right-2 -top-2", label: "Góc trên phải" }, { sx: -1, sy: 1, position: "-left-2 -bottom-2", label: "Góc dưới trái" }, { sx: 1, sy: 1, position: "-right-2 -bottom-2", label: "Góc dưới phải" }] as const).map(({ sx, sy, position, label }) => <button key={label} type="button" aria-label={`Kéo ${label} để đổi kích thước ảnh`}
          onPointerDown={(event) => startResize(event, sx, sy)} onKeyDown={(event) => resizeByKeyboard(event, sx, sy)}
          className={`pointer-events-auto absolute ${position} h-4 w-4 touch-none rounded-full border-2 border-white bg-primary shadow`} />)}
      </div>}
    </div>
    <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">Có thể dán văn bản trực tiếp. Ảnh trong bài được tải lên riêng và thêm vào nội dung.</div>
  </div>;
}
