import { NextRequest, NextResponse } from 'next/server';
import { getPages, createPage } from '@/lib/firebase/pages-admin';
import { Page } from '@/types/page';

// 固定ページ一覧取得
export async function GET(request: NextRequest) {
  try {
    const mediaId = request.headers.get('x-media-id');
    console.log('[API] GET /api/admin/pages - mediaId:', mediaId);
    
    const pages = await getPages(mediaId || undefined);
    console.log('[API] Pages fetched:', pages.length);
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error('[API] Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// 固定ページ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] POST /api/admin/pages - body:', body);
    
    const pageId = await createPage(body as Omit<Page, 'id' | 'publishedAt' | 'updatedAt'>);
    console.log('[API] Page created with ID:', pageId);
    
    return NextResponse.json({ id: pageId }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

