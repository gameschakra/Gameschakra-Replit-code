import React, { useEffect, useState, useRef } from 'react';
import AdSense from './AdSense';
import { X } from 'lucide-react';

interface DynamicAdProps {
  adClient: string;
  adSlot: string;
}

// Define the type for our global window object to include displayAD function
declare global {
  interface Window {
    displayAD: () => void;
    closeAD: () => void;
  }
}

/**
 * Dynamic Ad Component that responds to displayAD calls from games
 * Shows an ad with a close button when the game calls window.displayAD()
 */
const DynamicAd: React.FC<DynamicAdProps> = ({ adClient, adSlot }) => {
  const [showAd, setShowAd] = useState(false);
  const [adKey, setAdKey] = useState(Date.now()); // Used to force re-render of ad component
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the function games will call to show ads
    window.displayAD = () => {
      console.log('displayAD called by game');
      // Generate a new key to force fresh ad instance
      setAdKey(Date.now());
      setShowAd(true);
    };

    // Define function to close the ad
    window.closeAD = () => {
      setShowAd(false);
    };

    // Clean up on unmount
    return () => {
      window.displayAD = () => {
        console.warn('displayAD called but DynamicAd component is not mounted');
      };
      window.closeAD = () => {};
    };
  }, []);

  // Close ad when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adContainerRef.current && !adContainerRef.current.contains(event.target as Node)) {
        setShowAd(false);
      }
    };

    // Only add the event listener if the ad is showing
    if (showAd) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAd]);

  // Close ad after certain time (optional)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showAd) {
      // Auto-close after 3 minutes if user forgets to close
      timer = setTimeout(() => {
        setShowAd(false);
      }, 180000); // 3 minutes
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showAd]);

  if (!showAd) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in" 
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div 
        ref={adContainerRef}
        className="relative bg-card p-1 rounded-lg shadow-lg max-w-[728px] w-full mx-4"
      >
        {/* Close button */}
        <button 
          onClick={() => setShowAd(false)}
          className="absolute -top-4 -right-4 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
          aria-label="Close advertisement"
        >
          <X size={18} />
        </button>
        
        {/* Ad content */}
        <div className="w-full overflow-hidden bg-background rounded-md">
          <div className="text-xs text-muted-foreground text-center py-1">Advertisement</div>
          <AdSense 
            key={adKey}
            adClient={adClient} 
            adSlot={adSlot} 
            responsive={true} 
            className="w-full min-h-[250px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicAd;