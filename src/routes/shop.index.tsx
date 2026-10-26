import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, MapPin, Plus, ShoppingCart, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { ProductThumb } from "@/components/FruitThumb";
import { api, getCurrentLocation, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/shop/")({
  head: () => ({ meta: [{ title: "Mua trái cây — Golden Time" }] }),
  component: Shop,
});

const SHOP_CATEGORIES = [
  { value: "ALL", label: "Tất cả trái cây", english: "All Fruits", description: "Hiển thị toàn bộ sản phẩm đang bán." },
  { value: "LOCAL", label: "Trái cây Việt Nam", english: "Local Fruits", description: "Xoài, chuối, thanh long, sầu riêng, nhãn, vải…" },
  { value: "IMPORTED", label: "Trái cây nhập khẩu", english: "Imported Fruits", description: "Táo Mỹ, nho Úc, kiwi New Zealand, cherry Chile…" },
  { value: "SEASONAL", label: "Trái cây theo mùa", english: "Seasonal Fruits", description: "Các loại trái cây đang vào mùa, thay đổi theo thời điểm." },
  { value: "PREPARED", label: "Trái cây sơ chế", english: "Prepared Fruits", description: "Trái cây đã được sơ chế, sẵn sàng sử dụng." },
];

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [near, setNear] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cart = useCart();
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setSearch(initial);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.products({ q: search || undefined, lat: near ? location?.lat : undefined, lng: near ? location?.lng : undefined, radiusKm: 10 })
        .then((result) => { setProducts(result); setError(""); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm."))
        .finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, near, location]);
  const selectedCategory = SHOP_CATEGORIES.find((item) => item.value === category) ?? SHOP_CATEGORIES[0];
  const visible = useMemo(() => products.filter((product) => {
    if (category === "ALL") return true;
    if (category === "SEASONAL") return product.seasonal;
    if (category === "PREPARED") return product.prepared;
    const origin = (product.category ?? "").toLocaleLowerCase("vi");
    return category === "LOCAL"
      ? origin.includes("nội địa") || origin.includes("việt nam") || origin.includes("local")
      : origin.includes("nhập khẩu") || origin.includes("import");
  }), [category, products]);
  function add(product: Product) {
    if (!cart.add(product)) return toast.error("Giỏ hàng chỉ nhận sản phẩm từ một cửa hàng. Hãy xóa giỏ hàng trước khi đổi cửa hàng.");
    toast.success(`${product.displayName} đã được thêm vào giỏ.`);
  }
  async function toggleNear() {
    if (near) { setNear(false); return; }
    try { setError(""); setLocation(await getCurrentLocation()); setNear(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không lấy được vị trí."); }
  }
  return (
    <PhoneShell>
      <StatusBar title="Mua trái cây" right={<Link to="/cart" aria-label="Giỏ hàng" className="relative"><ShoppingCart className="h-4 w-4" />{cart.items.length > 0 && <span className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full bg-primary text-white text-[9px] grid place-items-center px-1">{cart.items.length}</span>}</Link>} />
      <div className="px-5">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 gt-shadow-soft border border-border"><Search className="h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm..." className="flex-1 bg-transparent outline-none text-sm" /></div>
        <div className="mt-3 flex items-center justify-between gap-2"><div className="flex min-w-0 gap-2 overflow-x-auto pb-1">{SHOP_CATEGORIES.map((item) => <button key={item.value} aria-pressed={category === item.value} onClick={() => setCategory(item.value)} className={`shrink-0 rounded-xl px-3 py-2 text-left ${category === item.value ? "gt-gradient text-white" : "border border-border bg-white"}`}><span className="block whitespace-nowrap text-[11px] font-semibold">{item.label}</span><span className={`mt-0.5 block whitespace-nowrap text-[9px] ${category === item.value ? "text-white/80" : "text-muted-foreground"}`}>{item.english}</span></button>)}</div><button onClick={toggleNear} className={`shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border ${near ? "bg-primary text-white border-primary" : "bg-white border-border"}`}>{near ? "Gần tôi: bật" : "Gần tôi"}</button></div>
        <p className="mt-1 text-[10px] text-muted-foreground">{selectedCategory.description}</p>
        {loading ? <div className="py-16 grid place-items-center"><LoaderCircle className="animate-spin text-primary" /></div> : error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : visible.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Chưa có sản phẩm phù hợp.</div> :
          <div className="mt-4 grid grid-cols-2 gap-3">{visible.map((product) => <div key={product.id} className="bg-white rounded-2xl p-3 gt-shadow-soft border border-border flex flex-col">
            <div className="relative"><ProductThumb emoji={product.emoji} imageUrl={product.imageUrl} alt={product.displayName} size="lg" className="!h-28 !w-full !rounded-2xl !text-6xl" />{product.aiScore != null && <span className="absolute top-2 left-2 text-[10px] bg-white/95 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-primary fill-primary" /> {product.aiScore}</span>}</div>
            <h4 className="font-bold text-sm mt-2 truncate">{product.displayName}</h4><p className="text-[10px] text-muted-foreground truncate">{product.shopName}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5"><MapPin className="h-2.5 w-2.5" />{product.distanceKm == null ? "Vị trí cửa hàng" : `${product.distanceKm.toFixed(1)} km`}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Còn {Number(product.stockKg).toLocaleString("vi-VN")} kg</p>
            <div className="mt-2 flex items-center justify-between gap-2"><p className="text-sm font-extrabold text-primary leading-none">{product.pricePerKg.toLocaleString("vi-VN")}đ<span className="block text-[9px] text-muted-foreground font-medium mt-1">/kg</span></p><button onClick={() => add(product)} aria-label={`Thêm ${product.displayName}`} className="h-8 w-8 grid place-items-center rounded-full gt-gradient text-white gt-shadow"><Plus className="h-4 w-4" /></button></div>
          </div>)}</div>}
        <div className="h-28" />
      </div>
      {cart.items.length > 0 && <div className="absolute bottom-24 inset-x-4 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between gt-shadow"><div><p className="text-[11px] opacity-70">{cart.items.length} sản phẩm • {cart.items[0].shopName}</p><p className="font-extrabold">Tạm tính: {cart.subtotal.toLocaleString("vi-VN")}đ</p></div><Link to="/cart" className="bg-white text-foreground font-semibold px-4 py-2 rounded-xl text-sm">Thanh toán</Link></div>}
    </PhoneShell>
  );
}
