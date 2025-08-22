import { useRef, useEffect, RefObject } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  options: SwipeGestureOptions = {}
): RefObject<T> {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    preventDefaultTouchmove = false
  } = options;

  const ref = useRef<T>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isDragging: true
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchState.current.isDragging) return;

      const touch = e.touches[0];
      touchState.current.currentX = touch.clientX;
      touchState.current.currentY = touch.clientY;

      // Prevent default if we're swiping horizontally to avoid scrolling
      if (preventDefaultTouchmove) {
        const deltaX = Math.abs(touch.clientX - touchState.current.startX);
        const deltaY = Math.abs(touch.clientY - touchState.current.startY);
        
        if (deltaX > deltaY) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!touchState.current.isDragging) return;

      const deltaX = touchState.current.currentX - touchState.current.startX;
      const deltaY = touchState.current.currentY - touchState.current.startY;
      
      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      touchState.current.isDragging = false;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmove });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, preventDefaultTouchmove]);

  return ref;
}

export default useSwipeGesture;