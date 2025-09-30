import React from 'react';
import type { Resolution } from '../types';
import { RESOLUTIONS } from '../constants';
import { Tooltip } from './Tooltip';
import { IconInfo } from './Icons';
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
        <Tooltip text={t.resolutionTooltip}>
          <span className="text-slate-400 hover:text-slate-600 cursor-help">
            <IconInfo className="w-4 h-4" />
          </span>
        </Tooltip>
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