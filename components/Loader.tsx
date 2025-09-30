import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

export const Loader: React.FC = () => {
  const t = useTranslations();
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xl font-semibold text-slate-700">{t.loaderTitle}</p>
      <p className="text-slate-500">{t.loaderSubtitle}</p>
    </div>
  );
};