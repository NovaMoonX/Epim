# Firebase Setup Guide

This document provides instructions for setting up Firebase for the Epim support system.

## Prerequisites

- A Firebase account (https://firebase.google.com/)
- Node.js installed
- The Epim project cloned locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project, navigate to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Create an admin user with email: `nova@moondreams.dev`

## Step 3: Create Firestore Database

1. Navigate to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in production mode** (we'll deploy security rules)
4. Select your preferred region

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Epim Web")
5. Copy the Firebase configuration values

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env` in the root of the project:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 6: Deploy Firestore Security Rules

The project includes Firestore security rules in `firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

Or manually paste the rules from `firestore.rules` into the Firestore Rules editor in the Firebase Console.

## Step 7: Run the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown (typically http://localhost:5173)

## Admin Access

- **Email**: nova@moondreams.dev
- **Password**: Set this when creating the user in Firebase Authentication

The admin user has access to:
- App Management (`/admin/apps`)
- Ticket Feed (`/admin/tickets`)

## Guest Access

Guests (unauthenticated users) can:
- View the homepage
- Submit support tickets
- View the list of available apps in the ticket submission form

## Security Rules Summary

The deployed security rules ensure:
- **Apps**: Anyone can read, only admin can write
- **Tickets**: Anyone can create, only admin can read/update/delete

## Production Deployment

When deploying to production:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## Troubleshooting

### Firebase Connection Issues

If you see connection errors in the console:
- Verify your API key and project ID in `.env`
- Check that your Firebase project is active
- Ensure Firestore is enabled in the Firebase Console

### Authentication Issues

- Verify the admin email is exactly `nova@moondreams.dev`
- Check that Email/Password authentication is enabled
- Clear browser cache and cookies if login fails

### CORS Issues

If you encounter CORS errors:
- Make sure you're running on the correct origin (localhost for development)
- Add your production domain to Firebase Authentication's authorized domains
