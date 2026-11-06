import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Ticket, Tag, Store, Check, LoaderCircle, Calendar, Sparkles } from "lucide-react";
import { PhoneShell, StatusBar } from "@/components/PhoneShell";
import { api, hasAuth, type BuyerVoucherView, type VoucherResponse } from "@/lib/api";

export const Route = createFileRoute("/vouchers")({
  head: () => ({ meta: [{ title: "Ví Voucher & Khuyến mãi — Golden Time" }] }),
  component: VouchersPage,
});

function VouchersPage() {
  const [tab, setTab] = useState<"wallet" | "discover">("wallet");
  const [walletFilter, setWalletFilter] = useState<string>("ALL");
  const [myVouchers, setMyVouchers] = useState<BuyerVoucherView[]>([]);
  const [discoverVouchers, setDiscoverVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string>("");
  const [claimErrorMessage, setClaimErrorMessage] = useState<string>("");

  const refreshData = () => {
    if (!hasAuth()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.buyerMyVouchers(walletFilter),
      api.buyerDiscoverVouchers(),
    ])
      .then(([walletItems, discoverItems]) => {
        setMyVouchers(walletItems);
        setDiscoverVouchers(discoverItems);
      })
      .catch(() => {
        // error handling
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, [walletFilter]);

  async function handleClaim(voucherId: number) {
    if (!hasAuth()) {
      setClaimErrorMessage("Vui lòng đăng nhập để lưu voucher.");
      return;
    }
    setClaimingId(voucherId);
    setClaimErrorMessage("");
    setClaimSuccessMessage("");
    try {
      await api.buyerClaimVoucher(voucherId);
      setClaimSuccessMessage("Đã lưu voucher vào ví của bạn thành công!");
      refreshData();
    } catch (cause) {
      setClaimErrorMessage(cause instanceof Error ? cause.message : "Không thể nhận voucher.");
    } finally {
      setClaimingId(null);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Khả dụng</span>;
      case "RESERVED":
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Đang giữ chỗ</span>;
      case "USED":
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">Đã sử dụng</span>;
      case "EXPIRED":
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-bold">Hết hạn</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <PhoneShell>
      <StatusBar title="Ví Voucher & Khuyến mãi" />
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4" /> Cá nhân
          </Link>
          <div className="flex items-center gap-1 bg-cream rounded-2xl p-1 border border-border">
            <button
              type="button"
              onClick={() => setTab("wallet")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === "wallet" ? "bg-white text-primary gt-shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ví của tôi
            </button>
            <button
              type="button"
              onClick={() => setTab("discover")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === "discover" ? "bg-white text-primary gt-shadow-soft" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Khám phá mã
            </button>
          </div>
        </div>

        {claimSuccessMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            {claimSuccessMessage}
          </div>
        )}
        {claimErrorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {claimErrorMessage}
          </div>
        )}

        {tab === "wallet" ? (
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "AVAILABLE", label: "Khả dụng" },
                { key: "USED", label: "Đã dùng" },
                { key: "EXPIRED", label: "Hết hạn" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setWalletFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    walletFilter === f.key
                      ? "gt-gradient text-white shadow-sm"
                      : "bg-white border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải ví voucher…
              </div>
            ) : myVouchers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-border text-center space-y-3 gt-shadow-soft">
                <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <h4 className="font-extrabold text-sm text-foreground">Chưa có voucher nào</h4>
                <p className="text-xs text-muted-foreground">
                  {walletFilter === "AVAILABLE"
                    ? "Bạn chưa có voucher khả dụng. Hãy khám phá và lưu voucher từ các cửa hàng!"
                    : "Không tìm thấy voucher phù hợp với bộ lọc."}
                </p>
                <button
                  type="button"
                  onClick={() => setTab("discover")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gt-gradient text-white text-xs font-bold shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Khám phá voucher ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myVouchers.map((v) => (
                  <div
                    key={v.buyerVoucherId}
                    className="bg-white rounded-2xl p-4 border border-border gt-shadow-soft relative overflow-hidden space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
                            {v.code}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Store className="h-3 w-3" /> {v.shopName}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-foreground mt-1.5">{v.name}</h4>
                        {v.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{v.description}</p>}
                      </div>
                      <div className="shrink-0">{statusBadge(v.status)}</div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-primary">
                          {v.discountType === "PERCENT"
                            ? `Giảm ${v.discountValue}% (tối đa ${v.maxDiscountAmount ? v.maxDiscountAmount.toLocaleString("vi-VN") + "đ" : "không giới hạn"})`
                            : `Giảm ${v.discountValue.toLocaleString("vi-VN")}đ`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Đơn tối thiểu {v.minOrderValue.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      {v.status === "AVAILABLE" && (
                        <Link
                          to="/shop"
                          className="px-3 py-1.5 rounded-xl gt-gradient text-white text-xs font-bold shadow-sm hover:opacity-90"
                        >
                          Dùng ngay
                        </Link>
                      )}
                    </div>

                    {v.validUntil && (
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Hạn dùng: {new Date(v.validUntil).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <h3 className="font-extrabold text-sm">Voucher có thể nhận</h3>
              <p className="text-xs text-muted-foreground">Lưu vào ví để tự động áp dụng khi mua hàng từ cửa hàng.</p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Đang tìm voucher mới…
              </div>
            ) : discoverVouchers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-border text-center space-y-3 gt-shadow-soft">
                <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <h4 className="font-extrabold text-sm text-foreground">Hiện chưa có voucher phát hành mới</h4>
                <p className="text-xs text-muted-foreground">Các cửa hàng sẽ sớm tung ra mã giảm giá cho mùa trái cây sắp tới.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discoverVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-2xl p-4 border border-border gt-shadow-soft space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
                            {v.code}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Store className="h-3 w-3" /> {v.shopName}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-foreground mt-1.5">{v.name}</h4>
                        {v.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{v.description}</p>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-border flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-primary">
                          {v.discountType === "PERCENT"
                            ? `Giảm ${v.discountValue}% (tối đa ${v.maxDiscountAmount ? v.maxDiscountAmount.toLocaleString("vi-VN") + "đ" : "không giới hạn"})`
                            : `Giảm ${v.discountValue.toLocaleString("vi-VN")}đ`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Đơn tối thiểu {v.minOrderValue.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={claimingId === v.id || v.claimedCount >= v.totalQuantity}
                        onClick={() => handleClaim(v.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                      >
                        {claimingId === v.id ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {v.claimedCount >= v.totalQuantity ? "Hết lượt" : "Lưu mã"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Hết hạn: {new Date(v.validUntil).toLocaleDateString("vi-VN")}
                      </span>
                      <span>Đã nhận: {v.claimedCount}/{v.totalQuantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
