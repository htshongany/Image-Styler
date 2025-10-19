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
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        if (!response.candidates || response.candidates.length === 0) {
            if (response.promptFeedback?.blockReason) {
                throw new Error(`Request blocked: ${response.promptFeedback.blockReason}. Please adjust your prompt or image.`);
            }
            throw new Error("Request was blocked due to safety policies (e.g., explicit content). Please adjust your prompt or image.");
        }
        
        const imagePart = response.candidates[0].content?.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        } else {
            const textResponse = response.text?.trim();
            if (textResponse) {
                throw new Error(textResponse);
            }
            throw new Error("No image data found in the API response. The model may have refused to generate the content.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for image editing:", error);
        // Rethrow the original error to preserve its properties (like message and stack)
        throw error;
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

        const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image?.imageBytes;

        if (base64ImageBytes) {
            return base64ImageBytes;
        } else {
            throw new Error("The request was processed, but no images were returned. This may be due to safety filters. Please try a different prompt.");
        }

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        // Rethrow the original error
        throw error;
    }
}