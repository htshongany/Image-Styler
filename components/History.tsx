import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { IconArrowUp, IconArrowDown } from './Icons';
import { Tooltip } from './Tooltip';

interface HistoryProps {
  images: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const History: React.FC<HistoryProps> = ({ images, currentIndex, onSelect }) => {
  const t = useTranslations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      // Add a small tolerance to avoid floating point issues in some browsers
      const isAtTop = el.scrollTop <= 0;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      
      setCanScrollUp(!isAtTop);
      setCanScrollDown(!isAtBottom);
    }
  }, []);
  
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Use a timeout to ensure DOM is updated after image list changes
    const debouncedCheck = () => setTimeout(checkScrollability, 100);

    // Initial check
    debouncedCheck();

    // Listeners
    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', debouncedCheck);

    return () => {
        el.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', debouncedCheck);
    }
  }, [images.length, checkScrollability]);

  const handleScroll = (direction: 'up' | 'down') => {
    const el = scrollContainerRef.current;
    if (el) {
      // Scroll by 80% of the visible height for a pleasant scroll speed
      const scrollAmount = el.clientHeight * 0.8;
      el.scrollBy({ top: direction === 'up' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  
  if (images.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-6 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">{t.historyEmpty}</p>
        </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col min-h-0 border-t border-slate-200">
      <h3 className="text-sm font-medium text-slate-500 mt-6 mb-3">{t.historyTitle}</h3>
      
      <div className="flex justify-center">
        <Tooltip text={t.scrollUpTooltip}>
            <button 
                onClick={() => handleScroll('up')}
                disabled={!canScrollUp}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                aria-label={t.scrollUpTooltip}
            >
                <IconArrowUp className="w-5 h-5" />
            </button>
        </Tooltip>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 grid grid-cols-3 gap-2 my-2 pr-1 min-h-0 overflow-y-auto no-scrollbar"
      >
        {images.map((img, index) => (
          <button 
            key={index} 
            onClick={() => onSelect(index)} 
            className={`aspect-square bg-slate-200 rounded-lg overflow-hidden transition-all duration-150 relative focus:outline-none group
            `}
            aria-label={t.historyAriaLabel(index + 1)}
          >
            <img src={img} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 border-2 rounded-lg group-hover:border-indigo-500 transition-colors
                ${currentIndex === index ? 'border-indigo-600' : 'border-transparent'}
            `}></div>
          </button>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Tooltip text={t.scrollDownTooltip}>
            <button 
                onClick={() => handleScroll('down')}
                disabled={!canScrollDown}
                className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                aria-label={t.scrollDownTooltip}
            >
                <IconArrowDown className="w-5 h-5" />
            </button>
        </Tooltip>
      </div>
    </div>
  );
};