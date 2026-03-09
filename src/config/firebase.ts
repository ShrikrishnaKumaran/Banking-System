import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify that our environment variables exist before starting the server
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase environment variables! Check your .env file.");
}

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The replace function is CRITICAL. It ensures the \n characters in your .env are treated as actual line breaks.
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// Export the auth module so we can use it in our middleware
export const firebaseAuth = admin.auth();

console.log("🔥 Firebase Admin Initialized Successfully");