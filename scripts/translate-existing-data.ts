/**
 * 既存データの一括翻訳スクリプト
 * 
 * 実行方法:
 * npx ts-node scripts/translate-existing-data.ts
 */

import { adminDb } from '../lib/firebase/admin';
import { translateText, translateArticle, translateFAQs, generateAISummary } from '../lib/openai/translate';
import { SUPPORTED_LANGS } from '../types/lang';

async function translateExistingArticles() {
  console.log('📝 記事の翻訳を開始...');
  
  const articlesSnapshot = await adminDb.collection('articles').get();
  console.log(`   ${articlesSnapshot.size}件の記事を処理します`);
  
  for (const doc of articlesSnapshot.docs) {
    const data = doc.data();
    console.log(`\n   📄 ${data.title || '無題'} (${doc.id})`);
    
    try {
      const updateData: any = {};
      
      // 日本語フィールドを保存
      updateData.title_ja = data.title;
      updateData.content_ja = data.content;
      updateData.excerpt_ja = data.excerpt || '';
      updateData.metaTitle_ja = data.metaTitle || data.title;
      updateData.metaDescription_ja = data.metaDescription || data.excerpt || '';
      
      // AI summary生成（日本語）
      try {
        updateData.aiSummary_ja = await generateAISummary(data.content, 'ja');
      } catch (error) {
        console.error(`      ❌ AIサマリー生成エラー:`, error);
        updateData.aiSummary_ja = data.excerpt || '';
      }
      
      // FAQs（日本語）
      if (data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
        updateData.faqs_ja = data.faqs;
      }
      
      // 他言語への翻訳
      const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
      for (const lang of otherLangs) {
        console.log(`      🌐 ${lang} に翻訳中...`);
        try {
          const translated = await translateArticle({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt || '',
            metaTitle: data.metaTitle || data.title,
            metaDescription: data.metaDescription || data.excerpt || '',
          }, lang);
          
          updateData[`title_${lang}`] = translated.title;
          updateData[`content_${lang}`] = translated.content;
          updateData[`excerpt_${lang}`] = translated.excerpt;
          updateData[`metaTitle_${lang}`] = translated.metaTitle;
          updateData[`metaDescription_${lang}`] = translated.metaDescription;
          
          // AI summary生成
          try {
            updateData[`aiSummary_${lang}`] = await generateAISummary(translated.content, lang);
          } catch (error) {
            updateData[`aiSummary_${lang}`] = translated.excerpt;
          }
          
          // FAQs翻訳
          if (data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
            const translatedFAQs = await translateFAQs(data.faqs, lang);
            updateData[`faqs_${lang}`] = translatedFAQs;
          }
          
          console.log(`      ✅ ${lang} 翻訳完了`);
        } catch (error) {
          console.error(`      ❌ ${lang} 翻訳エラー:`, error);
          // エラーの場合は日本語をコピー
          updateData[`title_${lang}`] = data.title;
          updateData[`content_${lang}`] = data.content;
          updateData[`excerpt_${lang}`] = data.excerpt || '';
          updateData[`metaTitle_${lang}`] = data.metaTitle || data.title;
          updateData[`metaDescription_${lang}`] = data.metaDescription || data.excerpt || '';
          updateData[`aiSummary_${lang}`] = data.excerpt || '';
        }
      }
      
      // Firestoreを更新
      await adminDb.collection('articles').doc(doc.id).update(updateData);
      console.log(`   ✅ 更新完了`);
    } catch (error) {
      console.error(`   ❌ エラー:`, error);
    }
  }
  
  console.log('\n✅ 記事の翻訳が完了しました');
}

async function translateExistingCategories() {
  console.log('\n📁 カテゴリーの翻訳を開始...');
  
  const categoriesSnapshot = await adminDb.collection('categories').get();
  console.log(`   ${categoriesSnapshot.size}件のカテゴリーを処理します`);
  
  for (const doc of categoriesSnapshot.docs) {
    const data = doc.data();
    console.log(`\n   📁 ${data.name || '無題'} (${doc.id})`);
    
    try {
      const updateData: any = {};
      
      updateData.name_ja = data.name;
      updateData.description_ja = data.description || '';
      
      const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
      for (const lang of otherLangs) {
        console.log(`      🌐 ${lang} に翻訳中...`);
        try {
          updateData[`name_${lang}`] = await translateText(data.name, lang, 'カテゴリー名');
          if (data.description) {
            updateData[`description_${lang}`] = await translateText(data.description, lang, 'カテゴリー説明文');
          }
          console.log(`      ✅ ${lang} 翻訳完了`);
        } catch (error) {
          console.error(`      ❌ ${lang} 翻訳エラー:`, error);
          updateData[`name_${lang}`] = data.name;
          updateData[`description_${lang}`] = data.description || '';
        }
      }
      
      await adminDb.collection('categories').doc(doc.id).update(updateData);
      console.log(`   ✅ 更新完了`);
    } catch (error) {
      console.error(`   ❌ エラー:`, error);
    }
  }
  
  console.log('\n✅ カテゴリーの翻訳が完了しました');
}

