import { NextRequest, NextResponse } from 'next/server';
import { generateSlugFromTitle } from '@/lib/openai-helper';

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // OpenAI APIを使用してスラッグを生成
    const slug = await generateSlugFromTitle(title);
    
    return NextResponse.json({ slug });
  } catch (error) {
    console.error('[API] Error generating slug:', error);
    
    // エラー時はフォールバック（簡易的なスラッグ生成）
    const { title } = await request.json();
    const fallbackSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    return NextResponse.json({ slug: fallbackSlug });
  }
}

