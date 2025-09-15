import { useState, useEffect, useRef } from 'react';
import { PlaceholderImage } from './placeholder-image';

type AspectRatio = '4/3' | '16/9' | '1/1' | '3/2';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderText?: string;
  ratio?: AspectRatio;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholderText = 'Image',
  ratio = '4/3',
  width,
  height,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const imgRef = useRef<HTMLImageElement>(null);

  // Get aspect ratio styles
  const getAspectRatioStyles = (ratio: AspectRatio) => {
    const ratioMap = {
      '4/3': 'aspect-[4/3]',
      '16/9': 'aspect-[16/9]',
      '1/1': 'aspect-square',
      '3/2': 'aspect-[3/2]'
    };
    return ratioMap[ratio];
  };

  // Set up Intersection Observer to detect when image is in viewport
  useEffect(() => {
    // Skip observer for priority images
    if (priority) return;

    // Fallback timeout to ensure images load even if observer fails
    const fallbackTimeout = setTimeout(() => {
      setIsInView(true);
    }, 2000);

    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver support
      setIsInView(true);
      clearTimeout(fallbackTimeout);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
            clearTimeout(fallbackTimeout);
          }
        });
      },
      {
        root: null, // Use document viewport as root
        rootMargin: '200px', // Load images 200px before they enter viewport
        threshold: 0, // Trigger as soon as any part of the element is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setIsLoaded(false);
  };

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${getAspectRatioStyles(ratio)} ${className}`}
    >
      {/* Show placeholder while image is loading or not in view */}
      {(!isInView || !isLoaded) && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse">
          <PlaceholderImage text={placeholderText} className="w-full h-full" />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}