import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// User profile operations
export const createUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return userRef;
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  return userRef;
};

// Generic document operations
export const createDocument = async (collectionName: string, data: any, docId?: string) => {
  const collectionRef = collection(db, collectionName);
  const docRef = docId ? doc(collectionRef, docId) : doc(collectionRef);
  
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return docRef;
};

export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  return docRef;
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
  return docRef;
};

export const queryDocuments = async (
  collectionName: string, 
  conditions: Array<{ field: string, operator: string, value: any }> = [],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc',
  limitCount?: number
) => {
  const collectionRef = collection(db, collectionName);
  
  let q = query(collectionRef);
  
  // Apply where conditions
  conditions.forEach(condition => {
    q = query(q, where(condition.field, condition.operator as any, condition.value));
  });
  
  // Apply orderBy if specified
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection || 'asc'));
  }
  
  // Apply limit if specified
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const querySnapshot = await getDocs(q);
  const results: DocumentData[] = [];
  
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  
  return results;
};

// Helper to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp) => {
  return timestamp.toDate();
}; 