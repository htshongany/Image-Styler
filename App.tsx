import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageDisplay } from './components/ImageDisplay';
import { PromptInput } from './components/PromptInput';
import { StyleSelector } from './components/StyleSelector';
import { ImageNavigator } from './components/ImageNavigator';
import { Tooltip } from './components/Tooltip';
import { IconSave, IconDownload, IconInfo, IconSlidersHorizontal, IconImage, IconSparkles } from './components/Icons';
import { editImage, generateImage } from './services/geminiService';
import { fileToBase64, dataUrlToFile, resizeAndPadImage, downloadImagesAsZip } from './utils/fileUtils';
import { saveState, loadState } from './services/dbService';
import type { DefaultStyle, Resolution } from './types';
import { useTranslations } from './hooks/useTranslations';
import { LocaleContext } from './context/LocaleContext';
import { ImageEditor } from './components/ImageEditor';
import { ResolutionSelector } from './components/ResolutionSelector';
import { RESOLUTIONS } from './constants';
import { Toast } from './components/Toast';

type ImageState = { base64: string; mimeType: string; } | null;

type GeneratedImage = {
  after: string | 'loading';
  before?: string;
}

type MobileView = 'setup' | 'preview' | 'generate';

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

const LeftPanel = React.memo(({ activeView, handleContentUpload, handleRemoveContent, contentImage, contentFile, handleStyleUpload, handleRemoveStyle, styleImage, styleFile, handleStyleSelect, selectedStyle, isContentMissing, selectedResolution, onResolutionSelect }) => {
  const t = useTranslations();
  return (
     <aside className={`${activeView === 'setup' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 bg-white lg:border-r lg:border-slate-200 flex-col flex-1 lg:flex-none min-h-0`}>
        <div className="flex-1 flex flex-col space-y-8 min-h-0 overflow-y-auto overflow-x-hidden mobile-no-scrollbar p-6">
          <ImageUploader
            onImageUpload={handleContentUpload}
            onRemove={handleRemoveContent}
            image={contentImage}
            file={contentFile}
            title={t.contentReferenceTitle}
            tooltipText={t.contentReferenceTooltip}
            buttonText={t.addContent}
            dropzoneId="content-dropzone"
            isOptional
          />
          <ResolutionSelector
            selectedResolution={selectedResolution}
            onResolutionSelect={onResolutionSelect}
          />
          <ImageUploader
            onImageUpload={handleStyleUpload}
            onRemove={handleRemoveStyle}
            image={styleImage}
            file={styleFile}
            title={t.styleReferenceTitle}
            tooltipText={t.styleReferenceTooltip}
            buttonText={t.addStyle}
            dropzoneId="style-dropzone"
            isOptional
            disabled={isContentMissing}
          />
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{t.defaultStyleTitle}</h3>
              <Tooltip text={t.defaultStyleTooltip} position="bottom">
                <span className="text-slate-400 hover:text-slate-600 cursor-help">
                  <IconInfo className="w-4 h-4" />
                </span>
              </Tooltip>
            </div>
            <div>
                <StyleSelector
                    onStyleSelect={handleStyleSelect}
                    selectedStyle={selectedStyle}
                    disabled={isContentMissing}
                />
            </div>
          </div>
        </div>
      </aside>
  );
});

const CenterPanel = React.memo(({ activeView, baseImage, generatedImages, currentIndex, onCopy, onUseAsContent, onUseAsStyle, isEditing, imageToEdit, editTool, brushSize, brushColor, onCanvasUpdate, onNavigate, onReset, isLoading }) => (
  <main className={`${activeView === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col p-6 bg-slate-100`}>
    <div className="flex-1 flex items-center justify-center min-h-0">
      <ImageDisplay 
        baseImage={baseImage}
        generatedImages={generatedImages}
        currentIndex={currentIndex}
        onCopy={onCopy}
        onUseAsContent={onUseAsContent}
        onUseAsStyle={onUseAsStyle}
        isEditing={isEditing}
        imageToEdit={imageToEdit}
        editTool={editTool}
        brushSize={brushSize}
        brushColor={brushColor}
        onCanvasUpdate={onCanvasUpdate}
      />
    </div>
    <div className="shrink-0 pt-6">
      <ImageNavigator 
        currentIndex={currentIndex}
        totalImages={generatedImages.length}
        onNavigate={onNavigate}
        onReset={onReset}
        disabled={generatedImages.length === 0}
        isLoading={isLoading}
      />
    </div>
  </main>
));

