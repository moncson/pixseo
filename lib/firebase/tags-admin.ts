import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Tag } from '@/types/article';

/**
 * タグの作成
 */
export const createTag = async (tagData: Omit<Tag, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = await addDoc(collection(db, 'tags'), {
      ...tagData,
      searchCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * タグの更新
 */
export const updateTag = async (id: string, tagData: Partial<Tag>): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const tagRef = doc(db, 'tags', id);
    await updateDoc(tagRef, tagData);
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * タグの削除
 */
export const deleteTag = async (id: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const tagRef = doc(db, 'tags', id);
    await deleteDoc(tagRef);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

/**
 * タグの取得（ID指定）
 */
export const getTagById = async (id: string): Promise<Tag | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const tagRef = doc(db, 'tags', id);
    const tagSnap = await getDoc(tagRef);

    if (!tagSnap.exists()) {
      return null;
    }

    return {
      id: tagSnap.id,
      ...tagSnap.data(),
    } as Tag;
  } catch (error) {
    console.error('Error getting tag:', error);
    throw error;
  }
};

/**
 * 全タグの取得（管理画面用）
 */
export const getAllTagsAdmin = async (): Promise<Tag[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Tag));
  } catch (error) {
    console.error('Error getting all tags:', error);
    throw error;
  }
};

