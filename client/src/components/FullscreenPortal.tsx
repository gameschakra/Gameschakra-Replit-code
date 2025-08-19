// GC_FIX(fullscreen): portal wrapper for CSS fallback
import { createPortal } from "react-dom";
import React from "react";

export default function FullscreenPortal({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return createPortal(
    <div className="gc-fs-portal">{children}</div>,
    document.body
  );
}