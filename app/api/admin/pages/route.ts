import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Page } from '@/types/page';

export const dynamic = 'force-dynamic';

// 固定ページ一覧取得
export async function GET(request: NextRequest) {
  try {
    const mediaId = request.headers.get('x-media-id');
    console.log('[API] GET /api/admin/pages - mediaId:', mediaId);
    
    let query: FirebaseFirestore.Query = adminDb.collection('pages');
    
    // mediaIdが指定されている場合はフィルタリング
    if (mediaId) {
      query = query.where('mediaId', '==', mediaId);
    }
    
    const snapshot = await query.get();
    console.log('[API] Pages fetched:', snapshot.size);
    
    const pages: Page[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Page;
    });
    
    // クライアント側でソート
    return NextResponse.json(pages);
  } catch (error) {
    console.error('[API] Error fetching pages:', error);
    console.error('[API] Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: 'Failed to fetch pages',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// 固定ページ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] POST /api/admin/pages - body:', body);
    
    // undefinedフィールドを除去（Firestoreはundefinedを許可しない）
    const cleanData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await adminDb.collection('pages').add({
      ...cleanData,
      publishedAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('[API] Page created with ID:', docRef.id);
    
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating page:', error);
    console.error('[API] Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: 'Failed to create page',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

