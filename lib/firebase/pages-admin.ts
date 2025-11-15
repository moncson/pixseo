import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, initializeFirebase } from './config';
import { Page } from '@/types/page';

// クライアント側でFirebaseを初期化
if (typeof window !== 'undefined') {
  initializeFirebase();
}

/**
 * 固定ページの作成
 */
export const createPage = async (pageData: Omit<Page, 'id' | 'publishedAt' | 'updatedAt'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'pages'), {
      ...pageData,
      publishedAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
};

/**
 * 固定ページの更新
 */
export const updatePage = async (id: string, pageData: Partial<Page>): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const pageRef = doc(db, 'pages', id);
    await updateDoc(pageRef, {
      ...pageData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating page:', error);
    throw error;
  }
};

/**
 * 固定ページの削除
 */
export const deletePage = async (id: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const pageRef = doc(db, 'pages', id);
    await deleteDoc(pageRef);
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};

/**
 * 固定ページの取得（ID指定）
 */
export const getPageById = async (id: string): Promise<Page | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const pageRef = doc(db, 'pages', id);
    const pageSnap = await getDoc(pageRef);

    if (!pageSnap.exists()) {
      return null;
    }

    const data = pageSnap.data();
    
    return {
      id: pageSnap.id,
      ...data,
      publishedAt: data.publishedAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Page;
  } catch (error) {
    console.error('Error getting page:', error);
    throw error;
  }
};

/**
 * 固定ページ一覧の取得
 */
export const getPages = async (mediaId?: string): Promise<Page[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const pagesRef = collection(db, 'pages');
    let q = query(pagesRef, orderBy('order', 'asc'));
    
    // mediaIdでフィルタリング（指定がある場合）
    if (mediaId) {
      q = query(pagesRef, where('mediaId', '==', mediaId), orderBy('order', 'asc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Page;
    });
  } catch (error) {
    console.error('Error getting pages:', error);
    throw error;
  }
};

