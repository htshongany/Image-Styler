import React from 'react';
import type { Pose } from '../types';
import { POSES } from '../constants';
import { Tooltip } from './Tooltip';
import { useTranslations } from '../hooks/useTranslations';

interface PoseSelectorProps {
  onPoseSelect: (pose: Pose) => void;
  selectedPose: Pose | null;
}

export const PoseSelector: React.FC<PoseSelectorProps> = ({ onPoseSelect, selectedPose }) => {
  const t = useTranslations();

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.posesTitle}</h3>
      <div className="grid grid-cols-3 gap-2">
        {POSES.map((pose) => (
          <Tooltip key={pose.id} text={t.poses[pose.id]} position="top">
            <button
              onClick={() => onPoseSelect(pose)}
              className={`w-full aspect-square rounded-lg border text-center transition-all duration-200 flex items-center justify-center p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${selectedPose?.id === pose.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-300 hover:bg-slate-100 hover:border-slate-400 text-slate-500'
                }
              `}
            >
              <pose.icon className="w-8 h-8" />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};