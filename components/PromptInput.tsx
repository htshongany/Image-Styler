import React from 'react';
import { Tooltip } from './Tooltip';
import { IconInfo } from './Icons';
import { useTranslations } from '../hooks/useTranslations';

interface PromptInputProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;
    onGenerate: () => void;
    disabled: boolean;
    children: React.ReactNode;
    placeholder: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, negativePrompt, setNegativePrompt, onGenerate, disabled, children, placeholder }) => {
    const t = useTranslations();
    
    return (
        <div className="flex flex-col space-y-6 flex-1 overflow-y-auto p-6 mobile-no-scrollbar">
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="prompt-textarea" className="block text-sm font-medium text-slate-700">{t.mainPromptLabel}</label>
                  <Tooltip text={t.mainPromptTooltip} position="bottom">
                    <span className="text-slate-400 hover:text-slate-600 cursor-help">
                      <IconInfo className="w-4 h-4" />
                    </span>
                  </Tooltip>
                </div>
                <textarea
                    id="prompt-textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="negative-prompt-textarea" className="block text-sm font-medium text-slate-700">{t.negativePromptLabel}</label>
                   <Tooltip text={t.negativePromptTooltip} position="bottom">
                    <span className="text-slate-400 hover:text-slate-600 cursor-help">
                      <IconInfo className="w-4 h-4" />
                    </span>
                  </Tooltip>
                </div>
                <textarea
                    id="negative-prompt-textarea"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder={t.negativePromptPlaceholder}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
            </div>
            
            <div className="flex flex-col">
              {children}
            </div>

            <div className="pt-6">
                <button
                    onClick={onGenerate}
                    disabled={disabled}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {t.generateButton}
                </button>
            </div>
        </div>
    );
};