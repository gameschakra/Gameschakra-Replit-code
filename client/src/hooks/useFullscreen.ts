// GC_FIX(fullscreen): stronger native FS detection + fallback
import { useCallback, useEffect, useRef, useState } from "react";

type FullscreenAPI = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

const getFsElement = () =>
  (document as any).fullscreenElement ||
  (document as any).webkitFullscreenElement ||
  (document as any).mozFullScreenElement ||
  (document as any).msFullscreenElement ||
  null;

const exitNative = async () => {
  const d: any = document;
  const fn =
    d.exitFullscreen ||
    d.webkitExitFullscreen ||
    d.mozCancelFullScreen ||
    d.msExitFullscreen;
  if (fn) {
    try { await fn.call(d); } catch {}
  }
};

export function useFullscreen(targetRef: React.RefObject<HTMLElement>) {
  const [isFs, setIsFs] = useState(false);
  const [cssFs, setCssFs] = useState(false);
  const intentRef = useRef<"native" | "css" | null>(null);

  const tryNative = useCallback(async () => {
    const el = targetRef.current as FullscreenAPI | null;
    if (!el) return false;

    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (!req) return false;

    try {
      const maybePromise = req.call(el);
      if (maybePromise && typeof (maybePromise as any).then === "function") {
        await (maybePromise as Promise<void>);
      }
    } catch {
      return false;
    }

    // wait a tick to let browser set fullscreenElement
    await new Promise(r => setTimeout(r, 0));
    const fe = getFsElement();

    // ✅ accept only if our target is fullscreen
    if (fe === el) return true;

    // ❌ if browser fullscreened <html>/<body> or something else, treat as fail
    return false;
  }, [targetRef]);

  const enterFs = useCallback(async () => {
    // 1) try native on the container ONLY
    const ok = await tryNative();

    if (ok) {
      intentRef.current = "native";
      setIsFs(true);
      return;
    }

    // 2) fallback to CSS portal fullscreen
    intentRef.current = "css";
    document.documentElement.classList.add("gc-fs-root");
    document.body.classList.add("gc-no-scroll");
    setCssFs(true);
    setIsFs(true);

    // optional orientation lock (best-effort)
    try { (screen.orientation as any)?.lock?.("landscape"); } catch {}
  }, [tryNative]);

  const exitFs = useCallback(async () => {
    // cleanup portal classes
    document.documentElement.classList.remove("gc-fs-root");
    document.body.classList.remove("gc-no-scroll");
    setCssFs(false);

    // if native is actually active, exit it
    if (getFsElement()) {
      await exitNative();
    }
    setIsFs(false);
    intentRef.current = null;
  }, []);

  useEffect(() => {
    const onChange = () => {
      const fe = getFsElement();
      // Native ended externally (Android back / ESC)
      if (!fe && intentRef.current === "native") {
        // ensure cleanup parity
        document.documentElement.classList.remove("gc-fs-root");
        document.body.classList.remove("gc-no-scroll");
        setCssFs(false);
        setIsFs(false);
        intentRef.current = null;
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange as any);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange as any);
    };
  }, []);

  return { isFs, cssFs, enterFs, exitFs };
}