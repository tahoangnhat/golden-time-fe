package vn.goldentime.customer;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Gravity;
import android.view.WindowInsets;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import android.widget.FrameLayout;
import android.widget.ProgressBar;

import java.util.Locale;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://www.goldentime.id.vn/app/login?platform=android";
    private static final String TRUSTED_DOMAIN = "goldentime.id.vn";
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int CAMERA_PERMISSION_REQUEST = 1002;
    private static final int LOCATION_PERMISSION_REQUEST = 1003;
    private static final int CREAM = Color.rgb(249, 247, 237);

    private WebView webView;
    private ProgressBar loadingIndicator;
    private ValueCallback<Uri[]> fileChooserCallback;
    private PermissionRequest pendingCameraRequest;
    private GeolocationPermissions.Callback pendingLocationCallback;
    private String pendingLocationOrigin;
    private OnBackInvokedCallback backInvokedCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(CREAM);
        getWindow().setNavigationBarColor(CREAM);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                        | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0));

        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(CREAM);
        webView = new WebView(this);
        webView.setBackgroundColor(CREAM);
        container.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        loadingIndicator = new ProgressBar(this);
        int indicatorSize = (int) (48 * getResources().getDisplayMetrics().density);
        FrameLayout.LayoutParams indicatorParams = new FrameLayout.LayoutParams(
                indicatorSize, indicatorSize, Gravity.CENTER);
        container.addView(loadingIndicator, indicatorParams);
        applySystemBarInsets(container);
        setContentView(container);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            backInvokedCallback = this::handleBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, backInvokedCallback);
        }

        configureWebView();
        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void applySystemBarInsets(FrameLayout container) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            container.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        } else {
            container.setOnApplyWindowInsetsListener((view, insets) -> {
                view.setPadding(insets.getSystemWindowInsetLeft(),
                        insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(),
                        insets.getSystemWindowInsetBottom());
                return insets;
            });
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openExternalScheme(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternalScheme(Uri.parse(url));
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOfflinePage();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (loadingIndicator != null) loadingIndicator.setVisibility(View.GONE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int progress) {
                if (loadingIndicator != null) {
                    loadingIndicator.setVisibility(progress >= 100 ? View.GONE : View.VISIBLE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                fileChooserCallback = callback;
                try {
                    Intent chooser = Intent.createChooser(params.createIntent(), "Chọn ảnh");
                    startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception ignored) {
                    fileChooserCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> requestCameraPermissionIfNeeded(request));
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingCameraRequest == request) pendingCameraRequest = null;
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                                                            GeolocationPermissions.Callback callback) {
                runOnUiThread(() -> requestLocationPermissionIfNeeded(origin, callback));
            }
        });
    }

    private boolean openExternalScheme(Uri uri) {
        String scheme = uri.getScheme();
        if (scheme == null || scheme.equalsIgnoreCase("https")
                || scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("about")) {
            return false;
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception ignored) {
            // Unsupported links should not close the app or interrupt the page.
        }
        return true;
    }

    private void requestCameraPermissionIfNeeded(PermissionRequest request) {
        if (!isTrustedOrigin(request.getOrigin().toString())) {
            request.deny();
            return;
        }
        boolean asksForVideo = false;
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) asksForVideo = true;
            else {
                request.deny();
                return;
            }
        }
        if (!asksForVideo) {
            request.deny();
        } else if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else {
            pendingCameraRequest = request;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
        }
    }

    private void requestLocationPermissionIfNeeded(String origin,
                                                  GeolocationPermissions.Callback callback) {
        if (!isTrustedOrigin(origin)) {
            callback.invoke(origin, false, false);
            return;
        }
        if (hasLocationPermission()) {
            callback.invoke(origin, true, false);
        } else {
            pendingLocationOrigin = origin;
            pendingLocationCallback = callback;
            requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST);
        }
    }

    private boolean hasLocationPermission() {
        return checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
    }

    private boolean isTrustedOrigin(String origin) {
        Uri uri = Uri.parse(origin);
        String host = uri.getHost();
        if (!"https".equalsIgnoreCase(uri.getScheme()) || host == null) return false;
        host = host.toLowerCase(Locale.ROOT);
        return host.equals(TRUSTED_DOMAIN) || host.endsWith("." + TRUSTED_DOMAIN);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST && pendingCameraRequest != null) {
            PermissionRequest request = pendingCameraRequest;
            pendingCameraRequest = null;
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
            } else {
                request.deny();
            }
        } else if (requestCode == LOCATION_PERMISSION_REQUEST && pendingLocationCallback != null) {
            pendingLocationCallback.invoke(pendingLocationOrigin, hasLocationPermission(), false);
            pendingLocationCallback = null;
            pendingLocationOrigin = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileChooserCallback != null) {
            Uri[] result = resultCode == RESULT_OK && data != null
                    ? WebChromeClient.FileChooserParams.parseResult(resultCode, data) : null;
            fileChooserCallback.onReceiveValue(result);
            fileChooserCallback = null;
        }
    }

    private void showOfflinePage() {
        String html = "<!doctype html><html><meta name='viewport' content='width=device-width,initial-scale=1'>"
                + "<body style='font:16px sans-serif;background:#f9f7ed;color:#253b2d;display:grid;"
                + "place-items:center;min-height:90vh;margin:24px;text-align:center'><main>"
                + "<h2>Không thể kết nối Golden Time</h2><p>Hãy kiểm tra kết nối internet rồi thử lại.</p>"
                + "<a style='color:#32834d;font-weight:bold' href='" + APP_URL + "'>Thử lại</a>"
                + "</main></body></html>";
        webView.loadDataWithBaseURL("https://www.goldentime.id.vn/", html,
                "text/html", "UTF-8", null);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    private void handleBack() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finish();
    }

    @Override
    protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && backInvokedCallback != null) {
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backInvokedCallback);
        }
        if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
        if (pendingCameraRequest != null) pendingCameraRequest.deny();
        if (pendingLocationCallback != null) {
            pendingLocationCallback.invoke(pendingLocationOrigin, false, false);
        }
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
