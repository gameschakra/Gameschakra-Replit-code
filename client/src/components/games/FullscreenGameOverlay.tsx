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

  // Handle exit button click - only call onClose, no navigation
  const handleExit = () => {
    onClose?.();
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
    <div 
      className="gc-fs-overlay"
      onClick={() => onClose?.()}
    >
      <div className="game-shell game-shell--overlay" onClick={(e) => e.stopPropagation()}>
        {/* Top-right close button */}
        {showExitButton && (
          <button
            type="button"
            aria-label="Close game"
            className="gc-fs-close"
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          >
            ✕
          </button>
        )}
        
        {/* Game content */}
        {children}
      </div>
    </div>,
    document.body
  );
}