import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a description for your character.');
      return;
    }
    setError('');
    setIsLoading(true);
    setImageUrl('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Construct a more detailed prompt for Pixar-style results
      const fullPrompt = `A Pixar-style 3D character of "${prompt}". Spectacular character design, 3D neon light effects, maximum quality, cinematic lighting, God mode activated.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const url = `data:image/png;base64,${base64ImageBytes}`;
        setImageUrl(url);
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const filename = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'character-fusion';
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Character Fusion</h1>
        <p className="description">Describe your character and watch it come to life in spectacular 3D.</p>
      </header>
      <div className="input-form">
        <textarea
          className="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A brave and curious little wasp named Buzzwing, with big expressive hazel eyes and a friendly smile..."
          aria-label="Character description"
          disabled={isLoading}
        />
        <button 
          className="generate-button"
          onClick={handleGenerate} 
          disabled={isLoading || !prompt}
          aria-live="polite"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section className="image-container" aria-label="Generated Character Image">
        {isLoading ? (
          <div className="loading-spinner" role="status" aria-label="Loading"></div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt={prompt} className="generated-image" />
            <button onClick={handleDownload} className="download-button" aria-label="Download image">
              Download
            </button>
          </>
        ) : (
          <p className="placeholder-text">Your character will appear here...</p>
        )}
      </section>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);