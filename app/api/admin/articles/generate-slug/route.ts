import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * OpenAI APIを使用して日本語タイトルから英語のスラッグを生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

    // OpenAI APIを呼び出してスラッグを生成
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたはSEOに強い専門家です。日本語のタイトルを、SEOに最適化された短く簡潔な英語のURLスラッグに変換してください。スラッグは小文字のみを使用し、単語間はハイフン(-)で区切ってください。最大5単語以内に収めてください。',
          },
          {
            role: 'user',
            content: `以下の日本語タイトルを、SEOに最適化された短く簡潔な英語のURLスラッグに変換してください。\n\nタイトル: ${title}\n\nスラッグのみを出力してください（説明は不要）。`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('[OpenAI API Error]', errorData);
      return NextResponse.json(
        { error: 'Failed to generate slug with OpenAI API', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    let slug = openaiData.choices?.[0]?.message?.content?.trim() || '';

    if (!slug) {
      return NextResponse.json(
        { error: 'No slug generated' },
        { status: 500 }
      );
    }

    // スラッグをクリーンアップ（念のため）
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return NextResponse.json({ slug });
  } catch (error) {
    console.error('[API /admin/articles/generate-slug] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate slug', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

