interface PlaceholderImageProps {
  text?: string;
  className?: string;
}

/**
 * A simple placeholder image component with gradient background
 */
export function PlaceholderImage({ text = 'Image', className = '' }: PlaceholderImageProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-gradient-to-br from-accent to-accent/40 ${className}`}
      aria-label="Loading image"
    >
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <span className="material-icons text-3xl text-muted-foreground/60 mb-2">image</span>
        <span className="text-sm text-muted-foreground/80 font-medium">{text}</span>
      </div>
    </div>
  );
}