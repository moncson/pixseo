import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTagServer } from '@/lib/firebase/tags-server';
import { getArticlesServer } from '@/lib/firebase/articles-server';
import ArticleCard from '@/components/articles/ArticleCard';
import SearchBar from '@/components/search/SearchBar';

// ISR: 60秒ごとに再生成
export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = await getTagServer(params.slug);
  
  if (!tag) {
    return {
      title: 'タグが見つかりません | ふらっと。',
    };
  }

  return {
    title: `${tag.name}の記事一覧 | ふらっと。`,
    description: `${tag.name}に関するバリアフリー情報記事一覧`,
    openGraph: {
      title: `${tag.name}の記事一覧 | ふらっと。`,
      description: `${tag.name}に関するバリアフリー情報記事一覧`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const tag = await getTagServer(params.slug);

  if (!tag) {
    notFound();
  }

  const articles = await getArticlesServer({ 
    tagId: tag.id,
    limit: 30 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/media" className="text-2xl font-bold text-gray-900">
              ふらっと。
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="/media" className="text-gray-700 hover:text-gray-900">
                トップ
              </a>
              <a href="/media/articles" className="text-gray-700 hover:text-gray-900">
                記事一覧
              </a>
              <a href="/media/search" className="text-gray-700 hover:text-gray-900">
                検索
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索バー */}
        <section className="mb-8">
          <SearchBar />
        </section>

        {/* タグヘッダー */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {tag.name}の記事
          </h1>
          <p className="text-lg text-gray-600">
            {tag.name}に関するバリアフリー情報記事一覧
          </p>
        </section>

        {/* 記事一覧 */}
        <section>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">このタグにはまだ記事がありません</p>
            </div>
          )}
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">© 2024 Ayumi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


