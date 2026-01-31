// Firestore document types
export interface Product {
  id: string;
  name: string;
  shortDescription?: string | null;
  siteUrl?: string | null;
  addedAt: number; // timestamp in milliseconds
}

export type TicketCategory = 'general-question' | 'bug' | 'feature-request' | 'financial';

export interface Ticket {
  id?: string;
  productId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  creatorName?: string;
  creatorEmail: string;
  followUp: boolean;
  createdAt: number; // timestamp in milliseconds
  status?: 'open' | 'in-progress' | 'resolved';
}
