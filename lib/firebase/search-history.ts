import { 
  collection, 
  doc,
  getDocs, 
  getDoc,
  setDoc,
  query, 
  orderBy, 
  limit as firestoreLimit,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { SearchHistory } from '@/types/search';

/**
 * 検索履歴を記録
 */
export const recordSearch = async (keyword: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    // キーワードを正規化（小文字化、前後の空白削除）
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return;

    const searchRef = doc(db, 'searchHistory', normalizedKeyword);
    const searchDoc = await getDoc(searchRef);

    if (searchDoc.exists()) {
      // 既存のキーワードの場合、カウントを増やす
      await setDoc(searchRef, {
        count: increment(1),
        lastSearchedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // 新規キーワードの場合
      await setDoc(searchRef, {
        keyword: normalizedKeyword,
        count: 1,
        lastSearchedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error recording search:', error);
    // エラーが発生しても検索自体は継続
  }
};

/**
 * 人気の検索キーワードを取得
 */
export const getPopularKeywords = async (limitCount: number = 10): Promise<SearchHistory[]> => {
  if (!db) {
    console.error('Firestore is not initialized');
    return [];
  }

  try {
    const searchRef = collection(db, 'searchHistory');
    const q = query(
      searchRef,
      orderBy('count', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        keyword: data.keyword,
        count: data.count,
        lastSearchedAt: data.lastSearchedAt?.toDate() || new Date(),
      } as SearchHistory;
    });
  } catch (error) {
    console.error('Error getting popular keywords:', error);
    return [];
  }
};

/**
 * 最近検索されたキーワードを取得
 */
export const getRecentKeywords = async (limitCount: number = 10): Promise<SearchHistory[]> => {
  if (!db) {
    console.error('Firestore is not initialized');
    return [];
  }

  try {
    const searchRef = collection(db, 'searchHistory');
    const q = query(
      searchRef,
      orderBy('lastSearchedAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        keyword: data.keyword,
        count: data.count,
        lastSearchedAt: data.lastSearchedAt?.toDate() || new Date(),
      } as SearchHistory;
    });
  } catch (error) {
    console.error('Error getting recent keywords:', error);
    return [];
  }
};

