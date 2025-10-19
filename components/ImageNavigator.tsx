import React from 'react';
import { IconArrowLeft, IconArrowRight, IconTrash } from './Icons';
import { Tooltip } from './Tooltip';
import { useTranslations } from '../hooks/useTranslations';

interface ImageNavigatorProps {
  currentIndex: number;
  totalImages: number;
  onNavigate: (direction: 'next' | 'prev') => void;
  onReset: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export const ImageNavigator: React.FC<ImageNavigatorProps> = ({ currentIndex, totalImages, onNavigate, onReset, disabled, isLoading }) => {
  const t = useTranslations();

  return (
    <div className={`flex items-center justify-between w-full max-w-md mx-auto p-1 bg-white border border-slate-200 rounded-lg ${disabled ? 'opacity-50' : ''}`}>
      <button 
        onClick={() => onNavigate('prev')} 
        disabled={disabled || currentIndex === 0}
        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
        aria-label={t.previousImageTooltip}
      >
        <IconArrowLeft className="w-5 h-5" />
      </button>

      <div className="px-3">
        <span className="text-sm font-medium text-slate-700">
             {totalImages > 0 ? t.imageNavigatorStatus(currentIndex + 1, totalImages) : t.noVariations}
        </span>
      </div>

      <button 
        onClick={() => onNavigate('next')} 
        disabled={disabled || currentIndex >= totalImages - 1}
        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-md disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
        aria-label={t.nextImageTooltip}
      >
        <IconArrowRight className="w-5 h-5" />
      </button>
      
      <Tooltip text={t.deleteVariationsTooltip}>
        <button 
          onDoubleClick={onReset} 
          disabled={disabled || isLoading}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-md disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent transition-colors"
        >
          <IconTrash className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  );
};