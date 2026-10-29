import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, CameraOff, ChevronLeft, ImageUp, Zap, Lightbulb, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);
  const autoStartAttemptedRef = useRef(false);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt hoặc kết nối hiện tại không hỗ trợ camera. Hãy tải ảnh lên thay thế.");
      return;
    }

    setCameraBusy(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraOpen(true);
    } catch (cause) {
      if (!mountedRef.current) return;
      const cameraError = cause as DOMException;
      setError(cameraError.name === "NotAllowedError"
        ? "Bạn chưa cấp quyền dùng camera. Hãy cho phép truy cập camera trong trình duyệt rồi thử lại."
        : cameraError.name === "NotFoundError"
        ? "Không tìm thấy camera trên thiết bị này. Bạn có thể tải ảnh lên thay thế."
        : "Không mở được camera. Hãy kiểm tra quyền truy cập hoặc tải ảnh lên thay thế.");
    } finally {
      if (mountedRef.current) setCameraBusy(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOpen || !cameraStream || !video) return;

    video.srcObject = cameraStream;
    void video.play().catch(() => setError("Không thể phát hình ảnh từ camera. Hãy thử tải ảnh lên."));
    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    void startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera chưa sẵn sàng. Hãy đợi hình ảnh hiện lên rồi chụp.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Không thể xử lý ảnh từ camera. Hãy tải ảnh lên thay thế.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Không thể lưu ảnh vừa chụp. Hãy thử lại.");
        return;
      }
      const capturedFile = new File([blob], `golden-time-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
      setError("");
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  function chooseFile(next: File | undefined) {
    if (!next) return;
    stopCamera();
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
          {cameraOpen ? <video ref={videoRef} autoPlay playsInline muted aria-label="Hình ảnh camera trực tiếp" className="absolute inset-0 h-full w-full object-cover" /> : preview ? <img src={preview} alt="Ảnh trái cây đã chọn" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center"><span className="text-[10rem] drop-shadow-2xl">🍎</span></div>}
          <div className="absolute inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 h-10 w-10 border-t-4 border-l-4 border-lime-300 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 h-10 w-10 border-t-4 border-r-4 border-lime-300 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-lime-300 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-lime-300 rounded-br-2xl" />
          </div>
          <div className="absolute bottom-5 inset-x-5 bg-black/45 rounded-2xl px-4 py-3 text-center text-sm">{cameraOpen ? "Canh trái cây trong khung hình rồi chụp" : "Chụp trực tiếp hoặc chọn ảnh PNG, JPEG, WebP"}</div>
        </div>
        <div className="px-5 mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {cameraOpen ? <>
              <button type="button" onClick={capturePhoto} className="py-3 rounded-2xl gt-gradient font-semibold gt-shadow flex items-center justify-center gap-2"><Camera className="h-5 w-5" /> Chụp ảnh</button>
              <button type="button" onClick={stopCamera} className="py-3 rounded-2xl bg-white/10 font-semibold border border-white/15 flex items-center justify-center gap-2"><CameraOff className="h-5 w-5" /> Tắt camera</button>
            </> : <>
              <button type="button" disabled={cameraBusy} onClick={() => void startCamera()} className="py-3 rounded-2xl gt-gradient font-semibold gt-shadow disabled:opacity-60 flex items-center justify-center gap-2"><Camera className="h-5 w-5" /> {cameraBusy ? "Đang mở…" : "Mở camera"}</button>
              <label className="py-3 rounded-2xl bg-white/10 font-semibold border border-white/15 flex items-center justify-center gap-2 cursor-pointer">
                <ImageUp className="h-5 w-5" /> Tải ảnh lên
                <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { chooseFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
              </label>
            </>}
          </div>
          {file && !cameraOpen && <p className="truncate text-center text-xs text-white/70">Ảnh đã chọn: {file.name}</p>}
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
