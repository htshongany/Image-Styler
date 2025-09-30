import React, { useState, useId } from 'react';

interface TooltipProps {
  // FIX: Changed children type from React.ReactNode to React.ReactElement to ensure it's a cloneable element, which resolves the overload error on React.cloneElement.
  children: React.ReactElement;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom': return 'top-full mt-3 left-1/2 -translate-x-1/2';
      case 'left': return 'right-full mr-3 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-3 top-1/2 -translate-y-1/2';
      case 'top': default: return 'bottom-full mb-3 left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom': return 'bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-b-white';
      case 'left': return 'left-full top-1/2 -translate-y-1/2 border-y-transparent border-l-white';
      case 'right': return 'right-full top-1/2 -translate-y-1/2 border-y-transparent border-r-white';
      case 'top': default: return 'top-full left-1/2 -translate-x-1/2 border-x-transparent border-t-white';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocusCapture={() => setIsVisible(true)}
      onBlurCapture={() => setIsVisible(false)}
    >
      {/* FIX: Explicitly provide a generic type argument to React.cloneElement to ensure the props object is correctly typed, resolving an overload error with the 'aria-describedby' attribute. */}
      {React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, { 'aria-describedby': tooltipId })}
      <div
        id={tooltipId}
        role="tooltip"
        className={`absolute z-40 transition-all duration-200 ease-in-out
                    px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-lg text-left max-w-[30rem]
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                    ${getPositionClasses()}`}
      >
        {text}
        <div className={`absolute w-0 h-0 border-[6px] ${getArrowClasses()}`} />
      </div>
    </div>
  );
};