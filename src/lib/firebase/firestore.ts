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
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type { App, Ticket } from './types';

// Collection names
const APPS_COLLECTION = 'apps';
const TICKETS_COLLECTION = 'tickets';

// Helper to convert Firestore timestamp to Date
function convertTimestamp(data: DocumentData) {
  const result = { ...data };
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  
  return result;
}

// ==================== APPS ====================

export async function createApp(app: Omit<App, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, APPS_COLLECTION), {
    ...app,
    createdAt: Timestamp.now(),
  });
  
  return docRef.id;
}

export async function getApps(): Promise<App[]> {
  const q = query(collection(db, APPS_COLLECTION), orderBy('name'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = convertTimestamp(doc.data());
    return {
      id: doc.id,
      ...data,
    } as App;
  });
}

export async function getApp(id: string): Promise<App | null> {
  const docRef = doc(db, APPS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = convertTimestamp(docSnap.data());
    return {
      id: docSnap.id,
      ...data,
    } as App;
  }
  
  return null;
}

export async function updateApp(id: string, app: Partial<App>) {
  const docRef = doc(db, APPS_COLLECTION, id);
  await updateDoc(docRef, app);
}

export async function deleteApp(id: string) {
  const docRef = doc(db, APPS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ==================== TICKETS ====================

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
    ...ticket,
    status: 'open',
    createdAt: Timestamp.now(),
  });
  
  return docRef.id;
}

export async function getTickets(appId?: string): Promise<Ticket[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (appId) {
    constraints.unshift(where('appId', '==', appId));
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
