'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import FilterSearch from '@/components/search/FilterSearch';
import ArticleCard from '@/components/articles/ArticleCard';
import { Article } from '@/types/article';
import { searchArticles } from '@/lib/firebase/search';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    tagId: '',
    keyword: query,
  });

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const results = await searchArticles({
        keyword,
        categoryId: filters.categoryId || undefined,
        tagId: filters.tagId || undefined,
      });
      setArticles(results);
    } catch (error) {
      console.error('Search error:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (newFilters.keyword || newFilters.categoryId || newFilters.tagId) {
      handleSearch(newFilters.keyword);
    }
  };

  return (
    <>
      {/* 検索バー */}
      <section className="mb-8">
        <SearchBar />
      </section>

      {/* 絞り込み検索 */}
      <section className="mb-8">
        <FilterSearch
          filters={filters}
          onChange={handleFilterChange}
        />
      </section>

      {/* 検索結果 */}
      <section>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">検索中...</p>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                {articles.length}件の記事が見つかりました
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {query || filters.categoryId || filters.tagId
                ? '記事が見つかりませんでした'
                : '検索キーワードを入力してください'}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      {/* 検索結果ページはnoindex（クエリパラメータ付きの場合） */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.search.includes('q=') || 
                window.location.search.includes('categoryId=') || 
                window.location.search.includes('tagId=')) {
              const meta = document.createElement('meta');
              meta.name = 'robots';
              meta.content = 'noindex, nofollow';
              document.head.appendChild(meta);
            }
          `,
        }}
      />
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
          <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
            <SearchContent />
          </Suspense>
        </main>
      </div>
    </>
  );
}
