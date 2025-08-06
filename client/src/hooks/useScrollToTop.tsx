import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * This hook scrolls the window to the top whenever the location changes
 */
export function useScrollToTop(): void {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);
}