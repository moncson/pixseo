import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleServer, getRelatedArticlesServer } from '@/lib/firebase/articles-server';
import ArticleContent from '@/components/articles/ArticleContent';
import RelatedArticles from '@/components/articles/RelatedArticles';
import ArticleHeader from '@/components/articles/ArticleHeader';
import GoogleMapsEmbed from '@/components/common/GoogleMapsEmbed';

// ISR: 60秒ごとに再生成
export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleServer(params.slug);
  
  if (!article) {
    return {
      title: '記事が見つかりません | ふらっと。',
    };
  }

  return {
    title: `${article.metaTitle || article.title} | ふらっと。`,
    description: article.metaDescription || article.excerpt || article.title,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || article.title,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleServer(params.slug);
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticlesServer(article.id, article.categoryIds, article.tagIds, 6);

  // JSON-LD 構造化データ（SEO強化）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.metaDescription || article.title,
    image: article.featuredImage || '',
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ふらっと。',
      logo: {
        '@type': 'ImageObject',
        url: 'https://the-ayumi.jp/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://the-ayumi.jp/media/articles/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 記事ヘッダー */}
        <ArticleHeader article={article} />

        {/* 記事本文 */}
        <article className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <ArticleContent content={article.content} />
        </article>

        {/* Googleマイマップ */}
        {article.googleMapsUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">地図情報</h2>
            <GoogleMapsEmbed url={article.googleMapsUrl} />
          </div>
        )}

        {/* 認証店予約ボタン */}
        {article.reservationUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <a
              href={article.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              予約する
            </a>
          </div>
        )}

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}
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
