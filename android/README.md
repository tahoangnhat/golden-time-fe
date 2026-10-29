# Golden Time Android app

This Android Studio project opens the existing Customer app at `https://www.goldentime.id.vn/app/login`. It keeps the current customer pages and backend behavior in one mobile app instead of maintaining a second copy of the UI.

The app needs an internet connection. Camera permission is requested when the AI scan opens the camera; location permission is requested when the nearby-store map needs the phone's location. Android's system status and navigation bars are used in place of the browser-style status row.

## Run it in Android Studio

1. Open this `android` folder in Android Studio.
2. Let Gradle sync, then select the `app` run configuration and a phone or emulator such as Pixel 9.
3. Press **Run**. Android Studio installs the app and opens the customer login screen.

For a local debug APK, use **Build > Build APK(s)**. Android Studio writes it to `app/build/outputs/apk/debug/app-debug.apk`. A public Play Store release needs a signed build.
