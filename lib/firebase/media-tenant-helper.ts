/**
 * MediaTenant関連のヘルパー関数（キャッシュ付き）
 * generateMetadata と ArticlePage で共通利用
 */

import { headers } from 'next/headers';
import { adminDb } from './admin';
import { cacheManager } from '../cache-manager';

/**
 * ホスト名からmediaIdを取得（キャッシュ付き）
 * @returns mediaId | null
 */
export async function getMediaIdFromHost(): Promise<string | null> {
  try {
    const headersList = headers();
    const mediaIdFromHeader = headersList.get('x-media-id');
    const host = headersList.get('host') || '';

    // ヘッダーから直接取得できた場合
    if (mediaIdFromHeader) {
      return mediaIdFromHeader;
    }

    // ホスト名が admin.pixseo.cloud の場合は null
    if (!host.endsWith('.pixseo.cloud') || host === 'admin.pixseo.cloud') {
      return null;
    }

    // スラッグを抽出
    const slug = host.replace('.pixseo.cloud', '');

    // キャッシュキー
    const cacheKey = `mediaId:${slug}`;

    // キャッシュから取得（5分間有効）
    const cachedMediaId = cacheManager.get<string>(cacheKey, 5 * 60 * 1000);
    if (cachedMediaId) {
      return cachedMediaId;
    }

    // Firestoreから取得
    const tenantsSnapshot = await adminDb
      .collection('mediaTenants')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (tenantsSnapshot.empty) {
      return null;
    }

    const mediaId = tenantsSnapshot.docs[0].id;

    // キャッシュに保存
    cacheManager.set(cacheKey, mediaId);

    return mediaId;
  } catch (error) {
    console.error('[getMediaIdFromHost] Error:', error);
    return null;
  }
}

/**
 * mediaIdからサイト情報を取得（キャッシュ付き）
 * @param mediaId 
 * @returns { allowIndexing: boolean, name: string }
 */
export async function getSiteInfo(mediaId: string): Promise<{
  allowIndexing: boolean;
  name: string;
}> {
  const defaultInfo = {
    allowIndexing: false,
    name: 'ふらっと。',
  };

  if (!mediaId) {
    return defaultInfo;
  }

  try {
    // キャッシュキー
    const cacheKey = `siteInfo:${mediaId}`;

    // キャッシュから取得（5分間有効）
    const cachedInfo = cacheManager.get<{ allowIndexing: boolean; name: string }>(
      cacheKey,
      5 * 60 * 1000
    );
    if (cachedInfo) {
      return cachedInfo;
    }

    // Firestoreから取得
    const tenantDoc = await adminDb.collection('mediaTenants').doc(mediaId).get();
    
    if (!tenantDoc.exists) {
      return defaultInfo;
    }

    const data = tenantDoc.data();
    const siteInfo = {
      allowIndexing: data?.allowIndexing || false,
      name: data?.name || defaultInfo.name,
    };

    // キャッシュに保存
    cacheManager.set(cacheKey, siteInfo);

    return siteInfo;
  } catch (error) {
    console.error('[getSiteInfo] Error:', error);
    return defaultInfo;
  }
}

