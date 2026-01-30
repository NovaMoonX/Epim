// Firestore document types
export interface Product {
  id?: string;
  name: string;
  createdAt?: Date;
}

export type TicketCategory = 'general-question' | 'bug' | 'feature-request' | 'financial';

export interface Ticket {
  id?: string;
  productId: string;
  productName?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  creatorEmail: string;
  followUp: boolean;
  createdAt?: Date;
  status?: 'open' | 'in-progress' | 'resolved';
}
