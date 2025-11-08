import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [articlesSnap, categoriesSnap, tagsSnap] = await Promise.all([
      adminDb.collection('articles').get(),
      adminDb.collection('categories').get(),
      adminDb.collection('tags').get(),
    ]);

    const stats = {
      articlesCount: articlesSnap.size,
      categoriesCount: categoriesSnap.size,
      tagsCount: tagsSnap.size,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

