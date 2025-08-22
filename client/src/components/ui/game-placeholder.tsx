import React from 'react';

interface GamePlaceholderProps {
  title?: string;
  className?: string;
}

export const GamePlaceholder: React.FC<GamePlaceholderProps> = ({ 
  title = "Loading Game...", 
  className = "" 
}) => {
  return (
    <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 ${className}`}>
      <div className="relative pb-[75%] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
        {/* Animated logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-600 animate-pulse">
            <span className="material-icons text-6xl opacity-30">sports_esports</span>
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      </div>
      
      <div className="px-3 pt-3 pb-4">
        <div className="bg-gray-700 h-5 rounded animate-pulse mb-2"></div>
        <div className="flex items-center justify-between">
          <div className="bg-gray-700 h-3 w-16 rounded animate-pulse"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlaceholder;