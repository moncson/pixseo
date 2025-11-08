/**
 * WordPressからFirestoreへの記事移行スクリプト
 * 
 * 使用方法:
 * 1. WordPressから記事をJSON形式でエクスポート
 * 2. エクスポートしたJSONファイルをscripts/wordpress-export.jsonとして保存
 * 3. npm run migrate を実行
 * 
 * JSONフォーマット:
 * [
 *   {
 *     "title": "記事タイトル",
 *     "content": "記事本文（HTML）",
 *     "excerpt": "抜粋",
 *     "slug": "article-slug",
 *     "author": "著者名",
 *     "categories": ["カテゴリー1", "カテゴリー2"],
 *     "tags": ["タグ1", "タグ2"],
 *     "featuredImage": "画像URL",
 *     "publishedAt": "2024-01-01T00:00:00Z",
 *     "isPublished": true
 *   }
 * ]
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

interface WordPressArticle {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  publishedAt: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * カテゴリーを作成または取得
 */
async function getOrCreateCategory(name: string): Promise<string> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  // 既存のカテゴリーを検索
  const categoriesRef = db.collection('categories');
  const querySnapshot = await categoriesRef.where('slug', '==', slug).get();
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  
  // 新規作成
  const docRef = await categoriesRef.add({
    name,
    slug,
    description: '',
    isRecommended: false,
    order: 0,
  });
  
  console.log(`Created category: ${name} (${docRef.id})`);
  return docRef.id;
}

/**
 * タグを作成または取得
 */
async function getOrCreateTag(name: string): Promise<string> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  // 既存のタグを検索
  const tagsRef = db.collection('tags');
  const querySnapshot = await tagsRef.where('slug', '==', slug).get();
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  
  // 新規作成
  const docRef = await tagsRef.add({
    name,
    slug,
    searchCount: 0,
  });
  
  console.log(`Created tag: ${name} (${docRef.id})`);
  return docRef.id;
}

/**
 * 記事を移行
 */
async function migrateArticle(article: WordPressArticle): Promise<void> {
  try {
    // カテゴリーIDを取得
    const categoryIds = await Promise.all(
      article.categories.map((cat) => getOrCreateCategory(cat))
    );
    
    // タグIDを取得
    const tagIds = await Promise.all(
      article.tags.map((tag) => getOrCreateTag(tag))
    );
    
    // 記事を作成
    const articlesRef = db.collection('articles');
    
    // 既存の記事をチェック（スラッグで検索）
    const existingArticles = await articlesRef.where('slug', '==', article.slug).get();
    
    if (!existingArticles.empty) {
      console.log(`Article already exists: ${article.title} (${article.slug})`);
      return;
    }
    
    // 新規作成
    await articlesRef.add({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      slug: article.slug,
      publishedAt: admin.firestore.Timestamp.fromDate(new Date(article.publishedAt)),
      updatedAt: admin.firestore.Timestamp.now(),
      authorId: 'wordpress-migration',
      authorName: article.author,
      categoryIds,
      tagIds,
      featuredImage: article.featuredImage || '',
      isPublished: article.isPublished,
      viewCount: 0,
      likeCount: 0,
      metaTitle: article.metaTitle || article.title,
      metaDescription: article.metaDescription || article.excerpt || '',
    });
    
    console.log(`Migrated article: ${article.title} (${article.slug})`);
  } catch (error) {
    console.error(`Error migrating article: ${article.title}`, error);
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    // JSONファイルを読み込み
    const jsonPath = path.join(__dirname, 'wordpress-export.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('Error: wordpress-export.json not found');
      console.log('Please create scripts/wordpress-export.json with your WordPress articles');
      process.exit(1);
    }
    
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const articles: WordPressArticle[] = JSON.parse(data);
    
    console.log(`Found ${articles.length} articles to migrate`);
    
    // 記事を1つずつ移行
    for (const article of articles) {
      await migrateArticle(article);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();

