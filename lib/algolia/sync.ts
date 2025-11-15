import { Article } from '@/types/article';
import { articlesAdminIndex } from './client';

// AlgoliaRecord型（Algoliaに保存する形式）
export interface AlgoliaArticleRecord {
  objectID: string; // Algolia用のID（articleのIDと同じ）
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  mediaId: string;
  categories: string[]; // カテゴリー名の配列
  tags: string[]; // タグ名の配列
  publishedAt: number; // Unixタイムスタンプ
  isPublished: boolean;
}

/**
 * 記事をAlgoliaに追加/更新
 */
export async function syncArticleToAlgolia(
  article: Article,
  categoryNames: string[] = [],
  tagNames: string[] = []
): Promise<void> {
  if (!articlesAdminIndex) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    const record: AlgoliaArticleRecord = {
      objectID: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content || '',
      mediaId: article.mediaId,
      categories: categoryNames,
      tags: tagNames,
      publishedAt: article.publishedAt instanceof Date
        ? article.publishedAt.getTime()
        : new Date(article.publishedAt).getTime(),
      isPublished: article.isPublished,
    };

    await articlesAdminIndex.saveObject(record);
    console.log(`[Algolia] Synced article: ${article.id}`);
  } catch (error) {
    console.error('[Algolia] Error syncing article:', error);
    throw error;
  }
}

/**
 * 記事をAlgoliaから削除
 */
export async function deleteArticleFromAlgolia(articleId: string): Promise<void> {
  if (!articlesAdminIndex) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    await articlesAdminIndex.deleteObject(articleId);
    console.log(`[Algolia] Deleted article: ${articleId}`);
  } catch (error) {
    console.error('[Algolia] Error deleting article:', error);
    throw error;
  }
}

/**
 * 複数の記事を一括でAlgoliaに同期
 */
export async function bulkSyncArticlesToAlgolia(
  records: AlgoliaArticleRecord[]
): Promise<void> {
  if (!articlesAdminIndex) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    await articlesAdminIndex.saveObjects(records);
    console.log(`[Algolia] Bulk synced ${records.length} articles`);
  } catch (error) {
    console.error('[Algolia] Error bulk syncing articles:', error);
    throw error;
  }
}

