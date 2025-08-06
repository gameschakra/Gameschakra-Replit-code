import { useState, useEffect, useRef } from 'react';
import { PlaceholderImage } from './placeholder-image';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderText?: string;
}

export function LazyImage({ src, alt, className = '', placeholderText = 'Image' }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Set up Intersection Observer to detect when image is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px 0px', // Load images 200px before they enter viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Show placeholder while image is loading or not in view */}
      {(!isInView || !isLoaded) && (
        <div className="absolute inset-0 w-full h-full">
          <PlaceholderImage text={placeholderText} className="w-full h-full" />
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}