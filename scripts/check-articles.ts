/**
 * 記事データ確認スクリプト
 * mediaId フィールドの有無を確認
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Firebase Admin SDKの初期化
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ エラー: serviceAccountKey.json が見つかりません');
  process.exit(1);
}

if (!admin.apps.length) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore();

async function checkArticles() {
  console.log('='.repeat(60));
  console.log('📊 記事データ確認');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 全記事を取得
    const articlesSnapshot = await adminDb.collection('articles').get();
    
    console.log(`総記事数: ${articlesSnapshot.size}`);
    console.log('');
    
    let withMediaId = 0;
    let withoutMediaId = 0;
    let published = 0;
    let unpublished = 0;
    
    console.log('記事一覧:');
    console.log('-'.repeat(60));
    
    articlesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const hasMediaId = !!data.mediaId;
      const isPublished = data.isPublished;
      
      if (hasMediaId) withMediaId++;
      else withoutMediaId++;
      
      if (isPublished) published++;
      else unpublished++;
      
      console.log(`[${index + 1}] ${doc.id}`);
      console.log(`    タイトル: ${data.title || 'N/A'}`);
      console.log(`    スラッグ: ${data.slug || 'N/A'}`);
      console.log(`    公開: ${isPublished ? '✅' : '❌'}`);
      console.log(`    mediaId: ${hasMediaId ? `✅ ${data.mediaId}` : '❌ なし'}`);
      console.log(`    viewCount: ${data.viewCount !== undefined ? data.viewCount : '❌ なし'}`);
      console.log(`    likeCount: ${data.likeCount !== undefined ? data.likeCount : '❌ なし'}`);
      console.log(`    publishedAt: ${data.publishedAt ? '✅' : '❌ なし'}`);
      console.log(`    全フィールド: ${Object.keys(data).join(', ')}`);
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('📈 サマリー');
    console.log('='.repeat(60));
    console.log(`総記事数: ${articlesSnapshot.size}`);
    console.log(`公開記事: ${published}`);
    console.log(`非公開記事: ${unpublished}`);
    console.log(`mediaId あり: ${withMediaId}`);
    console.log(`mediaId なし: ${withoutMediaId}`);
    console.log('');
    
    if (withoutMediaId > 0) {
      console.log('⚠️  mediaId がない記事があります！');
      console.log('   migrate:add-article-media-id スクリプトを実行してください。');
    } else {
      console.log('✅ すべての記事に mediaId が設定されています！');
    }
    
    console.log('');
    
    // メディアテナント一覧も表示
    console.log('='.repeat(60));
    console.log('📋 メディアテナント一覧');
    console.log('='.repeat(60));
    
    const tenantsSnapshot = await adminDb.collection('mediaTenants').get();
    
    tenantsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`[${index + 1}] ${doc.id}`);
      console.log(`    名前: ${data.name}`);
      console.log(`    スラッグ: ${data.slug}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

checkArticles()
  .then(() => {
    console.log('✅ 確認完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ エラー:', error);
    process.exit(1);
  });

