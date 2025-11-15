import { MetadataRoute } from 'next';
import { getArticlesServer } from '@/lib/firebase/articles-server';
import { getCategoriesServer } from '@/lib/firebase/categories-server';
import { getTagsServer } from '@/lib/firebase/tags-server';
import { SUPPORTED_LANGS } from '@/types/lang';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'cobilabo.pixseo.cloud';
  
  // 記事、カテゴリー、タグを取得
  const [articles, categories, tags] = await Promise.all([
    getArticlesServer({ limit: 1000 }),
    getCategoriesServer(),
    getTagsServer(),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 静的ページ（各言語ごと）
  SUPPORTED_LANGS.forEach(lang => {
    sitemapEntries.push({
      url: `https://${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}`])
        ),
      },
    });

    sitemapEntries.push({
      url: `https://${baseUrl}/${lang}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}/articles`])
        ),
      },
    });

    sitemapEntries.push({
      url: `https://${baseUrl}/${lang}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}/search`])
        ),
      },
    });
  });

  // 記事ページ（各言語ごと）
  articles.forEach(article => {
    if (article.isPublished && article.slug) {
      SUPPORTED_LANGS.forEach(lang => {
        sitemapEntries.push({
          url: `https://${baseUrl}/${lang}/articles/${article.slug}`,
          lastModified: article.updatedAt || article.publishedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: Object.fromEntries(
              SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}/articles/${article.slug}`])
            ),
          },
        });
      });
    }
  });

  // カテゴリーページ（各言語ごと）
  categories.forEach(category => {
    if (category.slug) {
      SUPPORTED_LANGS.forEach(lang => {
        sitemapEntries.push({
          url: `https://${baseUrl}/${lang}/categories/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}/categories/${category.slug}`])
            ),
          },
        });
      });
    }
  });

  // タグページ（各言語ごと）
  tags.forEach(tag => {
    if (tag.slug) {
      SUPPORTED_LANGS.forEach(lang => {
        sitemapEntries.push({
          url: `https://${baseUrl}/${lang}/tags/${tag.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.5,
          alternates: {
            languages: Object.fromEntries(
              SUPPORTED_LANGS.map(l => [l, `https://${baseUrl}/${l}/tags/${tag.slug}`])
            ),
          },
        });
      });
    }
  });

  return sitemapEntries;
}

