import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AdBlocker Detection Component
 * 
 * Detects if an ad blocker is active and shows a notification to the user
 * Uses multiple detection methods for improved reliability:
 * 1. DOM method - checks if ad-related elements have been removed/modified
 * 2. Script loading method - checks if AdSense scripts were blocked
 */
const AdBlockDetector = () => {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);
  
  useEffect(() => {
    // Wait for page to fully load
    const detectAdBlocker = () => {
      // Check if the ad blocker detector element exists and was modified/hidden
      const detector = document.getElementById('ad-blocker-detector');
      
      if (!detector || 
          detector.offsetHeight === 0 ||
          detector.style.display === 'none' ||
          detector.style.visibility === 'hidden') {
        setAdBlockDetected(true);
        return;
      }
      
      // Check if ad elements inside were removed
      const adElement = detector.querySelector('.adsbygoogle');
      if (!adElement) {
        setAdBlockDetected(true);
        return;
      }
      
      // Check if AdSense script was loaded properly
      const adSenseLoaded = !!(window.adsbygoogle && window.adsbygoogle.loaded);
      if (!adSenseLoaded) {
        // Delay check to allow script to load
        setTimeout(() => {
          const adSenseLoadedDelayed = !!(window.adsbygoogle && window.adsbygoogle.loaded);
          if (!adSenseLoadedDelayed) {
            setAdBlockDetected(true);
          }
        }, 2000);
      }
    };
    
    // Load from session storage to maintain state across page loads
    const savedState = sessionStorage.getItem('adBlockAlertDismissed');
    if (savedState === 'true') {
      setAlertDismissed(true);
    }
    
    // Set a timeout to allow the page to fully load
    const timeoutId = setTimeout(detectAdBlocker, 1500);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Don't show anything if no ad blocker detected or alert was dismissed
  if (!adBlockDetected || alertDismissed) {
    return null;
  }
  
  const handleDismiss = () => {
    setAlertDismissed(true);
    sessionStorage.setItem('adBlockAlertDismissed', 'true');
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="flex flex-col gap-2 bg-background border-2">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <AlertTitle className="text-lg font-semibold">AdBlocker Detected</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              We've detected that you're using an ad blocker. Ads help support our free games and content. 
              Please consider disabling your ad blocker or adding GamesChakra to your whitelist.
            </AlertDescription>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default AdBlockDetector;