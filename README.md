# AI Image Styler

The AI Image Styler is an advanced web application that uses Google's Gemini AI to transform and stylize images. It allows users to merge a content image with a style image, apply predefined styles, or guide the transformation via text prompts to create unique and consistent artwork.

## ✨ Key Features

- **Multiple Styling Methods**: Apply a style to your image in three different ways, which can be combined:
    - **Style Image**: Transfer the artistic style (colors, textures, mood) from a reference image.
    - **Predefined Styles**: Choose from a collection of built-in styles (Anime, Cyberpunk, Watercolor, etc.).
    - **Text Prompt**: Describe the changes you want to make with words.
- **Integrated Image Editor**: Directly modify the content image before generation. Use a brush to draw new shapes or an eraser to remove areas. The AI will interpret these changes as a compositional guide.
- **Before/After Comparison**: Easily visualize the impact of the transformation with an interactive slider that overlays the original and generated images.
- **Gallery and History**: Navigate through all the images you have generated during a session.
- **Session Management**: Save your entire session (uploaded images, generated images, prompts) in your browser and resume your work later.
- **Easy Export**: Download an individual image or export all generated images at once in a ZIP file.
- **Responsive Design**: The interface adapts perfectly to desktops, tablets, and mobile devices for an optimal user experience.
- **Multilingual**: Available in English and French.

## 🚀 How to Use

The application is divided into three main panels (or tabs on mobile).

### 1. Setup (Left Panel / `Setup` Tab)

This is where you prepare your sources.
- **Content Image**: Upload the base image you want to modify. This is the only mandatory step.
- **Style Image (Optional)**: Upload an image whose style you want to mimic.
- **Default Style (Optional)**: Select an artistic style from the list.

### 2. Generate (Right Panel / `Generate` Tab)

Here, you refine your instructions and start the creation process.
- **Additional Prompt**: Describe the changes you want to see (e.g., "add a pirate hat," "make the scene nocturnal").
- **Negative Prompt**: Indicate what the AI should avoid (e.g., "text, blurry, garish colors").
- **Image Editor**: Click **"Edit Image"** to draw or erase parts. If you use the brush, a prompt becomes mandatory to describe what you have drawn.
- Click **"Generate Image"** to start the process.

### 3. Preview (Center Panel / `Preview` Tab)

This is the space for viewing and interaction.
- The newly created image appears.
- Use the **vertical slider** to compare the image before and after the transformation.
- Use the navigation arrows at the bottom to browse through your creation history.
- Use the icons on the image to **copy**, **download**, or **reuse** it as a new content or style image.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Model**: Google Gemini (`gemini-2.5-flash-image-preview`) via the `@google/genai` API
- **Local Storage**: IndexedDB for session saving
- **Packaging**: JSZip for image exporting

## ✍️ Author

Created by Hamadou TSHONGANI.
- **Website**: https://hamadoutshongani.com

## 📄 License

The source code for this application is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. The intention behind this project is to provide a useful tool for everyone to enjoy, not for it to be commercialized by others. You are free to share and adapt the code for non-commercial purposes, provided you give appropriate credit.

<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a>

**Important Note on Generated Images:** The images you create using this application are subject to the terms of use of the underlying Google AI model (`gemini-2.5-flash-image-preview`). Please refer to Google's policies for how you can use the generated content.
