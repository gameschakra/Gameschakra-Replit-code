import React, { useState } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

// Simple test component to verify swipe gestures work
export const SwipeTest: React.FC = () => {
  const [swipeCount, setSwipeCount] = useState({ left: 0, right: 0 });

  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeLeft: () => setSwipeCount(prev => ({ ...prev, left: prev.left + 1 })),
    onSwipeRight: () => setSwipeCount(prev => ({ ...prev, right: prev.right + 1 })),
    threshold: 50,
    preventDefaultTouchmove: true
  });

  return (
    <div 
      ref={swipeRef}
      className="md:hidden bg-gray-800 border border-gray-600 rounded-lg p-4 m-4 text-center text-white"
    >
      <h3 className="text-lg font-bold mb-2">Swipe Test (Mobile Only)</h3>
      <p className="text-sm text-gray-300 mb-4">Swipe left or right on this box</p>
      <div className="flex justify-center space-x-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">{swipeCount.left}</div>
          <div className="text-xs">Left Swipes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-500">{swipeCount.right}</div>
          <div className="text-xs">Right Swipes</div>
        </div>
      </div>
    </div>
  );
};

export default SwipeTest;