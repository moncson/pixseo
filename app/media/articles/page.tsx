import { Metadata } from 'next';
import { getArticlesServer } from '@/lib/firebase/articles-server';
import ArticleCard from '@/components/articles/ArticleCard';
import SearchBar from '@/components/search/SearchBar';

// ISR: 60秒ごとに再生成
export const revalidate = 60;

export const metadata: Metadata = {
  title: '記事一覧 | ふらっと。',
  description: 'バリアフリー情報記事一覧',
};

export default async function ArticlesPage() {
  const articles = await getArticlesServer({ limit: 30 });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-gray-900">
              ふらっと。
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-gray-900">
                トップ
              </a>
              <a href="/articles" className="text-gray-700 hover:text-gray-900">
                記事一覧
              </a>
              <a href="/search" className="text-gray-700 hover:text-gray-900">
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

        {/* 記事一覧 */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">記事一覧</h1>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">記事がまだありません</p>
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

