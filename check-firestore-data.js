const admin = require('./functions/node_modules/firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function checkArticles() {
  console.log('=== Firestoreの記事を確認 ===\n');
  
  try {
    // 全記事を取得
    const allSnapshot = await db.collection('articles').get();
    console.log(`全記事数: ${allSnapshot.size}件\n`);
    
    if (allSnapshot.empty) {
      console.log('⚠️  記事が1件も登録されていません！');
      console.log('管理画面から記事を作成してください: https://ayumi-f6bd2-admin.web.app/admin/articles/new\n');
      return;
    }
    
    allSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`記事ID: ${doc.id}`);
      console.log(`  タイトル: ${data.title}`);
      console.log(`  スラッグ: ${data.slug}`);
      console.log(`  公開: ${data.isPublished ? '✅ はい' : '❌ いいえ'}`);
      if (data.publishedAt) {
        const date = data.publishedAt._seconds 
          ? new Date(data.publishedAt._seconds * 1000) 
          : new Date(data.publishedAt);
        console.log(`  公開日: ${date.toISOString()}`);
      } else {
        console.log(`  公開日: なし`);
      }
      console.log('');
    });
    
    // 公開済み記事を確認
    const publishedSnapshot = await db.collection('articles').where('isPublished', '==', true).get();
    console.log(`\n✅ 公開済み記事数: ${publishedSnapshot.size}件`);
    
    if (publishedSnapshot.size === 0) {
      console.log('\n⚠️  公開済みの記事がありません！');
      console.log('管理画面で記事を編集し、「公開する」チェックボックスをONにしてください。\n');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.error(error);
  }
}

checkArticles().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ エラー:', error);
  process.exit(1);
});

