import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';

// Extend the Express Request type to include our user data
export interface AuthRequest extends Request {
  user?: {
    firebaseUid: string;
    email?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }

    const idToken = authHeader.split(" ")[1];

    const decodedToken = await firebaseAuth.verifyIdToken(idToken); 
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
    };
    //console.log('Authenticated user details:', req.user );
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};