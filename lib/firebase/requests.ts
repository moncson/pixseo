import { 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { ArticleRequest } from '@/types/request';

/**
 * リクエストの送信
 */
export const submitRequest = async (
  requestData: Omit<ArticleRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const docRef = await addDoc(collection(db, 'requests'), {
      ...requestData,
      createdAt: Timestamp.now(),
      status: 'pending',
    });

    return docRef.id;
  } catch (error) {
    console.error('Error submitting request:', error);
    throw error;
  }
};

