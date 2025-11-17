import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { improveImagePrompt } from '@/lib/openai/improve-prompt';

export const dynamic = 'force-dynamic';

// サンプル画像生成（アップロードなし、表示のみ）
export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt || !size) {
      return NextResponse.json(
        { error: 'Prompt and size are required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('[Generate Sample Image] Improving prompt with GPT-4o...');

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // GPT-4o でプロンプトを改善（ChatGPT UI と同じ動作）
    const improvedPrompt = await improveImagePrompt(prompt, openai);

    console.log('[Generate Sample Image] Generating image with DALL-E 3...');

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: improvedPrompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    console.log('[Generate Sample Image] Image generated successfully');

    // 画像URLをそのまま返す（アップロードはしない）
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('[Generate Sample Image] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample image' },
      { status: 500 }
    );
  }
}

