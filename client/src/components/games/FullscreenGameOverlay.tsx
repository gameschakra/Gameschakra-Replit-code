// GC_FIX: body-level overlay to guarantee mobile fullscreen coverage
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = { 
  children: React.ReactNode; 
  onClose?: () => void; 
};

export default function FullscreenGameOverlay({ children, onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="gc-fs-overlay">
      {children}
    </div>,
    document.body
  );
}