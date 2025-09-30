import React, { useCallback, useState } from 'react';
import { IconPlus, IconX, IconInfo } from './Icons';
import { Tooltip } from './Tooltip';
import { useTranslations } from '../hooks/useTranslations';

interface CharacterUploaderProps {
  onImageUpload: (file: File) => void;
  onRemove: () => void;
  characterImage: { base64: string; mimeType: string; } | null;
  characterFile: File | null;
}

export const CharacterUploader: React.FC<CharacterUploaderProps> = ({ onImageUpload, onRemove, characterImage, characterFile }) => {
  const [dragging, setDragging] = useState(false);
  const t = useTranslations();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{t.characterReferenceTitle}</h3>
        <Tooltip text={t.characterReferenceTooltip}>
          <span className="text-slate-400 hover:text-slate-600 cursor-help">
            <IconInfo className="w-4 h-4" />
          </span>
        </Tooltip>
      </div>

      {characterImage && characterFile ? (
        <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg bg-slate-50">
          <img 
            src={`data:${characterImage.mimeType};base64,${characterImage.base64}`} 
            alt="Character Reference"
            className="w-12 h-12 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{characterFile.name}</p>
            <p className="text-xs text-slate-500">{`${(characterFile.size / 1024).toFixed(1)} KB`}</p>
          </div>
          {/* FIX: Replaced non-existent translation key 'useAsReferenceTooltip' with 'removeImageTooltip' for the remove button's tooltip. */}
          <Tooltip text={t.removeImageTooltip}>
            <button 
              onClick={onRemove}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 p-6
          ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400'
          }`}
        >
          <div className="flex flex-col items-center justify-center text-slate-500">
            <IconPlus className="w-8 h-8 mb-2 text-slate-400" />
            <p className="text-sm font-semibold">{t.addCharacter}</p>
            <p className="text-xs">{t.dragAndDrop}</p>
          </div>
          <input id="character-dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
};