const RightPanel = React.memo(({ 
  activeView, prompt, setPrompt, negativePrompt, setNegativePrompt, onGenerate, canGenerate, 
  isEditing, hasUsedBrush, onToggleEdit, editTool, setEditTool, brushSize, setBrushSize, 
  brushColor, setBrushColor, editorDisabled, onUndo, onRedo, canUndo, canRedo, isContentMissing
}) => {
  const t = useTranslations();
  const placeholderText = isContentMissing
    ? t.textToImagePlaceholder
    : isEditing && hasUsedBrush
    ? t.mainPromptPlaceholderRequired
    : t.mainPromptPlaceholder;

  return (
      <aside className={`${activeView === 'generate' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 bg-white lg:border-l lg:border-slate-200 flex-col flex-1 lg:flex-none min-h-0`}>
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          onGenerate={onGenerate}
          disabled={!canGenerate}
          placeholder={placeholderText}
        >
            <ImageEditor
              isEditing={isEditing}
              onToggleEdit={onToggleEdit}
              tool={editTool}
              onSetTool={setEditTool}
              size={brushSize}
              onSetSize={setBrushSize}
              color={brushColor}
              onSetColor={setBrushColor}
              disabled={editorDisabled}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
        </PromptInput>
      </aside>
  );
});

export default function App(): React.ReactElement {
  const [contentImage, setContentImage] = useState<ImageState>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<ImageState>(null);
  const [styleFile, setStyleFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<DefaultStyle | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [toast, setToast] = useState<ToastState>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTool, setEditTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#000000');
  
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [editHistoryIndex, setEditHistoryIndex] = useState(-1);
  const [hasUsedBrush, setHasUsedBrush] = useState(false);
  
  const [activeView, setActiveView] = useState<MobileView>('preview');

  const t = useTranslations();
  const { locale, setLocale } = useContext(LocaleContext);
  const isInitialLoad = useRef(true);
  const debounceSaveRef = useRef<number | null>(null);
  
  // Load state from IndexedDB on initial mount
  useEffect(() => {
    const initState = async () => {
      if (!isInitialLoad.current) return;
      
      setIsLoading(true);
      try {
        const saved = await loadState();
        if (saved) {
           setContentImage(saved.contentImage);
           setStyleImage(saved.styleImage);
           setGeneratedImages(saved.generatedImages || []);
           setCurrentImageIndex(saved.currentImageIndex || 0);
           setPrompt(saved.prompt || '');
           setNegativePrompt(saved.negativePrompt || '');
           setSelectedStyle(saved.selectedStyle || null);
           setSelectedResolution(saved.selectedResolution || RESOLUTIONS[0]);
           if (saved.contentFile) {
               setContentFile(saved.contentFile);
           }
           if (saved.styleFile) {
               setStyleFile(saved.styleFile);
           }
        }
      } catch (err) {
        console.error("Failed to load state from DB", err);
        setError("Could not load saved session.");
      } finally {
        setIsLoading(false);
        // Set initial load to false after attempting to load
        isInitialLoad.current = false;
      }
    };
    initState();
  }, []);

  const handleSaveState = useCallback(async () => {
    setSaveStatus('saved');
    try {
        await saveState({
            contentImage, styleImage, generatedImages, currentImageIndex,
            prompt, negativePrompt, selectedStyle, contentFile, styleFile, selectedResolution,
        });
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
        setError("Failed to save session.");
        setSaveStatus('idle'); // Revert on error
    }
  }, [contentImage, styleImage, generatedImages, currentImageIndex, prompt, negativePrompt, selectedStyle, contentFile, styleFile, selectedResolution]);

  // Auto-save effect
  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }
    if (debounceSaveRef.current) {
        clearTimeout(debounceSaveRef.current);
    }
    debounceSaveRef.current = window.setTimeout(() => {
        handleSaveState();
    }, 1500); // Save 1.5 seconds after the last change

    return () => {
        if (debounceSaveRef.current) {
            clearTimeout(debounceSaveRef.current);
        }
    };
  }, [contentImage, styleImage, generatedImages, currentImageIndex, prompt, negativePrompt, selectedStyle, contentFile, styleFile, selectedResolution, handleSaveState]);

  const handleManualSave = () => {
      if (debounceSaveRef.current) {
        clearTimeout(debounceSaveRef.current);
      }
      handleSaveState();
  };

  const handleContentUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { base64 } = await fileToBase64(file);
      setContentImage({ base64, mimeType: file.type });
      setContentFile(file);
    } catch (err) {
      console.error('Error converting file:', err);
      setError(t.uploadCharacterError);
    }
  }, [t.uploadCharacterError]);

  const handleRemoveContent = () => {
    setContentImage(null);
    setContentFile(null);
  }
  
  const handleStyleUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const { base64 } = await fileToBase64(file);
      setStyleImage({ base64, mimeType: file.type });
      setStyleFile(file);
    } catch (err) {
      console.error('Error converting style file:', err);
      setError(t.uploadStyleError);
    }
  }, [t.uploadStyleError]);

  const handleRemoveStyle = () => {
    setStyleImage(null);
    setStyleFile(null);
  }

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel edit
      setEditHistory([]);
      setEditHistoryIndex(-1);
      setIsEditing(false);
    } else {
      // Start edit
      const imageToStartWith = 
        generatedImages[currentImageIndex]?.after ?? 
        (contentImage ? `data:${contentImage.mimeType};base64,${contentImage.base64}` : null);
        
      if (imageToStartWith && imageToStartWith !== 'loading') {
        setEditHistory([imageToStartWith]);
        setEditHistoryIndex(0);
        setHasUsedBrush(false);
        setIsEditing(true);
      }
    }
  };

  const handleCanvasUpdate = useCallback((dataUrl: string, toolUsed: 'brush' | 'eraser') => {
    setEditHistory(prev => {
        const newHistory = prev.slice(0, editHistoryIndex + 1);
        newHistory.push(dataUrl);
        return newHistory;
    });
    setEditHistoryIndex(prev => prev + 1);

    if (toolUsed === 'brush') {
        setHasUsedBrush(true);
    }
  }, [editHistoryIndex]);
  
  const handleUndo = () => {
      if (editHistoryIndex > 0) {
          setEditHistoryIndex(prev => prev - 1);
      }
  };

  const handleRedo = () => {
      if (editHistoryIndex < editHistory.length - 1) {
          setEditHistoryIndex(prev => prev + 1);
      }
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const wasEditing = isEditing;
    if (isEditing) setIsEditing(false);
    
    const loadingIndex = generatedImages.length;
    const placeholder: GeneratedImage = { after: 'loading' };
    setGeneratedImages(prev => [...prev, placeholder]);
    setCurrentImageIndex(loadingIndex);
    setActiveView('preview');

    try {
        let sourceImageForGeneration: ImageState = null;
        const isEditingActive = wasEditing && editHistory[editHistoryIndex];

        if (isEditingActive) {
            const editedImageBase64 = editHistory[editHistoryIndex];
            sourceImageForGeneration = { base64: editedImageBase64.split(',')[1], mimeType: 'image/png' };
        } else if (contentImage) {
            sourceImageForGeneration = contentImage;
        }

        if (sourceImageForGeneration) {
            // Image-to-Image flow (covers editing and standard i2i)
            const buildFinalPrompt = () => {
                const promptParts: string[] = ["# Primary Goal\nRedraw the provided content image."];
                if (wasEditing) {
                    promptParts.push("The content image has been manually edited. IMPORTANT: Treat these edits (drawings or erasures) as a compositional guide for shape and placement, NOT as a style reference. Your task is to intelligently interpret these edits and seamlessly integrate them into the final image, ensuring the result strictly adheres to the primary artistic style (defined by the style image or prompt). For example, if a colorful line is drawn on a black-and-white photo, the resulting feature should be rendered in black-and-white. The text prompt is the ultimate authority; if it specifies colors or details, those instructions override the drawing. Fill any erased (transparent) areas in a way that is consistent with the scene and style.");
                }

                let styleInstruction = "";
                let modifications = "";

                if (styleImage) {
                    styleInstruction = "Your main objective is to meticulously adopt the artistic style, color palette, and texture from the second input image (the style reference). Replicate its visual essence onto the content image.";
                    if (prompt.trim()) {
                        modifications = `Incorporate the following changes: "${prompt.trim()}".`;
                    }
                } else if (selectedStyle) {
                    styleInstruction = `Apply the following artistic style: "${selectedStyle.prompt}". Meticulously adhere to this style description.`;
                    if (prompt.trim()) {
                        modifications = `Incorporate the following changes: "${prompt.trim()}".`;
                    }
                } else if (prompt.trim()) {
                    styleInstruction = `Apply the following artistic style: "${prompt.trim()}". Your main objective is to faithfully recreate the visual characteristics of this style.`;
                }

                if (styleInstruction) {
                    promptParts.push(`# Style Instructions\n${styleInstruction}`);
                }

                if (modifications) {
                    promptParts.push(`# Specific Modifications\n${modifications}`);
                }

                if (negativePrompt.trim()) {
                    promptParts.push(`# Elements to Avoid\nStrictly avoid including any of the following: "${negativePrompt.trim()}".`);
                }

                return promptParts.join('\n\n');
            };

            const finalPrompt = buildFinalPrompt();
            const processedContentImage = await resizeAndPadImage(sourceImageForGeneration.base64, selectedResolution.value);
            const finalImageBase64 = await editImage(processedContentImage, finalPrompt, styleImage ?? undefined);
            
            const beforeImage = `data:${processedContentImage.mimeType};base64,${processedContentImage.base64}`;
            const afterImage = `data:image/png;base64,${finalImageBase64}`;

            setGeneratedImages(prev => {
              const newImages = [...prev];
              newImages[loadingIndex] = { before: beforeImage, after: afterImage };
              return newImages;
            });

        } else {
            // Text-to-Image flow
            const finalImageBase64 = await generateImage(prompt, selectedResolution.value);
            const afterImage = `data:image/png;base64,${finalImageBase64}`;
            setGeneratedImages(prev => {
              const newImages = [...prev];
              newImages[loadingIndex] = { after: afterImage };
              return newImages;
            });
        }
        setToast({ message: t.generationSuccess, type: 'success' });
    } catch (err) {
        console.error('Error generating image:', err);
        setError(t.generationFailedError);
        setGeneratedImages(prev => prev.filter((_, index) => index !== loadingIndex));
        setCurrentImageIndex(Math.max(0, loadingIndex - 1));
    } finally {
        setIsLoading(false);
    }
  }, [contentImage, styleImage, prompt, negativePrompt, selectedStyle, t, isEditing, editHistory, editHistoryIndex, selectedResolution, generatedImages.length]);

  const handleNavigate = (direction: 'next' | 'prev') => {
    setIsEditing(false);
    if (direction === 'next') {
        setCurrentImageIndex(prev => Math.min(prev + 1, generatedImages.length - 1));
    } else {
        setCurrentImageIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const handleReset = () => {
      setIsEditing(false);
      setGeneratedImages([]);
      setCurrentImageIndex(0);
  };
  
  const handleStyleSelect = (style: DefaultStyle) => {
    setSelectedStyle(prev => prev?.id === style.id ? null : style);
  }

  const handleCopyImage = useCallback(async (index: number) => {
    const imageToCopy = generatedImages[index]?.after;
    if (!imageToCopy || imageToCopy === 'loading') return;

    try {
      const blob = await (await fetch(imageToCopy)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
      setError(t.copyImageFailedError);
    }
  }, [generatedImages, t.copyImageFailedError]);
  
  const handleUseAs = useCallback(async (index: number, useAs: 'content' | 'style') => {
      const imageToUse = generatedImages[index]?.after;
      if (!imageToUse || imageToUse === 'loading') return;
      setIsEditing(false);
      try {
          const file = await dataUrlToFile(imageToUse, `${useAs}-${Date.now()}.png`);
          if (useAs === 'content') {
              handleContentUpload(file);
          } else {
              handleStyleUpload(file);
          }
      } catch (err) {
          console.error(`Failed to use image as ${useAs}:`, err);
          setError(useAs === 'content' ? t.useAsContentFailedError : t.useAsStyleFailedError);
      }
  }, [generatedImages, handleContentUpload, handleStyleUpload, t.useAsContentFailedError, t.useAsStyleFailedError]);

  const handleExportAll = useCallback(async () => {
      if (generatedImages.length === 0) return;
      try {
          const imagesToExport = generatedImages.map(img => img.after).filter(img => img !== 'loading') as string[];
          await downloadImagesAsZip(imagesToExport, 'styled-images');
      } catch (err) {
          console.error("Failed to export images:", err);
          setError("Failed to create ZIP file.");
      }
  }, [generatedImages]);

  const canGenerate = (() => {
    if (isLoading) return false;

    // Text-to-image flow
    if (!contentImage) {
        return prompt.trim().length > 0;
    }

    // Image-to-image flow
    const hasSource = isEditing ? editHistory.length > 0 : !!contentImage;
    if (!hasSource) return false;
    
    const hasStyleMethod = !!styleImage || !!selectedStyle || prompt.trim().length > 0;
    if (!hasStyleMethod) return false;

    if (isEditing && hasUsedBrush) {
        return prompt.trim().length > 0;
    }

    return true;
  })();
  
  const editorDisabled = isLoading || (!contentImage && generatedImages.length === 0);
  const canUndo = editHistoryIndex > 0;
  const canRedo = editHistoryIndex < editHistory.length - 1;

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col antialiased">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 z-10">
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">{t.appTitle}</h1>
            <div className="flex items-center space-x-2">
                <Tooltip text={saveStatus === 'saved' ? t.saveSuccessTooltip : t.saveTooltip} position="bottom">
                    <button 
                        onClick={handleManualSave}
                        className={`p-2 rounded-full transition-colors duration-300 disabled:opacity-50 ${saveStatus === 'saved' ? 'text-green-500 bg-green-100' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-100'}`}
                        disabled={isLoading}
                        aria-label={t.saveTooltip}
                    >
                        <IconSave className="w-6 h-6" />
                    </button>
                </Tooltip>
                <Tooltip text={t.exportAllTooltip} position="bottom">
                     <button
                        onClick={handleExportAll}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors disabled:opacity-50"
                        disabled={isLoading || generatedImages.length === 0}
                        aria-label={t.exportAllTooltip}
                    >
                        <IconDownload className="w-6 h-6" />
                    </button>
                </Tooltip>
                <div className="h-6 w-px bg-slate-200 mx-1 sm:mx-2"></div>
                <div className="relative">
                   <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as 'en' | 'fr')}
                        className="appearance-none bg-white border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-sm leading-5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-400 transition-colors"
                        aria-label={t.language}
                    >
                        <option value="en">{t.english}</option>
                        <option value="fr">{t.french}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                </div>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative pb-20 lg:pb-0">
        <LeftPanel 
          activeView={activeView}
          handleContentUpload={handleContentUpload}
          handleRemoveContent={handleRemoveContent}
          contentImage={contentImage}
          contentFile={contentFile}
          handleStyleUpload={handleStyleUpload}
          handleRemoveStyle={handleRemoveStyle}
          styleImage={styleImage}
          styleFile={styleFile}
          handleStyleSelect={handleStyleSelect}
          selectedStyle={selectedStyle}
          isContentMissing={!contentImage}
          selectedResolution={selectedResolution}
          onResolutionSelect={setSelectedResolution}
        />
        <CenterPanel 
          activeView={activeView}
          baseImage={contentImage}
          generatedImages={generatedImages}
          currentIndex={currentImageIndex}
          onCopy={handleCopyImage}
          onUseAsContent={(i) => handleUseAs(i, 'content')}
          onUseAsStyle={(i) => handleUseAs(i, 'style')}
          isEditing={isEditing}
          imageToEdit={editHistory[editHistoryIndex]}
          editTool={editTool}
          brushSize={brushSize}
          brushColor={brushColor}
          onCanvasUpdate={handleCanvasUpdate}
          onNavigate={handleNavigate}
          onReset={handleReset}
          isLoading={isLoading}
        />
        <RightPanel 
          activeView={activeView}
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          onGenerate={handleGenerate}
          canGenerate={canGenerate}
          isEditing={isEditing}
          hasUsedBrush={hasUsedBrush}
          onToggleEdit={handleToggleEdit}
          editTool={editTool}
          setEditTool={setEditTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          editorDisabled={editorDisabled}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          isContentMissing={!contentImage}
        />
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around z-20">
        <button 
          onClick={() => setActiveView('setup')} 
          className={`flex flex-col items-center justify-center p-3 text-xs w-full transition-colors ${activeView === 'setup' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <IconSlidersHorizontal className="w-6 h-6 mb-1" />
          <span>Configuration</span>
        </button>
         <button 
          onClick={() => setActiveView('preview')} 
          className={`flex flex-col items-center justify-center p-3 text-xs w-full transition-colors ${activeView === 'preview' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <IconImage className="w-6 h-6 mb-1" />
          <span>Aperçu</span>
        </button>
        <button 
          onClick={() => setActiveView('generate')} 
          className={`flex flex-col items-center justify-center p-3 text-xs w-full transition-colors ${activeView === 'generate' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <IconSparkles className="w-6 h-6 mb-1" />
          <span>Générer</span>
        </button>
      </nav>

    </div>
  );
}