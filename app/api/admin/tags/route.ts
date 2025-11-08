import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Tag } from '@/types/article';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tagsRef = adminDb.collection('tags');
    const snapshot = await tagsRef.orderBy('name').get();

    const tags: Tag[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      slug: doc.data().slug,
    }));

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching admin tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