async function translateExistingTags() {
  console.log('\n🏷️  タグの翻訳を開始...');
  
  const tagsSnapshot = await adminDb.collection('tags').get();
  console.log(`   ${tagsSnapshot.size}件のタグを処理します`);
  
  for (const doc of tagsSnapshot.docs) {
    const data = doc.data();
    console.log(`\n   🏷️  ${data.name || '無題'} (${doc.id})`);
    
    try {
      const updateData: any = {};
      
      updateData.name_ja = data.name;
      
      const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
      for (const lang of otherLangs) {
        console.log(`      🌐 ${lang} に翻訳中...`);
        try {
          updateData[`name_${lang}`] = await translateText(data.name, lang, 'タグ名');
          console.log(`      ✅ ${lang} 翻訳完了`);
        } catch (error) {
          console.error(`      ❌ ${lang} 翻訳エラー:`, error);
          updateData[`name_${lang}`] = data.name;
        }
      }
      
      await adminDb.collection('tags').doc(doc.id).update(updateData);
      console.log(`   ✅ 更新完了`);
    } catch (error) {
      console.error(`   ❌ エラー:`, error);
    }
  }
  
  console.log('\n✅ タグの翻訳が完了しました');
}

async function translateExistingWriters() {
  console.log('\n✍️  ライターの翻訳を開始...');
  
  const writersSnapshot = await adminDb.collection('writers').get();
  console.log(`   ${writersSnapshot.size}件のライターを処理します`);
  
  for (const doc of writersSnapshot.docs) {
    const data = doc.data();
    console.log(`\n   ✍️  ${data.handleName || '無題'} (${doc.id})`);
    
    try {
      const updateData: any = {};
      
      updateData.handleName_ja = data.handleName;
      updateData.bio_ja = data.bio || '';
      
      const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
      for (const lang of otherLangs) {
        console.log(`      🌐 ${lang} に翻訳中...`);
        try {
          updateData[`handleName_${lang}`] = await translateText(data.handleName, lang, 'ライター名');
          if (data.bio) {
            updateData[`bio_${lang}`] = await translateText(data.bio, lang, 'ライター自己紹介文');
          }
          console.log(`      ✅ ${lang} 翻訳完了`);
        } catch (error) {
          console.error(`      ❌ ${lang} 翻訳エラー:`, error);
          updateData[`handleName_${lang}`] = data.handleName;
          updateData[`bio_${lang}`] = data.bio || '';
        }
      }
      
      await adminDb.collection('writers').doc(doc.id).update(updateData);
      console.log(`   ✅ 更新完了`);
    } catch (error) {
      console.error(`   ❌ エラー:`, error);
    }
  }
  
  console.log('\n✅ ライターの翻訳が完了しました');
}

async function translateExistingSiteInfo() {
  console.log('\n🌐 サイト情報の翻訳を開始...');
  
  const tenantsSnapshot = await adminDb.collection('mediaTenants').get();
  console.log(`   ${tenantsSnapshot.size}件のサイトを処理します`);
  
  for (const doc of tenantsSnapshot.docs) {
    const data = doc.data();
    console.log(`\n   🌐 ${data.name || '無題'} (${doc.id})`);
    
    try {
      const updateData: any = {};
      
      updateData.name_ja = data.name;
      if (data.settings?.siteDescription) {
        updateData['settings.siteDescription_ja'] = data.settings.siteDescription;
      }
      
      const otherLangs = SUPPORTED_LANGS.filter(lang => lang !== 'ja');
      for (const lang of otherLangs) {
        console.log(`      🌐 ${lang} に翻訳中...`);
        try {
          updateData[`name_${lang}`] = await translateText(data.name, lang, 'サイト名');
          if (data.settings?.siteDescription) {
            updateData[`settings.siteDescription_${lang}`] = await translateText(data.settings.siteDescription, lang, 'サイト説明文');
          }
          console.log(`      ✅ ${lang} 翻訳完了`);
        } catch (error) {
          console.error(`      ❌ ${lang} 翻訳エラー:`, error);
          updateData[`name_${lang}`] = data.name;
          if (data.settings?.siteDescription) {
            updateData[`settings.siteDescription_${lang}`] = data.settings.siteDescription;
          }
        }
      }
      
      await adminDb.collection('mediaTenants').doc(doc.id).update(updateData);
      console.log(`   ✅ 更新完了`);
    } catch (error) {
      console.error(`   ❌ エラー:`, error);
    }
  }
  
  console.log('\n✅ サイト情報の翻訳が完了しました');
}

// メイン処理
async function main() {
  console.log('🚀 既存データの翻訳を開始します...\n');
  console.log('⚠️  この処理には時間がかかります。途中で中断しないでください。\n');
  
  try {
    await translateExistingCategories();
    await translateExistingTags();
    await translateExistingWriters();
    await translateExistingSiteInfo();
    await translateExistingArticles(); // 最後に記事を翻訳（最も時間がかかるため）
    
    console.log('\n\n✨ 全ての翻訳が完了しました！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();

