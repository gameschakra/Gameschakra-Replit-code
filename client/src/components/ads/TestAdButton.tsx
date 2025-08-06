import React from 'react';
import { Button } from '@/components/ui/button';

interface TestAdButtonProps {
  className?: string;
}

/**
 * A test button that triggers the displayAD function
 * This is for demonstration purposes only
 */
const TestAdButton: React.FC<TestAdButtonProps> = ({ className }) => {
  const handleClick = () => {
    if (typeof window.displayAD === 'function') {
      window.displayAD();
    } else {
      console.error('displayAD function not found');
      alert('displayAD function not found. Make sure DynamicAd component is mounted.');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={className}
    >
      Test Display Ad
    </Button>
  );
};

export default TestAdButton;