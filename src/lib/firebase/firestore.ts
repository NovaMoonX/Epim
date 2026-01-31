import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { Product, Ticket } from './types';

// Collection names
const PRODUCTS_COLLECTION = 'products';
const TICKETS_COLLECTION = 'tickets';

// Helper to convert timestamps
function convertTimestamp(data: DocumentData) {
  const result = { ...data };
  
  // Convert addedAt if it's a Firestore Timestamp
  if (result.addedAt && typeof result.addedAt.toMillis === 'function') {
    result.addedAt = result.addedAt.toMillis();
  }
  
  // Convert createdAt if it's a Firestore Timestamp
  if (result.createdAt && typeof result.createdAt.toMillis === 'function') {
    result.createdAt = result.createdAt.toMillis();
  }
  
  return result;
}

// ==================== PRODUCTS ====================

export async function createProduct(product: Omit<Product, 'id' | 'addedAt'>) {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    addedAt: Date.now(),
  });
  
  return docRef.id;
}

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return {
      id: doc.id,
      ...data,
    } as Product;
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = convertTimestamp(docSnap.data());
    return {
      id: docSnap.id,
      ...data,
    } as Product;
  }
  
  return null;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, product);
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ==================== TICKETS ====================

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
    ...ticket,
    status: 'open',
    createdAt: Date.now(),
  });
  
  return docRef.id;
}

export async function getTickets(productId?: string): Promise<Ticket[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (productId) {
    constraints.unshift(where('productId', '==', productId));
  }
  
  const q = query(collection(db, TICKETS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return {
      id: doc.id,
      ...data,
    } as Ticket;
  });
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const docRef = doc(db, TICKETS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = convertTimestamp(docSnap.data());
    return {
      id: docSnap.id,
      ...data,
    } as Ticket;
  }
  
  return null;
}

export async function updateTicket(id: string, ticket: Partial<Ticket>) {
  const docRef = doc(db, TICKETS_COLLECTION, id);
  await updateDoc(docRef, ticket);
}

export async function deleteTicket(id: string) {
  const docRef = doc(db, TICKETS_COLLECTION, id);
  await deleteDoc(docRef);
}
