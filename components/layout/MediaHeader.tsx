import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types/article';
import { SiteInfo } from '@/lib/firebase/media-tenant-helper';

interface MediaHeaderProps {
  siteName: string;
  categories?: Category[];
  siteInfo?: SiteInfo;
}

export default function MediaHeader({ siteName, categories = [], siteInfo }: MediaHeaderProps) {
  return (
    <>
      {/* ヘッダー */}
      <header className="bg-white shadow-sm" style={{ backgroundColor: 'var(--header-background-color, #ffffff)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              {siteInfo?.logoUrl ? (
                <Image
                  src={siteInfo.logoUrl}
                  alt={siteName}
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {siteName}
                </span>
              )}
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="hover:opacity-75" style={{ color: 'var(--link-color, #374151)' }}>
                トップ
              </Link>
              <Link href="/articles" className="hover:opacity-75" style={{ color: 'var(--link-color, #374151)' }}>
                記事一覧
              </Link>
              <Link href="/search" className="hover:opacity-75" style={{ color: 'var(--link-color, #374151)' }}>
                検索
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* カテゴリーバー */}
      {categories.length > 0 && (
        <section className="bg-white border-b overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="relative flex-1 min-w-[150px] h-96 group overflow-hidden"
              >
                {category.imageUrl ? (
                  <>
                    {/* 背景画像 */}
                    <div className="absolute inset-0">
                      <Image
                        src={category.imageUrl}
                        alt={category.imageAlt || category.name}
                        fill
                        className="object-cover transition-all duration-300 group-hover:grayscale"
                        sizes="(max-width: 768px) 150px, 200px"
                      />
                    </div>
                    {/* グラデーションオーバーレイ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </>
                ) : (
                  <>
                    {/* グラデーション背景（画像がない場合） */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300 group-hover:grayscale" />
                    {/* テキストオーバーレイ */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white/30">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </>
                )}
                
                {/* カテゴリー名 */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-white font-bold text-lg text-center drop-shadow-lg">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

