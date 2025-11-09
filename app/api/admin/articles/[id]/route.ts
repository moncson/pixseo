import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Article } from '@/types/article';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`[API /admin/articles/${id}] Fetching article...`);
    
    const articleRef = adminDb.collection('articles').doc(id);
    const doc = await articleRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    const article: Article = {
      id: doc.id,
      ...data,
      publishedAt: data.publishedAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Article;

    console.log(`[API /admin/articles/${id}] Found article:`, article.title);
    return NextResponse.json(article);
  } catch (error) {
    console.error(`[API /admin/articles] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch article', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const body = await request.json();
    console.log(`[API /admin/articles/${id}] Updating article with:`, body);
    
    const articleRef = adminDb.collection('articles').doc(id);
    const doc = await articleRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // 更新データを作成
    const updateData: any = {
      updatedAt: new Date(),
    };

    // isPublishedが含まれている場合のみ更新
    if (typeof body.isPublished === 'boolean') {
      updateData.isPublished = body.isPublished;
    }

    await articleRef.update(updateData);

    console.log(`[API /admin/articles/${id}] Article updated successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[API /admin/articles/${id}] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update article', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

