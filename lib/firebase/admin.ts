import * as admin from 'firebase-admin';

// Firebase Admin SDKの初期化（サーバーサイド用）
if (!admin.apps.length) {
  // Vercel環境: サービスアカウントキーを環境変数から読み込む
  // ローカル環境: ADC（Application Default Credentials）を使用
  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    : admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
    projectId: 'ayumi-f6bd2',
    storageBucket: 'ayumi-f6bd2.firebasestorage.app',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();


