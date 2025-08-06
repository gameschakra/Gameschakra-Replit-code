import { useEffect, useRef } from 'react';

interface AutoAdsProps {
  adClient: string;
}

/**
 * Component to enable Google AdSense Auto Ads
 * Auto ads will automatically insert ads at appropriate locations
 * 
 * IMPORTANT: This component should only be included ONCE per application
 * Typically in your root App component
 */
const AutoAds: React.FC<AutoAdsProps> = ({ adClient }) => {
  // Create a ref to store initialization state that persists across renders
  const initialized = useRef<boolean>(false);
  
  useEffect(() => {
    // Prevent multiple initializations from the same component
    if (initialized.current) {
      return;
    }
    
    // Check for global initialization across different components/pages
    if (window.__autoAdsInitialized) {
      initialized.current = true;
      return;
    }

    // Create a function to initialize ads with retry capability
    const initializeAds = (retryCount = 0, maxRetries = 3) => {
      try {
        // Early exit if already initialized in this retry loop
        if (window.__autoAdsInitialized) {
          return;
        }
        
        // Set global flag to prevent multiple initializations
        window.__autoAdsInitialized = true;
        initialized.current = true;
        
        // Check if AdSense script is loaded and adsbygoogle is available
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          // Add configuration - only do this once per page
          window.adsbygoogle.push({
            google_ad_client: adClient,
            enable_page_level_ads: true,
            overlays: { bottom: true }
          });
          
          console.log('Auto ads initialized successfully');
        } else if (retryCount < maxRetries) {
          // If script not loaded yet, retry after a delay
          window.__autoAdsInitialized = false;
          initialized.current = false;
          
          console.warn(`AdSense script not loaded yet, retrying (${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => initializeAds(retryCount + 1, maxRetries), 1000);
        } else {
          console.warn('AdSense initialization failed after maximum retries');
        }
      } catch (error) {
        console.error('Error initializing auto ads:', error);
        
        // Reset flags and retry if possible
        if (retryCount < maxRetries) {
          window.__autoAdsInitialized = false;
          initialized.current = false;
          setTimeout(() => initializeAds(retryCount + 1, maxRetries), 1000);
        }
      }
    };

    // Start initialization with delay to ensure AdSense script has time to load
    const timeoutId = setTimeout(() => initializeAds(), 500);
    
    // Clear timeout on component unmount
    return () => clearTimeout(timeoutId);
  }, [adClient]); // Only depend on adClient prop

  // This component doesn't render anything visible
  return null;
};

export default AutoAds;