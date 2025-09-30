import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { IconBrush, IconEraser, IconUndo, IconRedo } from './Icons';
import { Tooltip } from './Tooltip';

interface ImageEditorProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  tool: 'brush' | 'eraser';
  onSetTool: (tool: 'brush' | 'eraser') => void;
  size: number;
  onSetSize: (size: number) => void;
  color: string;
  onSetColor: (color: string) => void;
  disabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  isEditing,
  onToggleEdit,
  tool,
  onSetTool,
  size,
  onSetSize,
  color,
  onSetColor,
  disabled,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const t = useTranslations();

  if (!isEditing) {
    return (
      <div>
        <button
          onClick={onToggleEdit}
          disabled={disabled}
          className="w-full bg-slate-200 text-slate-800 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors font-medium disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {t.editImageButton}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <h3 className="text-sm font-medium text-slate-700 text-center mb-2">{t.imageEditorTitle}</h3>
      
       <div className="flex w-full items-center justify-between gap-2">
            {/* Tool Selection Group */}
            <div className="flex flex-1 items-stretch gap-1 p-1 bg-slate-200 rounded-lg">
                <Tooltip text={t.brushToolTooltip}>
                    <button
                        onClick={() => onSetTool('brush')}
                        className={`flex-1 flex w-full justify-center items-center p-2 rounded-md transition-colors text-sm font-medium ${tool === 'brush' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                        <IconBrush className="w-5 h-5 mr-2" />
                        {t.brushToolTooltip}
                    </button>
                </Tooltip>
                <Tooltip text={t.eraserToolTooltip}>
                    <button
                        onClick={() => onSetTool('eraser')}
                        className={`flex-1 flex w-full justify-center items-center p-2 rounded-md transition-colors text-sm font-medium ${tool === 'eraser' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                    >
                        <IconEraser className="w-5 h-5 mr-2" />
                        {t.eraserToolTooltip}
                    </button>
                </Tooltip>
            </div>

            {/* Undo/Redo Group */}
            <div className="flex shrink-0 items-stretch p-1 bg-slate-200 rounded-lg">
                <Tooltip text={t.undoTooltip}>
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="flex justify-center items-center p-2 rounded-l-md transition-colors text-slate-600 hover:bg-white/50 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        aria-label={t.undoTooltip}
                    >
                        <IconUndo className="w-5 h-5" />
                    </button>
                </Tooltip>
                <div className="w-px bg-slate-300 my-1.5"></div>
                <Tooltip text={t.redoTooltip}>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="flex justify-center items-center p-2 rounded-r-md transition-colors text-slate-600 hover:bg-white/50 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        aria-label={t.redoTooltip}
                    >
                        <IconRedo className="w-5 h-5" />
                    </button>
                </Tooltip>
            </div>
      </div>
      
      {/* Tool Options */}
      <div className="space-y-4 bg-slate-100 p-3 rounded-lg">
        <div>
          <label htmlFor="brush-size" className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
            <span>{t.brushSizeLabel}</span>
            <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-600 text-xs">{size}px</span>
          </label>
          <input
            id="brush-size"
            type="range"
            min="1"
            max="100"
            value={size}
            onChange={(e) => onSetSize(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-indigo-600 [&::-moz-range-thumb]:bg-indigo-600"
          />
        </div>

        {tool === 'brush' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{t.brushColorLabel}</label>
            <div className="flex items-center space-x-2">
              <label className="w-8 h-8 rounded-md cursor-pointer border-2 border-slate-200 overflow-hidden" style={{ backgroundColor: color }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onSetColor(e.target.value)}
                  className="opacity-0 w-full h-full"
                  aria-label={t.brushColorLabel}
                />
              </label>
              <span className="font-mono text-sm text-slate-500">{color.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

       <button
          onClick={onToggleEdit}
          className="w-full text-sm bg-slate-200 text-slate-800 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors font-medium"
        >
          {t.cancelEditButton}
        </button>
    </div>
  );
};