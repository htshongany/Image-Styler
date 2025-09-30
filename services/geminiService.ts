import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function editImage(
    contentImage: { base64: string; mimeType: string; }, 
    textPrompt: string,
    styleImage?: { base64: string; mimeType: string; }
): Promise<string> {
    try {
        const parts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [
            {
                inlineData: {
                    data: contentImage.base64,
                    mimeType: contentImage.mimeType,
                },
            },
        ];

        if (styleImage) {
            parts.push({
                inlineData: {
                    data: styleImage.base64,
                    mimeType: styleImage.mimeType,
                }
            })
        }

        parts.push({ text: textPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        } else {
            const textResponse = response.text?.trim();
            if (textResponse) {
                throw new Error(`API returned text instead of an image: ${textResponse}`);
            }
            throw new Error("No image data found in the API response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for image editing:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}

export async function generateImage(textPrompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: textPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image data found in the API response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}