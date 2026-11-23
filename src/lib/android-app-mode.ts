import { useEffect, useState } from "react";

const ANDROID_APP_SESSION_KEY = "golden-time-platform";

export function isAndroidAppMode() {
  if (typeof window === "undefined") return false;

  const isAndroidEntry = new URLSearchParams(window.location.search).get("platform") === "android";
  if (isAndroidEntry) window.sessionStorage.setItem(ANDROID_APP_SESSION_KEY, "android");

  return isAndroidEntry || window.sessionStorage.getItem(ANDROID_APP_SESSION_KEY) === "android";
}

export function useAndroidAppMode() {
  const [mode, setMode] = useState({ ready: false, isAndroidApp: false });

  useEffect(() => {
    setMode({ ready: true, isAndroidApp: isAndroidAppMode() });
  }, []);

  return mode;
}
