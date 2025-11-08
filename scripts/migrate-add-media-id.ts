/**
 * マイグレーションスクリプト：既存データへのmediaId追加
 * 
 * 実行方法：
 * npx ts-node scripts/migrate-add-media-id.ts
 * 
 * このスクリプトは以下を実行します：
 * 1. デフォルトメディアテナント「ふらっと。」を作成
 * 2. 既存の全記事、カテゴリー、タグ、バナー、メディアファイルにデフォルトmediaIdを付与
 */

import * as admin from 'firebase-admin';

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'pixseo-1eeef',
    storageBucket: 'pixseo-1eeef.firebasestorage.app',
  });
}

const db = admin.firestore();

async function main() {
  console.log('=== マイグレーション開始 ===\n');

  try {
    // ステップ1: デフォルトメディアテナント作成
    console.log('ステップ1: デフォルトメディアテナントを確認/作成中...');
    
    // 既存のテナントを確認
    const tenantsSnapshot = await db.collection('tenants').limit(1).get();
    
    let defaultTenantId: string;

    if (tenantsSnapshot.empty) {
      // デフォルトメディアを作成
      const defaultTenant = {
        name: 'PixSEO',
        slug: 'pixseo',
        subdomain: 'pixseo',
        customDomain: null,
        ownerId: 'default', // 後で実際のオーナーIDに更新してください
        memberIds: [],
        settings: {
          siteName: 'PixSEO',
          siteDescription: 'SEO特化型メディアプラットフォーム',
          logoUrl: '',
        },
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const tenantRef = await db.collection('tenants').add(defaultTenant);
      defaultTenantId = tenantRef.id;
      console.log(`✅ デフォルトメディア作成完了: ${defaultTenantId}`);
    } else {
      // 既存の最初のテナントを使用
      defaultTenantId = tenantsSnapshot.docs[0].id;
      console.log(`✅ 既存のメディアを使用: ${defaultTenantId}`);
    }

    console.log('');

    // ステップ2: 記事にmediaIdを追加
    console.log('ステップ2: 記事にmediaIdを追加中...');
    await addMediaIdToCollection('articles', defaultTenantId);

    // ステップ3: カテゴリーにmediaIdを追加
    console.log('ステップ3: カテゴリーにmediaIdを追加中...');
    await addMediaIdToCollection('categories', defaultTenantId);

    // ステップ4: タグにmediaIdを追加
    console.log('ステップ4: タグにmediaIdを追加中...');
    await addMediaIdToCollection('tags', defaultTenantId);

    // ステップ5: バナーにmediaIdを追加
    console.log('ステップ5: バナーにmediaIdを追加中...');
    await addMediaIdToCollection('banners', defaultTenantId);

    // ステップ6: メディアファイルにmediaIdを追加
    console.log('ステップ6: メディアファイルにmediaIdを追加中...');
    await addMediaIdToCollection('media', defaultTenantId);

    console.log('');
    console.log('=== マイグレーション完了 ===');
    console.log(`デフォルトメディアID: ${defaultTenantId}`);
    console.log('');
    console.log('⚠️  注意: デフォルトメディアのownerIdを実際の管理者UIDに更新してください');
    console.log('Firebase Consoleで手動更新するか、以下のコマンドを実行してください：');
    console.log(`firebase firestore:update tenants/${defaultTenantId} ownerId=<実際のUID>`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

async function addMediaIdToCollection(collectionName: string, mediaId: string) {
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`  ℹ️  ${collectionName}: データなし`);
    return;
  }

  const batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // 既にmediaIdが設定されている場合はスキップ
    if (data.mediaId) {
      continue;
    }

    batch.update(doc.ref, { mediaId });
    count++;
    batchCount++;

    // Firestoreのバッチは500件まで
    if (batchCount >= 500) {
      await batch.commit();
      console.log(`  📝 ${collectionName}: ${count}件更新中...`);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ ${collectionName}: 合計${count}件にmediaIdを追加`);
}

// 実行
main()
  .then(() => {
    console.log('✅ スクリプト終了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ スクリプトエラー:', error);
    process.exit(1);
  });

