import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Category } from '@/types/article';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categoriesRef = adminDb.collection('categories');
    const snapshot = await categoriesRef.orderBy('name').get();

    const categories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      slug: doc.data().slug,
      description: doc.data().description || '',
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

