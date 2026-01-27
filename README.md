# Epim

A comprehensive customer support and bug tracking system for managing tickets across multiple projects.

## Features

### Customer Support Portal
- Submit support tickets with app selection, category (Billing, Bug, Help), and priority
- Track ticket status (Open, Pending, Resolved)
- Upload screenshots and screen recordings
- View ticket history and comments
- Email notifications for ticket updates

### Internal Tester Portal
- Advanced bug reporting with OS, Browser, Version, and Environment details
- System log upload (.log, .json files)
- Priority tagging (Blocker, High, Medium, Low)
- Tester dashboard with bug status tracking
- Internal-only comment threads for technical discussions

### Admin Dashboard (nova@moondreams.dev only)
- Global command center for all tickets across all apps
- Filter by ticket type (Customer vs Internal)
- Universal search by ID, email, or keywords
- Role management (promote users to Internal Tester)
- App Registry management (supports infinite apps)
- Bulk actions for status updates
- Resolution analytics with per-app statistics
- Audit log viewer with change history

### Knowledge Base
- Public searchable FAQ section
- Filter by app
- Track FAQ views
- Organized by category

## Tech Stack

- [React](https://react.dev/) 19.2.0
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/) 4.x
- [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) 1.7.26
- [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- [Vite](https://vitejs.dev/) 7.x

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled

### 1. Clone the repository
```bash
git clone https://github.com/NovaMoonX/Epim.git
cd Epim
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication in Authentication > Sign-in method
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase config

### 4. Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Firestore Security Rules
Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to apps for all authenticated users
    match /apps/{appId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'nova@moondreams.dev';
    }
    
    // Users can read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.token.email == 'nova@moondreams.dev';
    }
    
    // Tickets access
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Comments access
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // FAQs are public
    match /faqs/{faqId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'nova@moondreams.dev';
    }
    
    // Audit logs - admin only
    match /auditLogs/{logId} {
      allow read: if request.auth != null && request.auth.token.email == 'nova@moondreams.dev';
      allow create: if request.auth != null;
    }
  }
}
```

### 6. Storage Rules
Add these storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tickets/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /logs/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 8. Build for Production
```bash
npm run build
npm run preview
```

## Deployment

Deploy to Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Admin Access

The admin dashboard is **restricted to nova@moondreams.dev**. This is enforced with:
- Client-side route protection
- Server-side email validation in ProtectedRoute component
- Firestore security rules

To change the admin email, update:
1. `/src/components/ProtectedRoute.tsx` - line checking for admin email
2. `/src/hooks/useAuth.tsx` - role assignment logic
3. Firestore security rules

## Database Schema

### Collections

- **apps**: App registry with infinite scalability
- **users**: User profiles with role (customer, tester, admin)
- **tickets**: Support tickets and bug reports
- **comments**: Thread comments on tickets
- **faqs**: Knowledge base articles
- **auditLogs**: Change history

## Role-Based Access Control

- **Customer**: Submit tickets, view own tickets, access knowledge base
- **Tester**: All customer permissions + submit bug reports, internal comments
- **Admin** (nova@moondreams.dev only): All permissions + user management, app registry, analytics, audit logs

## Color Scheme

The UI uses a consumer-friendly color palette:
- **Primary**: Blue (var(--color-blue-500))
- **Secondary**: Sky Blue (var(--color-sky-100))
- **Accent**: Teal (var(--color-teal-500))
- **Success**: Emerald
- **Warning**: Amber
- **Destructive**: Rose

## License

MIT
