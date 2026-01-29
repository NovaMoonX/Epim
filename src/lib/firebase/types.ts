// Firestore document types
export interface App {
  id?: string;
  name: string;
  createdAt?: Date;
}

export interface Ticket {
  id?: string;
  appId: string;
  appName?: string;
  subject: string;
  description: string;
  creatorEmail: string;
  followUp: boolean;
  createdAt?: Date;
  status?: 'open' | 'in-progress' | 'resolved';
}
