import React from 'react';
import type { DefaultStyle } from '../types';
import { DEFAULT_STYLES } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

interface StyleSelectorProps {
  onStyleSelect: (style: DefaultStyle) => void;
  selectedStyle: DefaultStyle | null;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onStyleSelect, selectedStyle }) => {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {DEFAULT_STYLES.map((style) => (
          <button
              key={style.id}
              onClick={() => onStyleSelect(style)}
              className={`w-full h-14 flex items-center justify-center px-3 rounded-lg border-2 text-sm font-medium text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${selectedStyle?.id === style.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-indigo-500'
              }
              `}
          >
              {t.styles[style.nameKey]}
          </button>
      ))}
    </div>
  );
};