import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// サイト設定取得
export async function GET(request: NextRequest) {
  try {
    console.log('[API Site] サイト設定取得開始');
    
    const mediaId = request.headers.get('x-media-id');
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }
    
    const doc = await adminDb.collection('mediaTenants').doc(mediaId).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Media tenant not found' }, { status: 404 });
    }
    
    const data = doc.data();
    console.log('[API Site] 設定取得成功');
    
    return NextResponse.json({
      siteName: data?.name || '',
      siteDescription: data?.settings?.siteDescription || '',
      logoUrl: data?.settings?.logos?.square || '',
      allowIndexing: data?.allowIndexing || false, // デフォルトはfalse
    });
  } catch (error: any) {
    console.error('[API Site] エラー:', error);
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}

// サイト設定更新
export async function PUT(request: NextRequest) {
  try {
    console.log('[API Site] サイト設定更新開始');
    
    const mediaId = request.headers.get('x-media-id');
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { siteName, siteDescription, logoUrl, allowIndexing } = body;

    const updateData = {
      name: siteName,
      'settings.siteDescription': siteDescription,
      'settings.logos.square': logoUrl,
      allowIndexing: allowIndexing || false, // デフォルトはfalse
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('mediaTenants').doc(mediaId).update(updateData);
    
    console.log('[API Site] 設定更新成功');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Site] エラー:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}

