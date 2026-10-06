import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ImageUp, Zap, Lightbulb, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { ApiError, api, hasAuth, userStorageKey } from "@/lib/api";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Quét AI — Golden Time" }] }),
  component: Scan,
});

function Scan() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function chooseFile(next: File | undefined) {
    if (!next) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError("");
  }

  async function analyze() {
    if (!file) return setError("Hãy chụp hoặc chọn ảnh trái cây trước.");
    if (!hasAuth()) return setError("Để lưu kết quả quét, hãy đăng nhập trong ứng dụng Golden Time.");
    setBusy(true);
    setError("");
    try {
      const result = await api.scan(file);
      window.localStorage.setItem(userStorageKey("golden-time-provider-scan"), JSON.stringify(result));
      window.location.assign(`/result?scanId=${result.id}`);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể phân tích ảnh lúc này.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneShell bg="bg-[oklch(0.18_0.03_150)]">
      <div className="text-white">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link to="/home" className="h-9 w-9 grid place-items-center rounded-full bg-white/10"><ChevronLeft className="h-5 w-5" /></Link>
          <span className="font-semibold">Quét trái cây</span>
          <span className="h-9 w-9 grid place-items-center rounded-full bg-white/10"><Lightbulb className="h-4 w-4" /></span>
        </div>
        <div className="mx-5 mt-2 aspect-[3/4] rounded-[2rem] overflow-hidden relative bg-gradient-to-br from-[oklch(0.3_0.08_140)] to-[oklch(0.18_0.05_150)]">
          {preview ? <img src={preview} alt="Ảnh trái cây đã chọn" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center"><span className="text-[10rem] drop-shadow-2xl">🍎</span></div>}
          <div className="absolute inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 h-10 w-10 border-t-4 border-l-4 border-lime-300 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 h-10 w-10 border-t-4 border-r-4 border-lime-300 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-lime-300 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-lime-300 rounded-br-2xl" />
          </div>
          <div className="absolute bottom-5 inset-x-5 bg-black/45 rounded-2xl px-4 py-3 text-center text-sm">Chọn ảnh PNG, JPEG hoặc WebP, tối đa 10 MB</div>
        </div>
        <div className="px-5 mt-6 space-y-3">
          <label className="w-full py-4 rounded-2xl bg-white/10 font-semibold border border-white/15 flex items-center justify-center gap-2 cursor-pointer">
            <ImageUp className="h-5 w-5" /> {file ? file.name : "Chụp ảnh / tải ảnh lên"}
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} />
          </label>
          <button disabled={busy} onClick={analyze} className="block w-full text-center py-4 rounded-2xl gt-gradient font-semibold gt-shadow disabled:opacity-60">
            <span className="inline-flex items-center gap-2">{busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-white" />} {busy ? "Đang phân tích…" : "Phân tích ngay"}</span>
          </button>
          {error && <p className="rounded-xl bg-red-950/50 px-3 py-2 text-sm text-red-100">{error}</p>}
          <p className="text-[11px] text-white/60 text-center pt-1">Cần cấu hình dịch vụ AI trước khi có thể phân tích ảnh.</p>
        </div>
      </div>
    </PhoneShell>
  );
}
