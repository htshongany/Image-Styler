import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconImagePlaceholder, IconDownload, IconCopy, IconSetReference, IconPalette, IconChevronsLeftRight } from './Icons';
import { Tooltip } from './Tooltip';
import { useTranslations } from '../hooks/useTranslations';

interface ImageDisplayProps {
  baseImage: { base64: string; mimeType: string; } | null;
  generatedImages: Array<{ after: string; before?: string; }>;
  currentIndex: number;
  onCopy: (index: number) => void;
  onUseAsContent: (index: number) => void;
  onUseAsStyle: (index: number) => void;
  isEditing: boolean;
  imageToEdit?: string;
  editTool: 'brush' | 'eraser';
  brushSize: number;
  brushColor: string;
  onCanvasUpdate: (dataUrl: string, toolUsed: 'brush' | 'eraser') => void;
  isLoading: boolean;
}

const LocalLoader: React.FC = () => {
    const t = useTranslations();
    return (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-30 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-slate-700">{t.loaderTitle}</p>
        </div>
    );
};


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  baseImage,
  generatedImages, 
  currentIndex, 
  onCopy, 
  onUseAsContent, 
  onUseAsStyle,
  isEditing,
  imageToEdit,
  editTool,
  brushSize,
  brushColor,
  onCanvasUpdate,
  isLoading
}) => {
  const t = useTranslations();
  const imagePair = generatedImages[currentIndex];

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number; y: number} | null>(null);
  
  const [cursorPreview, setCursorPreview] = useState({ visible: false, x: 0, y: 0 });
  const [scaledBrushSize, setScaledBrushSize] = useState(brushSize);

  // Slider Logic
  const handleSliderPointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleSliderPointerUp = useCallback((e: PointerEvent) => {
      e.preventDefault();
      setIsSliderDragging(false);
  }, []);


  useEffect(() => {
      if (isSliderDragging) {
          window.addEventListener('pointermove', handleSliderPointerMove);
          window.addEventListener('pointerup', handleSliderPointerUp);
      }
      return () => {
          window.removeEventListener('pointermove', handleSliderPointerMove);
          window.removeEventListener('pointerup', handleSliderPointerUp);
      };
  }, [isSliderDragging, handleSliderPointerMove, handleSliderPointerUp]);

  const handleSliderPointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      setIsSliderDragging(true);
  };

  // Effect to observe canvas size changes and update brush preview scale
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isEditing || !canvas) return;

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width } = entry.contentRect;
            if (width > 0 && canvas.width > 0) {
                const scale = canvas.width / width;
                setScaledBrushSize(brushSize / scale);
            }
        }
    });

    observer.observe(canvas);
    // Initial calculation
     const rect = canvas.getBoundingClientRect();
     if(rect.width > 0) {
        const scale = canvas.width / rect.width;
        setScaledBrushSize(brushSize / scale);
     }

    return () => observer.disconnect();
  }, [isEditing, brushSize]);


  // Canvas Logic
  const getCoords = (e: React.PointerEvent): {x: number, y: number} | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  const startDrawing = (e: React.PointerEvent) => {
    const coords = getCoords(e);
    if (!coords) return;
    isDrawing.current = true;
    lastPos.current = coords;
  };
  
  const draw = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    const coords = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!coords || !ctx || !lastPos.current) return;

    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (editTool === 'brush') {
      ctx.strokeStyle = brushColor;
      ctx.globalCompositeOperation = 'source-over';
    } else { // eraser
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPos.current = coords;
  };

  const endDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    if (canvasRef.current) {
        onCanvasUpdate(canvasRef.current.toDataURL('image/png'), editTool);
    }
  };

  const handlePointerMoveOnCanvas = (e: React.PointerEvent) => {
    draw(e);
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPreview({
            visible: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }
  };

  const handlePointerLeaveCanvas = () => {
    endDrawing();
    setCursorPreview(prev => ({ ...prev, visible: false }));
  };
  
  // Effect to load image onto canvas when editing starts or when undo/redo happens
  useEffect(() => {
    if (isEditing && imageToEdit && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageToEdit;
      image.onload = () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(image, 0, 0);
      };
    }
  }, [isEditing, imageToEdit]);

  const handleDownload = () => {
    if (!imagePair) return;
    const link = document.createElement('a');
    link.href = imagePair.after;
    link.download = `styled-image-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finalImageToShow = imagePair?.after ?? (baseImage ? `data:${baseImage.mimeType};base64,${baseImage.base64}` : null);

  return (
    <div 
        ref={containerRef}
        className={`relative group w-full h-full bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-inner select-none ${isEditing ? 'cursor-none' : ''}`}
    >
      {isLoading && <LocalLoader />}
      {finalImageToShow ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={finalImageToShow} 
              alt={t.afterImageAlt}
              className={`max-w-full max-h-full object-contain pointer-events-none ${isEditing ? 'opacity-50' : ''}`}
            />
          </div>
          
          {!isEditing && imagePair?.before && (
             <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img 
                  src={imagePair.before} 
                  alt={t.beforeImageAlt}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>
          )}

          {isEditing && (
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 touch-none"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onPointerDown={startDrawing}
              onPointerMove={handlePointerMoveOnCanvas}
              onPointerUp={endDrawing}
              onPointerLeave={handlePointerLeaveCanvas}
            />
          )}

          {!isEditing && imagePair?.before && (
            <div
              className="absolute inset-y-0 w-8 -translate-x-1/2 cursor-ew-resize group/handle z-10 touch-none"
              style={{ left: `${sliderPosition}%` }}
              onPointerDown={handleSliderPointerDown}
              role="separator"
              aria-valuenow={sliderPosition}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Image comparison slider"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white/50 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 group-hover/handle:opacity-100 transition-opacity duration-300">
                  <IconChevronsLeftRight className="w-6 h-6 text-slate-700"/>
              </div>
            </div>
          )}

          {isEditing && cursorPreview.visible && (
              <div
                  className="absolute rounded-full pointer-events-none border-2 z-30"
                  style={{
                      left: `${cursorPreview.x}px`,
                      top: `${cursorPreview.y}px`,
                      width: `${scaledBrushSize}px`,
                      height: `${scaledBrushSize}px`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: editTool === 'brush' ? `${brushColor}80` : 'rgba(255, 255, 255, 0.5)',
                      borderColor: editTool === 'brush' ? 'transparent' : 'rgba(0, 0, 0, 0.8)',
                  }}
              />
          )}
          
          {imagePair && (
            <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm p-2 rounded-xl">
              <Tooltip text={t.copyImageTooltip} position="left">
                <button
                  onClick={() => onCopy(currentIndex)}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10 active:scale-105 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <IconCopy className="w-6 h-6 drop-shadow-md" />
                </button>
              </Tooltip>
              <Tooltip text={t.useAsContentTooltip} position="left">
                <button
                  onClick={() => onUseAsContent(currentIndex)}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10 active:scale-105 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <IconSetReference className="w-6 h-6 drop-shadow-md" />
                </button>
              </Tooltip>
              <Tooltip text={t.useAsStyleTooltip} position="left">
                <button
                  onClick={() => onUseAsStyle(currentIndex)}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10 active:scale-105 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <IconPalette className="w-6 h-6 drop-shadow-md" />
                </button>
              </Tooltip>
              <Tooltip text={t.downloadImageTooltip} position="left">
                <button
                  onClick={handleDownload}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10 active:scale-105 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <IconDownload className="w-6 h-6 drop-shadow-md" />
                </button>
              </Tooltip>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-slate-500 p-8">
          <IconImagePlaceholder className="mx-auto h-24 w-24 mb-4" />
          <p className="text-xl font-medium mb-2">{t.characterPreview}</p>
          <p className="text-sm">{t.characterPreviewDescription}</p>
        </div>
      )}
    </div>
  );
};