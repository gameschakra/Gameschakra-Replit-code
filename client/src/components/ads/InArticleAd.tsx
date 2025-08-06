import React from 'react';
import AdSense from './AdSense';

interface InArticleAdProps {
  adClient: string;
  adSlot: string;
  className?: string;
}

/**
 * Special AdSense component for in-article ads
 * Uses the proper "fluid" ad format optimized for content
 */
const InArticleAd: React.FC<InArticleAdProps> = ({
  adClient,
  adSlot,
  className = '',
}) => {
  return (
    <div className={`my-6 py-4 text-center ${className}`}>
      <AdSense
        adClient={adClient}
        adSlot={adSlot}
        adFormat="fluid"
        responsive={true}
        style={{ display: 'block', textAlign: 'center' }}
      />
    </div>
  );
};

export default InArticleAd;