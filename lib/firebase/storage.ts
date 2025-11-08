import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { storage, auth } from './config';

/**
 * 画像をFirebase Storageにアップロード
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  console.log('[uploadImage] アップロード開始:', { fileName: file.name, size: file.size, path });
  
  if (!storage) {
    console.error('[uploadImage] Firebase Storage is not initialized');
    throw new Error('Firebase Storage is not initialized');
  }

  // 認証状態を確認
  const currentUser = auth?.currentUser;
  console.log('[uploadImage] 認証状態:', {
    isAuthenticated: !!currentUser,
    userId: currentUser?.uid,
    email: currentUser?.email
  });

  if (!currentUser) {
    console.error('[uploadImage] ユーザーが認証されていません');
    throw new Error('ユーザーが認証されていません。ログインしてください。');
  }

  console.log('[uploadImage] Storage初期化済み、認証OK、アップロード実行中...');
  console.log('[uploadImage] Storage bucket:', storage.app.options.storageBucket);

  try {
    const storageRef = ref(storage, path);
    console.log('[uploadImage] Storage参照作成完了:', storageRef.fullPath);
    
    const snapshot = await uploadBytes(storageRef, file);
    console.log('[uploadImage] アップロード完了、URL取得中...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('[uploadImage] URL取得完了:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('[uploadImage] アップロードエラー:', error);
    console.error('[uploadImage] エラーコード:', error?.code);
    console.error('[uploadImage] エラーメッセージ:', error?.message);
    console.error('[uploadImage] エラー詳細:', JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * 画像を削除
 */
export const deleteImage = async (path: string): Promise<void> => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * ファイル名から安全なパスを生成
 */
export const generateImagePath = (file: File, prefix: string = 'images'): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  return `${prefix}/${timestamp}_${randomString}.${extension}`;
};

