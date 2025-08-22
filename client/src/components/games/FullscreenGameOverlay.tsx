// GC_UX: Enhanced fullscreen overlay with UX improvements
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { useSwipeBackGuard } from "@/hooks/useSwipeBackGuard";

type Props = { 
  children: React.ReactNode; 
  onClose?: () => void;
  showExitButton?: boolean;
};

export default function FullscreenGameOverlay({ 
  children, 
  onClose, 
  showExitButton = true
}: Props) {
  const [, navigate] = useLocation();
  
  // Activate swipe-back guard when in fullscreen
  useSwipeBackGuard(true);

  // Handle exit button click
  const handleExit = () => {
    onClose?.();
    navigate(-1); // Go back to previous route
  };

  // Setup fullscreen overlay effects
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleExit();
    };
    
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div className="gc-fs-overlay">
      {/* Exit button overlay */}
      {showExitButton && (
        <button
          onClick={handleExit}
          className="gc-fs-exit-btn"
          aria-label="Exit fullscreen"
          title="Exit fullscreen (ESC)"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      )}


      {/* Game content */}
      {children}
    </div>,
    document.body
  );
}