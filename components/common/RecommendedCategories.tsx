import Link from 'next/link';
import { getCategoriesServer } from '@/lib/firebase/categories-server';

export default async function RecommendedCategories() {
  const categories = await getCategoriesServer({ isRecommended: true });

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">おすすめカテゴリー</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/media/categories/${category.slug}`}
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

