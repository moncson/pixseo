import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * OpenAI APIを使用してSEO最適化されたメタタイトルを自動生成
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

    // OpenAI APIを呼び出してメタタイトルを生成
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
            content: `あなたはSEOの専門家です。記事タイトルからSEOに最適化されたメタタイトルを生成してください。

重要なルール:
- 70文字以内に収める（理想は50-60文字）
- 重要なキーワードを前半に配置
- クリックしたくなる魅力的な表現
- 検索結果で目立つタイトル
- 不要な装飾は避ける（【】や★などは使わない）
- 自然で読みやすい日本語

出力はメタタイトルのテキストのみ（説明不要）`,
          },
          {
            role: 'user',
            content: `以下の記事タイトルから、SEO最適化されたメタタイトル（70文字以内）を生成してください。\n\n記事タイトル: ${title}\n\nメタタイトルのみを出力してください（説明は不要）。`,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('[OpenAI API Error]', errorData);
      return NextResponse.json(
        { error: 'Failed to generate meta title with OpenAI API', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    let metaTitle = openaiData.choices?.[0]?.message?.content?.trim() || '';

    if (!metaTitle) {
      return NextResponse.json(
        { error: 'No meta title generated' },
        { status: 500 }
      );
    }

    // 70文字を超える場合はトリミング
    if (metaTitle.length > 70) {
      metaTitle = metaTitle.substring(0, 67) + '...';
    }

    return NextResponse.json({ metaTitle });
  } catch (error) {
    console.error('[API /admin/articles/generate-meta-title] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate meta title',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

