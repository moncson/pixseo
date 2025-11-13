import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('[API] 記事更新開始:', params.id);
    const { id } = params;
    const body = await request.json();
    console.log('[API] 更新データ:', body);
    console.log('[API] featuredImageAlt:', body.featuredImageAlt);

    const articleRef = adminDb.collection('articles').doc(id);
    
    // updatedAtを現在時刻に設定
    const updateData = {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    console.log('[API] Firestore更新実行中...');
    console.log('[API] updateDataに含まれるfeaturedImageAlt:', updateData.featuredImageAlt);
    await articleRef.update(updateData);
    console.log('[API] Firestore更新完了');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] 記事更新エラー:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

