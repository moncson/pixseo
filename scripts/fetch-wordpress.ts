/**
 * WordPress REST APIから記事を取得してJSON形式で保存するスクリプト
 * 
 * 使用方法:
 * npm run fetch-wordpress
 */

import * as fs from 'fs';
import * as path from 'path';

const WORDPRESS_URL = 'https://the-ayumi.jp';
const OUTPUT_FILE = path.join(__dirname, 'wordpress-export.json');

interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  author: number;
  categories: number[];
  tags: number[];
  featured_media: number;
  date: string;
  status: string;
  yoast_head_json?: {
    og_title?: string;
    og_description?: string;
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
}

interface WPMedia {
  id: number;
  source_url: string;
}

interface WPUser {
  id: number;
  name: string;
}

/**
 * WordPress REST APIからデータを取得
 */
async function fetchFromWordPress<T>(endpoint: string, page: number = 1, perPage: number = 100): Promise<T[]> {
  const url = `${WORDPRESS_URL}/wp-json/wp/v2/${endpoint}?per_page=${perPage}&page=${page}`;
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 400 && page > 1) {
        // ページが存在しない場合は空配列を返す
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as T[];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

/**
 * 全ページのデータを取得
 */
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;
  
  while (true) {
    const data = await fetchFromWordPress<T>(endpoint, page);
    
    if (data.length === 0) {
      break;
    }
    
    allData.push(...data);
    console.log(`Fetched ${allData.length} items from ${endpoint}`);
    
    page++;
    
    // 安全のため、最大50ページまで
    if (page > 50) {
      console.warn(`Reached maximum page limit (50) for ${endpoint}`);
      break;
    }
  }
  
  return allData;
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('Starting WordPress data fetch...');
    console.log(`WordPress URL: ${WORDPRESS_URL}`);
    
    // カテゴリーを取得
    console.log('\nFetching categories...');
    const categories = await fetchAllPages<WPCategory>('categories');
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    console.log(`Found ${categories.length} categories`);
    
    // タグを取得
    console.log('\nFetching tags...');
    const tags = await fetchAllPages<WPTag>('tags');
    const tagMap = new Map(tags.map(tag => [tag.id, tag.name]));
    console.log(`Found ${tags.length} tags`);
    
    // ユーザー（著者）を取得
    console.log('\nFetching users...');
    const users = await fetchAllPages<WPUser>('users');
    const userMap = new Map(users.map(user => [user.id, user.name]));
    console.log(`Found ${users.length} users`);
    
    // 記事を取得
    console.log('\nFetching posts...');
    const posts = await fetchAllPages<WPPost>('posts');
    console.log(`Found ${posts.length} posts`);
    
    // アイキャッチ画像を取得
    console.log('\nFetching featured images...');
    const mediaIds = [...new Set(posts.map(post => post.featured_media).filter(id => id > 0))];
    const mediaMap = new Map<number, string>();
    
    for (const mediaId of mediaIds) {
      try {
        const mediaData = await fetchFromWordPress<WPMedia>(`media/${mediaId}`, 1, 1);
        if (mediaData.length > 0) {
          mediaMap.set(mediaId, mediaData[0].source_url);
        }
      } catch (error) {
        console.error(`Error fetching media ${mediaId}:`, error);
      }
    }
    console.log(`Found ${mediaMap.size} images`);
    
    // 移行用のJSON形式に変換
    console.log('\nConverting to migration format...');
    const exportData = posts.map(post => {
      // HTMLタグを除去してプレーンテキストに
      const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>/g, '').trim();
      };
      
      return {
        title: stripHtml(post.title.rendered),
        content: post.content.rendered,
        excerpt: stripHtml(post.excerpt.rendered),
        slug: post.slug,
        author: userMap.get(post.author) || 'Unknown',
        categories: post.categories.map(catId => categoryMap.get(catId)).filter(Boolean) as string[],
        tags: post.tags.map(tagId => tagMap.get(tagId)).filter(Boolean) as string[],
        featuredImage: mediaMap.get(post.featured_media) || '',
        publishedAt: post.date,
        isPublished: post.status === 'publish',
        metaTitle: post.yoast_head_json?.og_title || stripHtml(post.title.rendered),
        metaDescription: post.yoast_head_json?.og_description || stripHtml(post.excerpt.rendered),
      };
    });
    
    // JSONファイルに保存
    console.log('\nSaving to file...');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log(`\n✅ Success! Exported ${exportData.length} posts to ${OUTPUT_FILE}`);
    console.log('\nNext steps:');
    console.log('1. Review the exported data in scripts/wordpress-export.json');
    console.log('2. Run: npm run migrate');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();

