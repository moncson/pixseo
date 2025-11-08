import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from './config';
import { Tag } from '@/types/article';

export const getTags = async (): Promise<Tag[]> => {
  try {
    if (!db) {
      console.error('Firestore is not initialized');
      return [];
    }
    
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, orderBy('name', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Tag;
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
};

export const getTag = async (slug: string): Promise<Tag | null> => {
  try {
    if (!db) {
      console.error('Firestore is not initialized');
      return null;
    }
    
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
    } as Tag;
  } catch (error) {
    console.error('Error getting tag:', error);
    return null;
  }
};

// Alias for admin pages
export const getAllTags = getTags;

