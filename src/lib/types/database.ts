import { Timestamp } from 'firebase/firestore';

export type TicketCategory = 'Billing' | 'Bug' | 'Help';
export type TicketPriority = 'Blocker' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'Pending' | 'Resolved';
export type TicketType = 'customer' | 'internal';
export type Environment = 'Staging' | 'Production';
export type UserRole = 'customer' | 'tester' | 'admin';

export interface App {
  id: string;
  name: string;
  apiKey: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Ticket {
  id: string;
  type: TicketType;
  appId: string;
  userId: string;
  userEmail: string;
  userName: string;
  
  // Common fields
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  
  // Customer support specific
  mediaUrls?: string[];
  
  // Internal tester specific
  os?: string;
  browser?: string;
  appVersion?: string;
  environment?: Environment;
  logFileUrl?: string;
  fixedInBuild?: string;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userEmail: string;
  userName: string;
  text: string;
  isInternal: boolean; // Internal-only comments for testers/admins
  createdAt: Timestamp;
}

export interface AuditLog {
  id: string;
  ticketId: string;
  userId: string;
  userEmail: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Timestamp;
}

export interface FAQ {
  id: string;
  appId: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
