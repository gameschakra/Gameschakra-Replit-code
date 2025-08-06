import React, { useEffect, useRef, useState } from 'react';

interface AdSenseProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * AdSense component for displaying Google AdSense ads
 * 
 * Enhanced version that:
 * 1. Handles ad loading with proper tracking to prevent duplicate initialization
 * 2. Implements retry logic for better loading success rate
 * 3. Adds proper error handling and logging
 * 4. Uses unique IDs to prevent conflicts and track ad instances
 */
const AdSense: React.FC<AdSenseProps> = ({
  adClient,
  adSlot,
  adFormat = 'auto',
  responsive = true,
  style = {},
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const maxRetries = 3;
  
  // Generate a unique ID for this ad instance to track initialization
  const adId = useRef(`ad-${adSlot}-${Math.random().toString(36).substring(2, 9)}`);
  
  const initAd = () => {
    if (!adRef.current) return false;
    
    try {
      // Check if AdSense is available
      if (!window.adsbygoogle) {
        throw new Error('AdSense not available');
      }
      
      // Create a new ins element to replace the current one
      // This prevents the "already have ads in them" error on re-renders
      const adContainer = adRef.current;
      const adElement = document.createElement('ins');
      
      // Configure the ad element
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'block';
      adElement.style.overflow = 'hidden';
      Object.keys(style).forEach(key => {
        adElement.style[key as any] = (style as any)[key];
      });
      
      adElement.dataset.adClient = adClient;
      adElement.dataset.adSlot = adSlot;
      adElement.dataset.adFormat = adFormat;
      adElement.dataset.fullWidthResponsive = responsive ? 'true' : 'false';
      adElement.dataset.adId = adId.current;
      
      // Clear the container and append the new ad element
      while (adContainer.firstChild) {
        adContainer.removeChild(adContainer.firstChild);
      }
      adContainer.appendChild(adElement);
      
      // Push the ad for processing
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`AdSense ad ${adSlot} (${adId.current}) initialized successfully`);
        setIsLoaded(true);
        return true;
      } catch (pushError) {
        console.error(`Error in adsbygoogle.push() for slot ${adSlot}:`, pushError);
        return false;
      }
    } catch (error) {
      console.warn(`AdSense ad initialization attempt ${loadAttempts + 1} failed:`, error);
      return false;
    }
  };
  
  useEffect(() => {
    // Don't try to load again if already loaded
    if (isLoaded) return;
    
    // Don't exceed max retries
    if (loadAttempts >= maxRetries) {
      console.warn(`AdSense ad ${adSlot} failed to load after ${maxRetries} attempts`);
      return;
    }
    
    // Try to initialize the ad
    const success = initAd();
    
    // If failed, schedule a retry with increasing delay
    if (!success) {
      const nextAttempt = loadAttempts + 1;
      if (nextAttempt < maxRetries) {
        // Use exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(1.5, loadAttempts), 5000);
        
        console.log(`Retrying AdSense ad ${adSlot} in ${delay}ms (attempt ${nextAttempt + 1}/${maxRetries})`);
        
        const timerId = setTimeout(() => {
          setLoadAttempts(nextAttempt);
        }, delay);
        
        return () => clearTimeout(timerId);
      }
    }
  }, [adClient, adSlot, adFormat, responsive, style, isLoaded, loadAttempts]);

  // When component unmounts, mark this ad as not loaded so it can be reinitialized if remounted
  useEffect(() => {
    return () => {
      setIsLoaded(false);
      setLoadAttempts(0);
    };
  }, []);

  // Default styles to ensure proper ad display without forcing empty space
  const defaultStyles: React.CSSProperties = {
    display: 'block',
    ...style
  };

  return (
    <div 
      ref={adRef} 
      className={className}
      style={defaultStyles}
      data-ad-status={isLoaded ? 'loaded' : loadAttempts >= maxRetries ? 'failed' : 'loading'} 
      data-ad-id={adId.current}
    />
  );
};

export default AdSense;