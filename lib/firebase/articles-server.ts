import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { adminDb } from './admin';
import { Article } from '@/types/article';

// FirestoreのTimestampをDateに変換
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// 記事を取得（サーバーサイド用）
export const getArticleServer = async (slug: string, mediaId?: string): Promise<Article | null> => {
  try {
    const articlesRef = adminDb.collection('articles');
    let query = articlesRef
      .where('slug', '==', slug)
      .where('isPublished', '==', true);
    
    // mediaIdが指定されている場合はフィルタリング
    if (mediaId) {
      query = query.where('mediaId', '==', mediaId) as any;
    }
    
    const snapshot = await query.limit(1).get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      publishedAt: convertTimestamp(data.publishedAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Article;
  } catch (error) {
    console.error('Error getting article:', error);
    return null;
  }
};

// 記事一覧を取得（サーバーサイド用）
export const getArticlesServer = async (
  options: {
    limit?: number;
    categoryId?: string;
    tagId?: string;
    mediaId?: string;
    orderBy?: 'publishedAt' | 'viewCount' | 'likeCount';
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<Article[]> => {
  try {
    console.log('[getArticlesServer] Fetching articles with options:', options);
    const articlesRef = adminDb.collection('articles');
    
    // まず全記事数を確認
    const allSnapshot = await articlesRef.get();
    console.log('[getArticlesServer] Total articles in DB:', allSnapshot.size);
    
    // 公開済み記事を確認
    const publishedSnapshot = await articlesRef.where('isPublished', '==', true).get();
    console.log('[getArticlesServer] Published articles:', publishedSnapshot.size);
    
    let q = articlesRef.where('isPublished', '==', true);
    
    // mediaIdが指定されている場合はフィルタリング
    if (options.mediaId) {
      q = q.where('mediaId', '==', options.mediaId) as any;
    }
    
    if (options.categoryId) {
      q = q.where('categoryIds', 'array-contains', options.categoryId) as any;
    }
    
    if (options.tagId) {
      q = q.where('tagIds', 'array-contains', options.tagId) as any;
    }
    
    const orderField = options.orderBy || 'publishedAt';
    const orderDir = options.orderDirection || 'desc';
    q = q.orderBy(orderField, orderDir) as any;
    
    const limitCount = options.limit || 30;
    const snapshot = await q.limit(limitCount).get();
    
    console.log('[getArticlesServer] Articles fetched:', snapshot.size);
    
    const articles = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('[getArticlesServer] Article:', {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        isPublished: data.isPublished,
      });
      return {
        id: doc.id,
        ...data,
        publishedAt: convertTimestamp(data.publishedAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Article;
    });
    
    console.log('[getArticlesServer] Returning', articles.length, 'articles');
    return articles;
  } catch (error) {
    console.error('Error getting articles:', error);
    return [];
  }
};

// 新着記事を取得（サーバーサイド用）
export const getRecentArticlesServer = async (limitCount: number = 10): Promise<Article[]> => {
  return getArticlesServer({
    orderBy: 'publishedAt',
    orderDirection: 'desc',
    limit: limitCount,
  });
};

// 人気記事を取得（サーバーサイド用）
export const getPopularArticlesServer = async (limitCount: number = 10): Promise<Article[]> => {
  return getArticlesServer({
    orderBy: 'viewCount',
    orderDirection: 'desc',
    limit: limitCount,
  });
};

// 関連記事を取得（サーバーサイド用）
export const getRelatedArticlesServer = async (
  excludeArticleId: string,
  categoryIds: string[],
  tagIds: string[],
  limitCount: number = 6
): Promise<Article[]> => {
  try {
    const articlesRef = adminDb.collection('articles');
    const snapshot = await articlesRef
      .where('isPublished', '==', true)
      .orderBy('publishedAt', 'desc')
      .limit(limitCount * 2)
      .get();
    
    const articles = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishedAt: convertTimestamp(data.publishedAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Article;
      })
      .filter((article) => article.id !== excludeArticleId)
      .map((article) => {
        const categoryMatch = article.categoryIds.filter((id: string) =>
          categoryIds.includes(id)
        ).length;
        const tagMatch = article.tagIds.filter((id: string) =>
          tagIds.includes(id)
        ).length;
        return {
          ...article,
          relevanceScore: categoryMatch * 2 + tagMatch,
        };
      })
      .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
      .slice(0, limitCount)
      .map(({ relevanceScore, ...article }) => article);
    
    return articles;
  } catch (error) {
    console.error('Error getting related articles:', error);
    return [];
  }
};


