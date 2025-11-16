import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    console.log('[Generate Sample Image] Generating image...');

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
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

