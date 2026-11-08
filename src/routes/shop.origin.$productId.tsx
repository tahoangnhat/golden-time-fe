import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Clock3, MapPin, PackageCheck, Sprout, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { api, formatDate, type Product } from "@/lib/api";

export const Route = createFileRoute("/shop/origin/$productId")({
  head: () => ({ meta: [{ title: "Nguồn gốc sản phẩm — Golden Time" }] }),
  component: ProductOrigin,
});

function getTransportDays(orderDate?: string | null, estimatedDate?: string | null) {
  if (!orderDate || !estimatedDate) return null;
  const dayMs = 86_400_000;
  return Math.round((Date.parse(estimatedDate + "T00:00:00Z") - Date.parse(orderDate + "T00:00:00Z")) / dayMs);
}

function ProductOrigin() {
  const { productId: rawProductId } = Route.useParams();
  const productId = Number(rawProductId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.product(productId)
      .then((result) => { if (active) setProduct(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được thông tin nguồn gốc."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  const coverImage = product?.imageUrls?.[0] || product?.imageUrl;
  const transitDays = getTransportDays(product?.orderDate, product?.transportDate);
  const milestones = product ? [
    product.orderDate ? { title: "Ngày đặt hàng", date: product.orderDate, note: "Ngày cửa hàng đặt lô trái cây từ nhà cung cấp.", icon: Store } : undefined,
    product.transportDate ? { title: "Dự kiến nhận hàng", date: product.transportDate, note: transitDays && transitDays > 0 ? "Thời gian vận chuyển ước tính: " + transitDays + " ngày." : "Ngày dự kiến do cửa hàng cung cấp.", icon: Clock3 } : undefined,
    product.receivedDate ? { title: "Ngày nhận thực tế", date: product.receivedDate, note: "Cửa hàng đã ghi nhận ngày nhận hàng.", icon: PackageCheck } : undefined,
  ].filter((item) => item !== undefined) : [];

  return (
    <PhoneShell>
      <StatusBar title="Nguồn gốc sản phẩm" />
      <div className="px-5 pb-7">
        <Link to="/shop/$productId" params={{ productId: String(productId) }} className="mb-4 inline-flex items-center gap-2 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Quay lại sản phẩm
        </Link>

        {loading ? <div className="grid h-64 place-items-center"><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Đang tải thông tin…</div></div>
          : error || !product ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Không tìm thấy sản phẩm."}</div>
            : <>
              <div className="relative h-56 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-100">
                {coverImage
                  ? <img src={coverImage} alt={product.displayName} className="h-full w-full object-cover" />
                  : <div className="grid h-full place-items-center text-8xl">{product.emoji}</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5" /> Hồ sơ nguồn gốc
                  </span>
                  <h1 className="mt-2 text-xl font-extrabold leading-tight">{product.displayName}</h1>
                  <p className="mt-1 text-xs text-white/85">{product.fruitName} · {product.shopName}</p>
                </div>
              </div>

              <section className="mt-4 rounded-3xl border border-emerald-100 bg-white p-4 gt-shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Sprout className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Nông trại cung cấp</p>
                    <h2 className="mt-1 text-base font-extrabold">{product.farmName || "Thông tin nông trại đang được cập nhật"}</h2>
                    {product.farmAddress && <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{product.farmAddress}</p>}
                  </div>
                </div>
              </section>

              <section className="mt-3 rounded-3xl border border-border bg-white p-4 gt-shadow-soft">
                <h2 className="text-sm font-extrabold">Hành trình sản phẩm</h2>
                {milestones.length > 0 ? <div className="mt-4 space-y-0">
                  {milestones.map(({ title, date, note, icon: Icon }, index) => (
                    <div key={title} className="flex gap-3">
                      <div className="flex w-9 shrink-0 flex-col items-center">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" /></span>
                        {index < milestones.length - 1 && <span className="my-1 min-h-8 w-px flex-1 bg-emerald-100" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold">{title}</h3>
                          <time className="shrink-0 text-xs font-bold text-emerald-800">{formatDate(date)}</time>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{note}</p>
                      </div>
                    </div>
                  ))}
                </div> : <p className="mt-3 rounded-xl bg-cream p-3 text-xs leading-relaxed text-muted-foreground">Cửa hàng chưa cập nhật mốc thời gian cho sản phẩm này.</p>}
              </section>

              <section className="mt-3 rounded-3xl border border-border bg-white p-4 gt-shadow-soft">
                <div className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /><h2 className="text-sm font-extrabold">Cửa hàng phân phối</h2></div>
                <p className="mt-3 text-sm font-bold">{product.shopName}</p>
                {product.shopAddress && <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{product.shopAddress}</p>}
              </section>

              <p className="mt-4 rounded-2xl bg-emerald-50/80 p-3 text-[11px] leading-relaxed text-emerald-900">
                Ngày dự kiến nhận được tính từ ngày cửa hàng đặt lô hàng và thời gian vận chuyển cửa hàng cung cấp. Thông tin nguồn gốc do cửa hàng khai báo.
              </p>
              <Link to="/shop/$productId" params={{ productId: String(product.id) }} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl gt-gradient py-3 text-sm font-bold text-white gt-shadow">
                Quay lại chi tiết sản phẩm
              </Link>
            </>}
      </div>
    </PhoneShell>
  );
}
