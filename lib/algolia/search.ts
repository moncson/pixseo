import { articlesIndex } from './client';
import { Article } from '@/types/article';

export interface AlgoliaSearchOptions {
  keyword: string;
  mediaId?: string;
  page?: number;
  hitsPerPage?: number;
}

/**
 * Algoliaで記事を検索
 */
export async function searchArticlesWithAlgolia(
  options: AlgoliaSearchOptions
): Promise<{ articles: Partial<Article>[]; totalHits: number }> {
  const { keyword, mediaId, page = 0, hitsPerPage = 20 } = options;

  try {
    const searchOptions: any = {
      page,
      hitsPerPage,
      filters: 'isPublished:true', // 公開済みのみ
    };

    // mediaIdでフィルタリング
    if (mediaId) {
      searchOptions.filters += ` AND mediaId:${mediaId}`;
    }

    const result = await articlesIndex.search(keyword, searchOptions);

    const articles = result.hits.map((hit: any) => ({
      id: hit.objectID,
      title: hit.title,
      slug: hit.slug,
      excerpt: hit.excerpt,
      mediaId: hit.mediaId,
      publishedAt: new Date(hit.publishedAt),
      isPublished: hit.isPublished,
      // カテゴリーとタグは別途取得が必要
    }));

    return {
      articles,
      totalHits: result.nbHits,
    };
  } catch (error) {
    console.error('[Algolia] Search error:', error);
    return { articles: [], totalHits: 0 };
  }
}

