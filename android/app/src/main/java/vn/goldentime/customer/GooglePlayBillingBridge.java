package vn.goldentime.customer;

import android.app.Activity;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class GooglePlayBillingBridge implements PurchasesUpdatedListener {
    private static final String MONTHLY_PRODUCT = "golden_time_premium_30d";
    private static final String ANNUAL_PRODUCT = "golden_time_premium_365d";

    private final Activity activity;
    private final WebView webView;
    private final BillingClient billingClient;
    private final Map<String, ProductDetails> productDetailsById = new HashMap<>();
    private final List<Runnable> waitingForConnection = new ArrayList<>();
    private boolean connecting;

    public GooglePlayBillingBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
    }

    public void handleMessage(String rawMessage) {
        try {
            JSONObject message = new JSONObject(rawMessage);
            String action = message.optString("action");
            if ("queryProducts".equals(action)) queryProducts();
            else if ("restorePurchases".equals(action)) restorePurchases();
            else if ("startPurchase".equals(action)) {
                startPurchase(message.optString("productId"), message.optLong("accountId", -1));
            } else {
                emitError("Yêu cầu Google Play Billing không hợp lệ.");
            }
        } catch (JSONException exception) {
            emitError("Không đọc được yêu cầu Google Play Billing.");
        }
    }

    private void queryProducts() {
        connectThen(() -> {
            List<QueryProductDetailsParams.Product> requestedProducts = Arrays.asList(
                    QueryProductDetailsParams.Product.newBuilder().setProductId(MONTHLY_PRODUCT)
                            .setProductType(BillingClient.ProductType.INAPP).build(),
                    QueryProductDetailsParams.Product.newBuilder().setProductId(ANNUAL_PRODUCT)
                            .setProductType(BillingClient.ProductType.INAPP).build());
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                    .setProductList(requestedProducts).build();
            billingClient.queryProductDetailsAsync(params, (result, productResult) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || productResult == null) {
                    emitError("Không tải được giá Premium từ Google Play.");
                    return;
                }
                productDetailsById.clear();
                JSONArray products = new JSONArray();
                for (ProductDetails details : productResult.getProductDetailsList()) {
                    List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
                    if (offers == null || offers.isEmpty()) continue;
                    productDetailsById.put(details.getProductId(), details);
                    JSONObject product = object("productId", details.getProductId(),
                            "formattedPrice", offers.get(0).getFormattedPrice());
                    products.put(product);
                }
                JSONObject payload = object("products", products);
                emit("goldentime:billing-products", payload);
            });
        });
    }

    private void startPurchase(String productId, long accountId) {
        if (!MONTHLY_PRODUCT.equals(productId) && !ANNUAL_PRODUCT.equals(productId)) {
            emitError("Gói Premium được chọn không hợp lệ.");
            return;
        }
        if (accountId <= 0) {
            emitError("Vui lòng đăng nhập tài khoản Golden Time trước khi mua Premium.");
            return;
        }
        connectThen(() -> {
            ProductDetails details = productDetailsById.get(productId);
            if (details == null || details.getOneTimePurchaseOfferDetailsList() == null
                    || details.getOneTimePurchaseOfferDetailsList().isEmpty()) {
                queryProducts();
                emitError("Không tìm thấy gói này trên Google Play. Hãy thử tải lại trang cá nhân.");
                return;
            }
            String accountHash;
            try {
                accountHash = obfuscatedAccountId(accountId);
            } catch (Exception exception) {
                emitError("Không thể bảo vệ thông tin tài khoản khi mở Google Play.");
                return;
            }
            ProductDetails.OneTimePurchaseOfferDetails offer = details.getOneTimePurchaseOfferDetailsList().get(0);
            BillingFlowParams.ProductDetailsParams productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details).setOfferToken(offer.getOfferToken()).build();
            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Arrays.asList(productParams))
                    .setObfuscatedAccountId(accountHash)
                    .build();
            BillingResult result = billingClient.launchBillingFlow(activity, flowParams);
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                emitError("Không mở được cửa sổ thanh toán Google Play. Vui lòng thử lại.");
            }
        });
    }

    private void restorePurchases() {
        connectThen(() -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.INAPP).build();
            billingClient.queryPurchasesAsync(params, (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    emitError("Không kiểm tra được giao dịch Google Play trước đây.");
                    return;
                }
                for (Purchase purchase : purchases) dispatchPurchase(purchase);
            });
        });
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) dispatchPurchase(purchase);
        } else if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            emitError("Bạn đã hủy giao dịch Google Play.");
        } else {
            emitError("Google Play chưa hoàn tất giao dịch. Vui lòng thử lại.");
        }
    }

    private void dispatchPurchase(Purchase purchase) {
        if (purchase.getProducts().isEmpty()) return;
        String productId = purchase.getProducts().get(0);
        if (!MONTHLY_PRODUCT.equals(productId) && !ANNUAL_PRODUCT.equals(productId)) return;
        JSONObject payload = object("productId", productId, "purchaseToken", purchase.getPurchaseToken(),
                "purchaseState", purchase.getPurchaseState());
        emit("goldentime:billing-purchase", payload);
    }

    private String obfuscatedAccountId(long accountId) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(("goldentime-user:" + accountId).getBytes(StandardCharsets.UTF_8));
        return Base64.encodeToString(digest, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    private void connectThen(Runnable action) {
        if (billingClient.isReady()) {
            action.run();
            return;
        }
        waitingForConnection.add(action);
        if (connecting) return;
        connecting = true;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                connecting = false;
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    waitingForConnection.clear();
                    emitError("Không kết nối được Google Play Billing trên thiết bị này.");
                    return;
                }
                List<Runnable> actions = new ArrayList<>(waitingForConnection);
                waitingForConnection.clear();
                for (Runnable queuedAction : actions) queuedAction.run();
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Billing Library 8+ reconnects automatically when the next operation is made.
            }
        });
    }

    private void emitError(String message) {
        emit("goldentime:billing-error", object("message", message));
    }

    private JSONObject object(Object... values) {
        JSONObject result = new JSONObject();
        try {
            for (int index = 0; index + 1 < values.length; index += 2) result.put(String.valueOf(values[index]), values[index + 1]);
        } catch (JSONException ignored) {
            // Keep the message best-effort; values here are primitive JSON fields.
        }
        return result;
    }

    private void emit(String eventName, JSONObject detail) {
        activity.runOnUiThread(() -> {
            if (webView == null || !webView.isAttachedToWindow()) return;
            String script = "window.dispatchEvent(new CustomEvent(" + JSONObject.quote(eventName)
                    + ",{detail:" + detail + "}));";
            webView.evaluateJavascript(script, null);
        });
    }

    public void endConnection() {
        billingClient.endConnection();
        waitingForConnection.clear();
    }
}
