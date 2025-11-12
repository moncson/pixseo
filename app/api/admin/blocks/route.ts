import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// バナー一覧取得
export async function GET(request: NextRequest) {
  try {
    // リクエストヘッダーからmediaIdを取得
    const mediaId = request.headers.get('x-media-id');
    
    console.log('[API Banners] バナー一覧取得開始', { mediaId });
    
    let query: FirebaseFirestore.Query = adminDb.collection('banners');
    
    // mediaIdが指定されている場合はフィルタリング
    if (mediaId) {
      query = query.where('mediaId', '==', mediaId);
    }
    
    const snapshot = await query.orderBy('order').get();
    
    const banners = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    console.log('[API Banners] 取得したバナー数:', banners.length);
    
    return NextResponse.json(banners);
  } catch (error: any) {
    console.error('[API Banners] エラー:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// バナー作成
export async function POST(request: Request) {
  try {
    console.log('[API Banners] バナー作成開始');
    
    const body = await request.json();
    const { title, imageUrl, linkUrl, isActive, mediaId } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
    }

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // 現在の最大order値を取得（同じmediaId内で）
    const snapshot = await adminDb.collection('banners')
      .where('mediaId', '==', mediaId)
      .orderBy('order', 'desc')
      .limit(1)
      .get();
    const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0);

    const bannerData = {
      mediaId,
      title,
      imageUrl,
      linkUrl: linkUrl || '',
      order: maxOrder + 1,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('banners').add(bannerData);
    
    console.log('[API Banners] バナー作成成功:', docRef.id);
    
    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error('[API Banners] エラー:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

