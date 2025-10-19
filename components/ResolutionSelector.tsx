import React from 'react';
import type { Resolution } from '../types';
import { RESOLUTIONS } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

interface ResolutionSelectorProps {
  onResolutionSelect: (resolution: Resolution) => void;
  selectedResolution: Resolution;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ onResolutionSelect, selectedResolution }) => {
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = RESOLUTIONS.find(r => r.id === e.target.value);
    if (selected) {
      onResolutionSelect(selected);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{t.resolutionTitle}</h3>
      </div>
      
      <select
        value={selectedResolution.id}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
      >
        {RESOLUTIONS.map((res) => (
          <option key={res.id} value={res.id}>
            {t.resolutions[res.id]}
          </option>
        ))}
      </select>
    </div>
  );
};