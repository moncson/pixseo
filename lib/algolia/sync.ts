import { Article } from '@/types/article';
import { adminClient, ARTICLES_INDEX } from './client';

// AlgoliaRecord型（Algoliaに保存する形式）
export interface AlgoliaArticleRecord {
  objectID: string; // Algolia用のID（articleのIDと同じ）
  title: string;
  slug: string;
  excerpt?: string;
  contentText?: string; // HTMLタグを除去したテキスト（検索用、最大3000文字）
  mediaId: string;
  categories: string[]; // カテゴリー名の配列
  tags: string[]; // タグ名の配列
  publishedAt: number; // Unixタイムスタンプ
  isPublished: boolean;
  featuredImage?: string; // アイキャッチ画像URL
  featuredImageAlt?: string; // アイキャッチ画像のalt属性
  viewCount?: number; // 閲覧数
}

/**
 * 記事をAlgoliaに追加/更新
 */
export async function syncArticleToAlgolia(
  article: Article,
  categoryNames: string[] = [],
  tagNames: string[] = []
): Promise<void> {
  if (!adminClient) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    // HTMLタグを除去してテキストのみ抽出（検索用）
    let contentText = '';
    if (article.content) {
      contentText = article.content
        .replace(/<[^>]*>/g, '') // HTMLタグを削除
        .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに変換
        .replace(/&amp;/g, '&') // &amp;を&に変換
        .replace(/&lt;/g, '<') // &lt;を<に変換
        .replace(/&gt;/g, '>') // &gt;を>に変換
        .replace(/&quot;/g, '"') // &quot;を"に変換
        .replace(/\s+/g, ' ') // 連続した空白を1つに
        .trim()
        .substring(0, 3000); // 最初の3000文字のみ（約3KB、安全マージン）
    }

    const record: AlgoliaArticleRecord = {
      objectID: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      contentText, // HTMLタグを除去したテキスト
      mediaId: article.mediaId,
      categories: categoryNames,
      tags: tagNames,
      publishedAt: article.publishedAt instanceof Date
        ? article.publishedAt.getTime()
        : new Date(article.publishedAt).getTime(),
      isPublished: article.isPublished,
      featuredImage: article.featuredImage,
      featuredImageAlt: article.featuredImageAlt,
      viewCount: article.viewCount || 0,
    };

    await adminClient.saveObject({
      indexName: ARTICLES_INDEX,
      body: record,
    });
    
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
  if (!adminClient) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    await adminClient.deleteObject({
      indexName: ARTICLES_INDEX,
      objectID: articleId,
    });
    
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
  if (!adminClient) {
    console.error('[Algolia] Admin client not initialized');
    return;
  }

  try {
    await adminClient.saveObjects({
      indexName: ARTICLES_INDEX,
      objects: records as unknown as Array<Record<string, unknown>>,
    });
    
    console.log(`[Algolia] Bulk synced ${records.length} articles`);
  } catch (error) {
    console.error('[Algolia] Error bulk syncing articles:', error);
    throw error;
  }
}
