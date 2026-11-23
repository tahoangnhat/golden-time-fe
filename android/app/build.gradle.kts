plugins {
    id("com.android.application")
}

android {
    namespace = "vn.goldentime.customer"
    compileSdk = 37

    defaultConfig {
        applicationId = "vn.goldentime.customer"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }
}

dependencies {
    implementation("com.android.billingclient:billing:9.1.0")
    implementation("androidx.webkit:webkit:1.14.0")
}
