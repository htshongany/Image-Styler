import JSZip from 'jszip';

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // The result is a data URL: "data:image/png;base64,iVBORw0KGgo..."
        // We need to strip the prefix to get only the base64 part.
        const base64String = reader.result.split(',')[1];
        resolve({ base64: base64String, mimeType: file.type });
      } else {
        reject(new Error('Failed to read file as a string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export function fileToDataUrl(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                resolve({ base64, mimeType: file.type });
            } else {
                reject(new Error('Could not read file as data URL.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export function resizeAndPadImage(base64Image: string, targetAspectRatioValue: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"): Promise<{ base64: string, mimeType: 'image/png' }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const sourceWidth = image.width;
            const sourceHeight = image.height;
            const sourceAspectRatio = sourceWidth / sourceHeight;

            const [targetW, targetH] = targetAspectRatioValue.split(':').map(Number);
            const targetAspectRatio = targetW / targetH;

            // Determine crop dimensions from the source image
            let sx, sy, sWidth, sHeight;
            if (sourceAspectRatio > targetAspectRatio) {
                // Source image is wider than target, crop width
                sHeight = sourceHeight;
                sWidth = sourceHeight * targetAspectRatio;
                sx = (sourceWidth - sWidth) / 2;
                sy = 0;
            } else {
                // Source image is taller than target, crop height
                sWidth = sourceWidth;
                sHeight = sourceWidth / targetAspectRatio;
                sx = 0;
                sy = (sourceHeight - sHeight) / 2;
            }

            // Define a max dimension for the output canvas for performance and consistency
            const MAX_DIMENSION = 1024;
            
            let canvasWidth, canvasHeight;

            if (targetAspectRatio >= 1) { // Landscape or square
                canvasWidth = MAX_DIMENSION;
                canvasHeight = MAX_DIMENSION / targetAspectRatio;
            } else { // Portrait
                canvasHeight = MAX_DIMENSION;
                canvasWidth = MAX_DIMENSION * targetAspectRatio;
            }

            canvasWidth = Math.round(canvasWidth);
            canvasHeight = Math.round(canvasHeight);

            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            
            // Draw the cropped part of the source image onto the canvas, resizing it in the process.
            ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
            
            const resultBase64 = canvas.toDataURL('image/png').split(',')[1];
            resolve({ base64: resultBase64, mimeType: 'image/png' });
        };
        image.onerror = (error) => reject(error);
        image.src = `data:image/png;base64,${base64Image}`;
    });
}

export async function downloadImagesAsZip(images: string[], zipFileName: string): Promise<void> {
    if (images.length === 0) {
        console.warn("No images to download.");
        return;
    }

    const zip = new JSZip();

    images.forEach((imageDataUrl, index) => {
        const base64Data = imageDataUrl.split(',')[1];
        zip.file(`personnage-${index + 1}.png`, base64Data, { base64: true });
    });

    try {
        const blob = await zip.generateAsync({ type: 'blob' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${zipFileName}.zip`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Failed to create or download zip file:", error);
        throw new Error("La création du fichier ZIP a échoué.");
    }
}

export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type });
}