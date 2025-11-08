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
import { Category } from '@/types/article';

/**
 * カテゴリーの作成
 */
export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * カテゴリーの更新
 */
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, categoryData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * カテゴリーの削除
 */
export const deleteCategory = async (id: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * カテゴリーの取得（ID指定）
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const categoryRef = doc(db, 'categories', id);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      return null;
    }

    return {
      id: categorySnap.id,
      ...categorySnap.data(),
    } as Category;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

/**
 * 全カテゴリーの取得（管理画面用）
 */
export const getAllCategoriesAdmin = async (): Promise<Category[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw error;
  }
};

