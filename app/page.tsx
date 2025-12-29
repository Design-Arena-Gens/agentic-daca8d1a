'use client';

import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'t2i' | 't2v' | 'i2i'>('t2i');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<10 | 20 | 30 | 60>(10);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && mode !== 'i2i') {
      setError('Please enter a prompt');
      return;
    }
    if (mode === 'i2i' && !referenceImage) {
      setError('Please upload a reference image');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          prompt,
          duration: mode === 't2v' ? duration : undefined,
          referenceImage: mode === 'i2i' ? referenceImage : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            AI Visual Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate high-quality images and videos with AI
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Generation Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMode('t2i')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    mode === 't2i'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Text → Image
                </button>
                <button
                  onClick={() => setMode('t2v')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    mode === 't2v'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Text → Video
                </button>
                <button
                  onClick={() => setMode('i2i')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    mode === 'i2i'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Image → Image
                </button>
              </div>
            </div>

            {mode === 'i2i' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Reference Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-600 file:text-white
                    hover:file:bg-purple-700
                    file:cursor-pointer cursor-pointer"
                />
                {referenceImage && (
                  <div className="mt-4">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 't2i'
                    ? 'e.g., A photorealistic portrait of a woman in a futuristic city'
                    : mode === 't2v'
                    ? 'e.g., A realistic video of a woman walking forward naturally at night'
                    : 'e.g., Make it photorealistic, keep everything else the same'
                }
                className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-white placeholder-gray-500"
              />
            </div>

            {mode === 't2v' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d as 10 | 20 | 30 | 60)}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        duration === d
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Result</h2>
            <div className="bg-gray-900 rounded-lg h-[500px] flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-400">Generating your visual...</p>
                </div>
              ) : result ? (
                mode === 't2v' ? (
                  <video
                    src={result}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={result}
                    alt="Generated"
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <p className="text-gray-500">Your generated visual will appear here</p>
              )}
            </div>
            {result && (
              <a
                href={result}
                download
                className="mt-4 block w-full py-3 bg-gray-700 text-white text-center font-medium rounded-lg hover:bg-gray-600 transition-all"
              >
                Download
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Instructions</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-bold mb-2 text-white">Text → Image</h3>
              <p className="text-gray-400">
                Generate high-quality images from text descriptions. Specify the exact style you want: realistic, 2D, anime, cinematic, etc.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-white">Text → Video</h3>
              <p className="text-gray-400">
                Create smooth videos up to 60 seconds. Choose duration: 10s, 20s, 30s, or 60s. Motion is natural and realistic unless specified otherwise.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-white">Image → Image</h3>
              <p className="text-gray-400">
                Transform an existing image. Upload a reference and describe only the changes you want. Composition stays the same.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
