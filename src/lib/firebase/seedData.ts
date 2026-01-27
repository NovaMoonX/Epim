/**
 * Sample data seeding script for development
 * Run this after setting up Firebase to populate initial data
 */

import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function seedSampleData() {
  try {
    console.log('Starting to seed sample data...');

    // Add sample apps
    const app1 = await addDoc(collection(db, 'apps'), {
      name: 'My Awesome App',
      apiKey: 'app_' + Math.random().toString(36).substring(2, 15),
      createdAt: Timestamp.now(),
      createdBy: 'nova@moondreams.dev',
    });

    const app2 = await addDoc(collection(db, 'apps'), {
      name: 'Cool Project',
      apiKey: 'app_' + Math.random().toString(36).substring(2, 15),
      createdAt: Timestamp.now(),
      createdBy: 'nova@moondreams.dev',
    });

    console.log('Created sample apps:', app1.id, app2.id);

    // Add sample FAQs
    await addDoc(collection(db, 'faqs'), {
      appId: app1.id,
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on the "Forgot Password" link on the login page and follow the instructions sent to your email.',
      category: 'Account',
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addDoc(collection(db, 'faqs'), {
      appId: app1.id,
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription from your account settings. Navigate to Settings > Billing > Cancel Subscription.',
      category: 'Billing',
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addDoc(collection(db, 'faqs'), {
      appId: app2.id,
      question: 'What are the system requirements?',
      answer: 'The app requires a modern web browser (Chrome, Firefox, Safari, or Edge) and a stable internet connection.',
      category: 'General',
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('Created sample FAQs');
    console.log('Sample data seeding completed successfully!');
    
    return { app1: app1.id, app2: app2.id };
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

// Uncomment and run this in browser console after signing in as admin
// import { seedSampleData } from './lib/firebase/seedData';
// seedSampleData().then(() => console.log('Done!'));
