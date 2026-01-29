# Epim

A centralized support ticket system for managing customer support and tracking improvements across multiple projects.

## Features

- 🎫 **Public Ticket Submission**: Guests can submit support tickets without authentication
- 🔐 **Hidden Admin Portal**: Secure admin-only access via `/admin` route
- 📊 **App Management**: Organize tickets by application/project
- 🎯 **Ticket Tracking**: Track ticket status (Open, In Progress, Resolved)
- 📧 **Follow-up Requests**: Optional follow-up flag for tickets requiring responses
- 🎨 **Modern UI**: Clean, responsive interface with Dreamer UI components
- 🌓 **Dark Mode**: Built-in theme toggle for user preference

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Library**: <a href="https://www.npmjs.com/package/@moondreamsdev/dreamer-ui">Dreamer UI</a>
- **Backend**: Google Firebase (Authentication, Firestore)
- **Routing**: React Router v7

## User Roles

### Guest (Unauthenticated)
- Submit support tickets via public form
- View list of available apps
- No account required

### Admin (nova@moondreams.dev)
- Manage applications (Create, Edit, Delete)
- View all tickets with filtering by app
- Update ticket status
- Delete tickets
- Access via hidden `/admin` route

## Setup

### Prerequisites

- Node.js 18+
- Firebase project with:
  - Authentication enabled (Email/Password provider)
  - Firestore database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NovaMoonX/Epim.git
   cd Epim
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. Create admin user in Firebase Console:
   - Navigate to Authentication
   - Add user with email: `nova@moondreams.dev`
   - Set a secure password

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Deploy

Deploy to Firebase Hosting:
```bash
npm run build
firebase deploy
```

## Usage

### For Guests

1. Visit the homepage
2. Click "Submit a Ticket"
3. Fill out the form:
   - Select an app from the dropdown
   - Enter subject and description
   - Provide your email
   - Optionally request a follow-up
4. Submit the ticket

### For Admin

1. Navigate to `/admin` (hidden from public interface)
2. Sign in with admin credentials (`nova@moondreams.dev`)
3. Access admin dashboard with two main sections:
   - **Apps**: Create, edit, and delete applications
   - **Tickets**: View, filter, update status, and delete tickets

## Firestore Schema

### Apps Collection
```typescript
interface App {
  id?: string;
  name: string;
  createdAt?: Date;
}
```

### Tickets Collection
```typescript
interface Ticket {
  id?: string;
  appId: string;
  appName?: string;
  subject: string;
  description: string;
  creatorEmail: string;
  followUp: boolean;
  status?: 'open' | 'in-progress' | 'resolved';
  createdAt?: Date;
}
```

## Security Rules

The included `firestore.rules` ensures:

**Apps Collection**:
- Anyone can read apps (for ticket submission dropdown)
- Only admin (`nova@moondreams.dev`) can create, update, or delete apps

**Tickets Collection**:
- Anyone can create tickets (public submission)
- Only admin can read, update, or delete tickets

See `FIREBASE_SETUP.md` for detailed security configuration.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── AuthButton.tsx  # (Admin only) Login/logout component
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Auth context definition
│   └── useAuthHook.ts  # Auth hook for components
├── lib/
│   ├── app/           # App constants
│   └── firebase/      # Firebase configuration and utilities
│       ├── config.ts      # Firebase initialization
│       ├── firestore.ts   # Firestore CRUD operations
│       ├── types.ts       # TypeScript interfaces
│       └── index.ts       # Exports
├── routes/            # Routing configuration
│   └── AppRoutes.tsx  # Route definitions
├── screens/           # Page components
│   ├── Home.tsx           # Landing page
│   ├── About.tsx          # About page
│   ├── SubmitTicket.tsx   # Public ticket form
│   ├── AdminLogin.tsx     # Admin login page
│   ├── AdminDashboard.tsx # Admin overview
│   ├── AdminApps.tsx      # App management
│   └── AdminTickets.tsx   # Ticket management
└── ui/                # Layout components
    ├── Layout.tsx         # Public layout
    ├── AdminLayout.tsx    # Admin layout
    └── ThemeToggle.tsx    # Dark/light mode toggle
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
