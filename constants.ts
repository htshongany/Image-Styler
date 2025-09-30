import type { Expression, Pose, Resolution, DefaultStyle } from './types';
// FIX: Import icons for use in POSES and EXPRESSIONS constants.
import { IconInfo, IconPlus, IconX } from './components/Icons';

export const RESOLUTIONS: Resolution[] = [
    {
        id: 'square',
        value: '1:1',
    },
    {
        id: 'portrait',
        value: '3:4',
    },
    {
        id: 'landscape',
        value: '4:3',
    },
    {
        id: 'tall_portrait',
        value: '9:16',
    },
    {
        id: 'wide_landscape',
        value: '16:9',
    },
];

export const DEFAULT_STYLES: DefaultStyle[] = [
    { 
        id: 'anime', 
        nameKey: 'anime',
        prompt: 'Redraw in a vibrant, modern anime/manga art style, with clean lines, sharp details, and expressive cel-shaded characters.'
    },
    { 
        id: 'cyberpunk', 
        nameKey: 'cyberpunk',
        prompt: 'Transform into a cyberpunk scene, with neon lighting, futuristic technology, high-contrast colors, and a gritty, dystopian atmosphere.'
    },
    { 
        id: 'watercolor',
        nameKey: 'watercolor',
        prompt: 'Convert to a delicate watercolor painting, with soft washes of color, visible brushstrokes, and bleeding edges on textured paper.'
    },
    { 
        id: 'pixel_art',
        nameKey: 'pixelArt',
        prompt: 'Recreate as detailed 16-bit pixel art, using a limited color palette, sharp pixel clusters, and a retro video game aesthetic.'
    },
    { 
        id: 'vintage',
        nameKey: 'vintage',
        prompt: 'Give it the look of a faded vintage photograph from the 1970s, with sepia tones, film grain, light leaks, and a soft focus.'
    },
    { 
        id: 'cartoon',
        nameKey: 'cartoon',
        prompt: 'Redraw in a bold, American cartoon style, with thick outlines, simplified shapes, solid colors, and dynamic, playful energy.'
    },
    { 
        id: 'fantasy_art', 
        nameKey: 'fantasyArt',
        prompt: 'Transform into an epic fantasy art illustration, with dramatic lighting, intricate details, mythical elements, and a painterly, digital art style reminiscent of high-fantasy book covers.'
    },
    { 
        id: 'comic_book', 
        nameKey: 'comicBook',
        prompt: 'Convert into a classic comic book panel, featuring bold ink outlines, vibrant flat colors, halftone dot patterns for shading, and a dynamic, action-oriented feel.'
    },
    { 
        id: 'three_d_render', 
        nameKey: 'threeDRender',
        prompt: 'Reimagine the image as a high-quality 3D render, with smooth surfaces, realistic lighting and shadows, and a polished, Pixar-like aesthetic.'
    },
    { 
        id: 'steampunk', 
        nameKey: 'steampunk',
        prompt: 'Reimagine in a steampunk style, featuring intricate clockwork, steam-powered machinery, Victorian-era aesthetics, and a color palette of brass, copper, and mahogany.'
    },
    { 
        id: 'passport_photo', 
        nameKey: 'passportPhoto',
        prompt: 'Recreate the image as a regulation-compliant passport photograph. The subject must have a neutral expression, facing directly forward. The background must be a solid, uniform off-white or light grey color. Lighting should be even with no shadows. The final image should be a tight, cropped headshot from the shoulders up. Remove any accessories like hats or sunglasses.'
    },
    { 
        id: 'linkedin_profile', 
        nameKey: 'linkedinProfile',
        prompt: 'Generate a professional, high-quality square profile picture suitable for LinkedIn. The subject should be the main focus, cropped from the chest up, with a warm and approachable expression. The background should be simple and unobtrusive, such as a blurred office setting or a solid neutral color. The lighting must be bright and even, highlighting the subject\'s face clearly. The overall tone should be professional and engaging.'
    }
];


// FIX: Add missing POSES constant for unused PoseSelector component.
export const POSES: Pose[] = [
    { id: 'standing', icon: IconPlus },
    { id: 'sitting', icon: IconX },
    { id: 'action', icon: IconInfo },
];

// FIX: Add missing EXPRESSIONS constant for unused ExpressionSelector component.
export const EXPRESSIONS: Expression[] = [
    { id: 'neutral', icon: IconPlus },
    { id: 'happy', icon: IconX },
    { id: 'surprised', icon: IconInfo },
];