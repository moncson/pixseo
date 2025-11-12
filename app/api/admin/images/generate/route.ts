import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

/**
 * OpenAI DALL-E APIを使用して画像を生成し、Firebase Storageに保存
 */
export async function POST(request: NextRequest) {
  try {
    const mediaId = request.headers.get('x-media-id');
    const body = await request.json();
    const { prompt, size = '1024x1024', n = 1 } = body;

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // OpenAI APIを呼び出し
    // Firebase Functions環境ではfunctions/src/index.tsでシークレットから環境変数に設定される
    // ローカル環境では.env.localから取得
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // DALL-E APIを呼び出し
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: Math.min(n, 1), // DALL-E 3は1枚のみ
        size: size, // '1024x1024', '1792x1024', '1024x1792'
        quality: 'standard', // 'standard' or 'hd'
        response_format: 'url', // 'url' or 'b64_json'
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('[OpenAI DALL-E API Error]', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image with DALL-E API', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    const imageUrl = openaiData.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    // 生成された画像をFirebase Storageにダウンロードして保存
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Firebase Storageにアップロード
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `articles/ai-generated/${timestamp}_${randomString}.png`;
    
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
      },
    });

    // 公開URLを生成
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      revisedPrompt: openaiData.data?.[0]?.revised_prompt || prompt, // DALL-E 3はプロンプトを改善する場合がある
    });
  } catch (error) {
    console.error('[API /admin/images/generate] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

