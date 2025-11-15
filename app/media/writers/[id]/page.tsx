import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getWriterServer, getArticlesByWriterServer } from '@/lib/firebase/articles-server';
import { getCategoriesServer as getAllCategoriesServer } from '@/lib/firebase/categories-server';
import { getMediaIdFromHost, getSiteInfo } from '@/lib/firebase/media-tenant-helper';
import { getTheme, getCombinedStyles } from '@/lib/firebase/theme-helper';
import { FooterContent, FooterTextLinkSection } from '@/types/theme';
import MediaHeader from '@/components/layout/MediaHeader';
import CategoryBar from '@/components/layout/CategoryBar';
import FirstView from '@/components/layout/FirstView';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';
import FooterContentRenderer from '@/components/blocks/FooterContentRenderer';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const mediaId = await getMediaIdFromHost();
  const writer = await getWriterServer(params.id);
  
  if (!writer) {
    return {
      title: 'ライターが見つかりません',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { allowIndexing: siteAllowIndexing, name: siteName } = mediaId 
    ? await getSiteInfo(mediaId) 
    : { allowIndexing: false, name: 'メディアサイト' };
  
  const headersList = headers();
  const host = headersList.get('host') || '';
  const canonicalUrl = `https://${host}/writers/${writer.id}`;

  return {
    title: `${writer.handleName} | ${siteName}`,
    description: writer.bio || `${writer.handleName}の記事一覧`,
    robots: {
      index: siteAllowIndexing,
      follow: siteAllowIndexing,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: writer.handleName,
      description: writer.bio || `${writer.handleName}の記事一覧`,
      url: canonicalUrl,
      images: writer.icon ? [{ url: writer.icon }] : [],
    },
  };
}

export default async function WriterPage({ params }: PageProps) {
  const mediaId = await getMediaIdFromHost();
  const writer = await getWriterServer(params.id);
  
  if (!writer) {
    notFound();
  }

  // サイト情報、テーマ、記事、カテゴリーを取得
  const [siteInfo, theme, articles, allCategories] = await Promise.all([
    mediaId ? getSiteInfo(mediaId) : Promise.resolve({ name: 'メディアサイト', description: '', logoUrl: '', faviconUrl: '', allowIndexing: false }),
    mediaId ? getTheme(mediaId) : Promise.resolve({} as any),
    getArticlesByWriterServer(params.id, mediaId || undefined, 50),
    getAllCategoriesServer().catch(() => []),
  ]);

  const siteName = siteInfo.name;

  // mediaIdでカテゴリーをフィルタリング
  const headerCategories = mediaId 
    ? allCategories.filter(cat => cat.mediaId === mediaId)
    : allCategories;

  // ThemeスタイルとカスタムCSSを生成
  const combinedStyles = getCombinedStyles(theme);
  
  // フッターデータを取得
  const footerBlocks = theme.footerBlocks?.filter((block: any) => block.imageUrl) || [];
  const footerContents = theme.footerContents?.filter((content: FooterContent) => content.imageUrl) || [];
  const footerTextLinkSections = theme.footerTextLinkSections?.filter((section: FooterTextLinkSection) => section.title || section.links?.length > 0) || [];
  
  const headersList = headers();
  const host = headersList.get('host') || '';

  // JSON-LD 構造化データ（Person schema）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: writer.handleName,
    description: writer.bio || '',
    image: writer.icon || '',
    url: `https://${host}/writers/${writer.id}`,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* CSS変数とカスタムCSS */}
      <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />

      {/* ヘッダー */}
      <MediaHeader 
        siteName={siteName}
        logoUrl={siteInfo.logoUrl}
        categories={headerCategories}
        menuBackgroundColor={theme.menuBackgroundColor}
        menuTextColor={theme.menuTextColor}
        menuItems={theme.menuItems}
      />

      {/* FV（ライター用） */}
      <FirstView
        imageUrl={writer.backgroundImage || ''}
        catchphrase={writer.handleName}
        description="WRITER"
        isParallax={true}
      />

      {/* カテゴリーバー */}
      <CategoryBar 
        categories={headerCategories}
        currentCategorySlug=""
      />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ライタープロフィール */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-48">
            {writer.backgroundImage ? (
              <Image
                src={writer.backgroundImage}
                alt={writer.backgroundImageAlt || writer.handleName}
                fill
                className="object-cover"
              />
            ) : (
              <div 
                className="w-full h-full" 
                style={{ backgroundColor: 'var(--primary-color, #3b82f6)' }}
              />
            )}
          </div>
          
          <div className="relative flex justify-center -mt-16">
            {writer.icon ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={writer.icon}
                  alt={writer.handleName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-gray-500 text-4xl font-bold">
                {writer.handleName.charAt(0)}
              </div>
            )}
          </div>

          <div className="p-8 pt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {writer.handleName}
            </h1>
            {writer.bio && (
              <p className="text-base text-gray-600 leading-relaxed text-center mb-6">
                {writer.bio}
              </p>
            )}
            <div className="text-center text-sm text-gray-500">
              {articles.length} 記事
            </div>
          </div>
        </div>

        {/* 記事一覧 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">記事一覧</h2>
          
          {articles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              まだ記事がありません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  {article.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.featuredImage}
                        alt={article.featuredImageAlt || article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--link-text-color, #1f2937)' }}>
                      <span className="group-hover:hidden">{article.title}</span>
                      <span className="hidden group-hover:inline" style={{ color: 'var(--link-hover-color, #2563eb)' }}>
                        {article.title}
                      </span>
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <time dateTime={article.publishedAt.toISOString()}>
                        {article.publishedAt.toLocaleDateString('ja-JP', { 
                          year: 'numeric', 
                          month: 'numeric', 
                          day: 'numeric' 
                        })}
                      </time>
                      {article.viewCount !== undefined && (
                        <span>{article.viewCount.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <FooterContentRenderer
        footerContents={footerContents}
        footerTextLinkSections={footerTextLinkSections}
        siteName={siteName}
        siteDescription={siteInfo.description}
        logoUrl={siteInfo.logoUrl}
      />

      {/* スクロールトップボタン */}
      <ScrollToTopButton />
    </>
  );
}

