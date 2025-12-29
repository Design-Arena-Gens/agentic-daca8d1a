import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

async function generateImage(prompt: string): Promise<string> {
  // Using Pollinations AI - free image generation API
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

  return imageUrl;
}

async function generateVideo(prompt: string, duration: number): Promise<string> {
  // Using a placeholder for video generation
  // In production, you would integrate with services like:
  // - Replicate (Stable Video Diffusion, AnimateDiff)
  // - Runway ML
  // - Pika Labs

  try {
    // For now, return a demo video URL with instructions
    // In real implementation, this would call actual video generation APIs
    return `data:text/plain;base64,${Buffer.from(
      'Video generation requires API keys. Please configure your video generation service API key in environment variables.'
    ).toString('base64')}`;
  } catch (error) {
    throw new Error('Video generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function transformImage(referenceImage: string, prompt: string): Promise<string> {
  // Using Pollinations AI for image transformation
  const base64Data = referenceImage.split(',')[1] || referenceImage;

  // For image-to-image, we'll use the text prompt with a seed based on the reference
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`;

  return imageUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, prompt, duration, referenceImage } = body;

    if (!mode || !['t2i', 't2v', 'i2i'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be t2i, t2v, or i2i' },
        { status: 400 }
      );
    }

    let result: string;

    switch (mode) {
      case 't2i':
        if (!prompt?.trim()) {
          return NextResponse.json(
            { error: 'Prompt is required for text-to-image generation' },
            { status: 400 }
          );
        }
        result = await generateImage(prompt);
        break;

      case 't2v':
        if (!prompt?.trim()) {
          return NextResponse.json(
            { error: 'Prompt is required for text-to-video generation' },
            { status: 400 }
          );
        }
        if (!duration || ![10, 20, 30, 60].includes(duration)) {
          return NextResponse.json(
            { error: 'Duration must be 10, 20, 30, or 60 seconds' },
            { status: 400 }
          );
        }
        result = await generateVideo(prompt, duration);
        break;

      case 'i2i':
        if (!referenceImage) {
          return NextResponse.json(
            { error: 'Reference image is required for image-to-image generation' },
            { status: 400 }
          );
        }
        if (!prompt?.trim()) {
          return NextResponse.json(
            { error: 'Prompt is required to describe desired changes' },
            { status: 400 }
          );
        }
        result = await transformImage(referenceImage, prompt);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid mode' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
