import { initializeApp, cert, App } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config();

const firebaseApp: App = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export default firebaseApp;
