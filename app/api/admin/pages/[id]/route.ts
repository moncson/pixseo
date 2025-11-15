import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Page } from '@/types/page';

// 固定ページ取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await adminDb.collection('pages').doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    const data = doc.data();
    const page: Page = {
      id: doc.id,
      ...data,
      publishedAt: data?.publishedAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    } as Page;
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('[API] Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// 固定ページ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // undefinedフィールドを除去（Firestoreはundefinedを許可しない）
    const cleanData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    );
    
    await adminDb.collection('pages').doc(params.id).update({
      ...cleanData,
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// 固定ページ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await adminDb.collection('pages').doc(params.id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

