'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import FilterSearch from '@/components/search/FilterSearch';
import ArticleCard from '@/components/articles/ArticleCard';
import MediaHeader from '@/components/layout/MediaHeader';
import FooterContentRenderer from '@/components/blocks/FooterContentRenderer';
import FooterTextLinksRenderer from '@/components/blocks/FooterTextLinksRenderer';
import { Article, Category } from '@/types/article';
import { Theme } from '@/types/theme';
import { SiteInfo } from '@/lib/firebase/media-tenant-helper';
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
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get mediaId from window.location.hostname
        const hostname = window.location.hostname;
        const mediaId = hostname.split('.')[0];
        
        // Fetch site info, theme, and categories
        const [siteInfoRes, themeRes, categoriesRes] = await Promise.all([
          fetch(`/api/media/${mediaId}/info`),
          fetch(`/api/media/${mediaId}/theme`),
          fetch(`/api/media/${mediaId}/categories`)
        ]);

        if (siteInfoRes.ok) {
          const siteData = await siteInfoRes.json();
          setSiteInfo(siteData);
        }

        if (themeRes.ok) {
          const themeData = await themeRes.json();
          setTheme(themeData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !theme || !siteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const combinedStyles = `
    :root {
      --color-primary: ${theme.primaryColor};
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --accent-color: ${theme.accentColor};
      --background-color: ${theme.backgroundColor};
      --header-background-color: ${theme.headerBackgroundColor};
      --footer-background-color: ${theme.footerBackgroundColor};
      --block-background-color: ${theme.blockBackgroundColor};
      --link-color: ${theme.linkColor};
      --link-hover-color: ${theme.linkHoverColor};
      --border-color: ${theme.borderColor};
      --shadow-color: ${theme.shadowColor};
    }
    ${theme.customCss || ''}
  `;

  const footerContents = theme.footerContents?.filter(content => content.imageUrl) || [];
  const footerTextLinkSections = theme.footerTextLinkSections?.filter(section => section.title || section.links?.length > 0) || [];

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
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor }}>
        {/* Themeスタイル注入 */}
        <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />

        {/* ヘッダー */}
        <MediaHeader 
          siteName={siteInfo.name} 
          categories={categories}
          menuSettings={theme.menuSettings}
          menuBackgroundColor={theme.menuBackgroundColor}
          menuTextColor={theme.menuTextColor}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
            <SearchContent />
          </Suspense>
        </main>

        {/* フッターコンテンツ */}
        {footerContents.length > 0 && (
          <section className="w-full">
            <FooterContentRenderer contents={footerContents} />
          </section>
        )}

        {/* フッター */}
        <footer className="bg-gray-900 text-white" style={{ backgroundColor: theme.footerBackgroundColor }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {footerTextLinkSections.length > 0 ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(footerTextLinkSections.length + 1, 3)} gap-8 mb-8`}>
                <div>
                  <h3 className="text-2xl font-bold mb-4">{siteInfo.name}</h3>
                  <p className="text-gray-300 whitespace-pre-line">{siteInfo.description}</p>
                </div>
                <FooterTextLinksRenderer sections={footerTextLinkSections} />
              </div>
            ) : (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">{siteInfo.name}</h3>
                <p className="text-gray-300 whitespace-pre-line">{siteInfo.description}</p>
              </div>
            )}
            
            {footerTextLinkSections.length > 0 && (
              <div className="w-full border-t border-gray-700 pt-6">
                <p className="text-center text-sm text-gray-400">
                  © 2025 {siteInfo.name}. All rights reserved.
                </p>
              </div>
            )}
            {footerTextLinkSections.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                © 2025 {siteInfo.name}. All rights reserved.
              </p>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
