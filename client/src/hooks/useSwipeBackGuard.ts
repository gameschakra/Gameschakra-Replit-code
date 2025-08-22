import { useEffect } from 'react';

/**
 * GC_UX: Custom hook to prevent accidental swipe-back navigation in fullscreen mode
 * This is particularly useful on mobile browsers where users might accidentally swipe back
 * while playing games in fullscreen mode.
 */
export function useSwipeBackGuard(isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    let touchStart: { x: number; y: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart || e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStart.x;
      const deltaY = currentY - touchStart.y;

      // Detect horizontal swipe from left edge (common back gesture)
      const isFromLeftEdge = touchStart.x < 50;
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const isRightwardSwipe = deltaX > 50;

      // Also detect swipe from right edge (for RTL languages or some browsers)
      const isFromRightEdge = touchStart.x > window.innerWidth - 50;
      const isLeftwardSwipe = deltaX < -50;

      if ((isFromLeftEdge && isHorizontalSwipe && isRightwardSwipe) ||
          (isFromRightEdge && isHorizontalSwipe && isLeftwardSwipe)) {
        // Prevent the default back navigation
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleTouchEnd = () => {
      touchStart = null;
    };

    // Also prevent history back on specific key combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Alt+Left Arrow (common back shortcut)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
      }
      // Prevent Backspace navigation (in some browsers)
      if (e.key === 'Backspace' && !(e.target as HTMLElement)?.isContentEditable) {
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        if (!['input', 'textarea'].includes(tagName)) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
}