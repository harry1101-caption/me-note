import React from 'react';
import './FloatingActionButton.css';

// Simple class name utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  vertical?: 'bottom' | 'center' | 'top';
  horizontal?: 'center' | 'end' | 'start';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  className = '',
  vertical = 'bottom',
  horizontal = 'center'
}) => {
  // Convert vertical and horizontal props to CSS classes
  const getVerticalClass = () => {
    switch (vertical) {
      case 'top': return 'top-2';
      case 'center': return 'top-1/2 -translate-y-1/2';
      case 'bottom': 
      default: return 'bottom-2';
    }
  };

  const getHorizontalClass = () => {
    switch (horizontal) {
      case 'start': return 'left-2';
      case 'end': return 'right-2';
      case 'center':
      default: return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className={cn('fixed', getVerticalClass(), getHorizontalClass())}>
      <div className="relative">
        {/* Main button */}
        <button
          onClick={onClick}
          className={cn(
            'h-12 w-12 rounded-full shadow-lg',
            'bg-primary-500 hover:bg-primary-500/90',
            'flex items-center justify-center',
            'transition-all duration-200 ease-in-out',
            'relative z-10', // Ensure button is above animation
            'border-0 outline-none focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'active:scale-95',
            className
          )}
        >
          <span
            className="
              absolute top-0 left-0 w-full h-14
              bg-gradient-to-b from-white/20 via-white/10 to-transparent
              blur-sm
              animate-flashLine
            "
          />
          {icon}
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
