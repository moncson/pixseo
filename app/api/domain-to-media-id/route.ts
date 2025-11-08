import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

// ドメインからmediaIdを取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
    }

    console.log('[API domain-to-media-id] Looking up domain:', domain);

    // カスタムドメインで検索
    let snapshot = await adminDb.collection('tenants')
      .where('customDomain', '==', domain)
      .limit(1)
      .get();

    // カスタムドメインが見つからない場合、サブドメインで検索
    if (snapshot.empty) {
      // domain から subdomain を抽出（例: blog.pixseo.cloud → blog）
      const subdomain = domain.split('.')[0];
      console.log('[API domain-to-media-id] Trying subdomain:', subdomain);
      
      snapshot = await adminDb.collection('tenants')
        .where('subdomain', '==', subdomain)
        .limit(1)
        .get();
    }

    if (snapshot.empty) {
      console.log('[API domain-to-media-id] No media found for domain:', domain);
      return NextResponse.json({ mediaId: null });
    }

    const mediaId = snapshot.docs[0].id;
    console.log('[API domain-to-media-id] Found media ID:', mediaId);

    return NextResponse.json({ mediaId });
  } catch (error: any) {
    console.error('[API domain-to-media-id] Error:', error);
    return NextResponse.json({ error: 'Failed to lookup domain' }, { status: 500 });
  }
}

