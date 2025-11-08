import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './config';
import { Category } from '@/types/article';

export const getCategories = async (
  options: {
    isRecommended?: boolean;
  } = {}
): Promise<Category[]> => {
  try {
    if (!db) {
      console.error('Firestore is not initialized');
      return [];
    }
    
    const categoriesRef = collection(db, 'categories');
    let q = query(categoriesRef);
    
    if (options.isRecommended) {
      q = query(q, where('isRecommended', '==', true));
    }
    
    q = query(q, orderBy('order', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Category;
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategory = async (slug: string): Promise<Category | null> => {
  try {
    if (!db) {
      console.error('Firestore is not initialized');
      return null;
    }
    
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
    } as Category;
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
};

// Alias for admin pages
export const getAllCategories = getCategories;


