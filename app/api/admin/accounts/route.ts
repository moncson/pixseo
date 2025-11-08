import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// アカウント一覧取得
export async function GET() {
  try {
    console.log('[API Accounts] アカウント一覧取得開始');
    
    const listUsersResult = await adminAuth.listUsers(1000); // 最大1000件
    
    // FirestoreからlogoUrlを取得
    const usersPromises = listUsersResult.users.map(async (user) => {
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        logoUrl: userData?.logoUrl || '',
        role: userData?.role || 'admin',
        mediaIds: userData?.mediaIds || [],
        createdAt: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      };
    });

    const users = await Promise.all(usersPromises);

    console.log('[API Accounts] 取得したアカウント数:', users.length);
    
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('[API Accounts] エラー:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// アカウント作成
export async function POST(request: Request) {
  try {
    console.log('[API Accounts] アカウント作成開始');
    
    const body = await request.json();
    const { email, password, displayName, logoUrl, mediaId } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Firebase Authenticationにユーザーを作成
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    console.log('[API Accounts] Firebase Auth作成成功:', userRecord.uid);

    // Firestoreのusersコレクションに保存
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName || '',
      logoUrl: logoUrl || '',
      role: 'admin',
      mediaIds: mediaId ? [mediaId] : [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log('[API Accounts] Firestore users作成成功');

    // mediaIdが指定されている場合、tenantsコレクションのmemberIdsに追加
    if (mediaId) {
      await adminDb.collection('mediaTenants').doc(mediaId).update({
        memberIds: FieldValue.arrayUnion(userRecord.uid),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log('[API Accounts] tenant memberIds更新成功');
    }

    console.log('[API Accounts] アカウント作成完了:', userRecord.uid);
    
    return NextResponse.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error: any) {
    console.error('[API Accounts] エラー:', error);
    return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 });
  }
}

