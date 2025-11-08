import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  console.log('[Middleware] Request:', { hostname, pathname });

  // 管理画面へのアクセスはスキップ
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // 静的ファイルやNext.js内部パスはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // メインアプリ（/media配下）へのアクセス
  if (pathname.startsWith('/media')) {
    try {
      // ドメインからmediaIdを取得
      const mediaId = await getMediaIdByDomain(hostname);
      
      if (!mediaId) {
        console.log('[Middleware] No media found for domain:', hostname);
        // デフォルトの動作（mediaIdなしで続行）
        return NextResponse.next();
      }

      console.log('[Middleware] Media ID found:', mediaId);

      // レスポンスヘッダーにmediaIdを追加
      const response = NextResponse.next();
      response.headers.set('x-media-id', mediaId);
      
      return response;
    } catch (error) {
      console.error('[Middleware] Error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// ドメインからmediaIdを取得する関数
async function getMediaIdByDomain(hostname: string): Promise<string | null> {
  try {
    // 開発環境の場合はスキップ
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      console.log('[Middleware] Localhost detected, skipping domain lookup');
      return null;
    }

    // Vercelプレビューデプロイメントの場合
    if (hostname.includes('.vercel.app')) {
      console.log('[Middleware] Vercel deployment detected, skipping domain lookup');
      return null;
    }

    // カスタムドメインからmediaIdを取得
    // 注: Middlewareでは直接Firestoreにアクセスできないため、
    // Edge-compatibleな方法でデータを取得する必要があります
    // 以下は簡易実装で、本番環境では別途API Routeやエッジデータベースを使用してください
    
    console.log('[Middleware] Domain lookup for:', hostname);
    
    // TODO: エッジランタイム互換のデータベースから取得
    // 例: Vercel KV, Upstash Redis, または専用API Route
    
    return null;
  } catch (error) {
    console.error('[Middleware] Error fetching mediaId:', error);
    return null;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

